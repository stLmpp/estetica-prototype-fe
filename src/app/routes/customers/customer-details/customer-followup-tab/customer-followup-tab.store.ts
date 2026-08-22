import { computed, inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { removeEntity, setAllEntities, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { extractApiErrorMessage } from '../../../../model/api-error';
import { CustomerDetailsStore } from '../customer-details.store';
import { CustomerFollowupListItem } from './customer-followup.model';
import { CustomerFollowupService } from './customer-followup.service';

export const PAGE_SIZE = 10;
const DEFAULT_ERROR_MESSAGE = 'Não foi possível carregar os follow-ups do cliente.';
const DEFAULT_DELETE_ERROR_MESSAGE = 'Não foi possível excluir o follow-up.';

interface CustomerFollowupTabMeta {
  total: number;
  page: number;
  reloadTrigger: number;
  loading: boolean;
  errorMessage: string | null;
}

const initialMeta: CustomerFollowupTabMeta = {
  total: 0,
  page: 1,
  reloadTrigger: 0,
  loading: true,
  errorMessage: null,
};

interface LoadParams {
  customerId: string;
  page: number;
}

export const CustomerFollowupTabStore = signalStore(
  withEntities<CustomerFollowupListItem>(),
  withState(initialMeta),
  withMethods((store, customerFollowupService = inject(CustomerFollowupService)) => ({
    load: rxMethod<LoadParams>(
      pipe(
        tap(() => patchState(store, { loading: true, errorMessage: null })),
        switchMap(({ customerId, page }) =>
          customerFollowupService.list({ customerId, page, limit: PAGE_SIZE }).pipe(
            tapResponse({
              next: (result) => {
                patchState(store, setAllEntities(result.items));
                patchState(store, { total: result.meta.total, page });
              },
              error: (error: unknown) => {
                patchState(store, setAllEntities<CustomerFollowupListItem>([]));
                patchState(store, {
                  total: 0,
                  page,
                  errorMessage: extractApiErrorMessage(error, DEFAULT_ERROR_MESSAGE),
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    setPage(page: number) {
      patchState(store, { page });
    },

    deleteRecord(record: CustomerFollowupListItem) {
      patchState(store, { loading: true, errorMessage: null });

      return customerFollowupService.delete(record.id).pipe(
        tapResponse({
          next: () => {
            const isLastOnPage = store.entities().length === 1 && store.page() > 1;
            const isFullPage = store.entities().length === PAGE_SIZE;
            if (isLastOnPage) {
              patchState(store, (state) => ({ page: state.page - 1 }));
            } else if (isFullPage) {
              patchState(store, (state) => ({ reloadTrigger: state.reloadTrigger + 1 }));
            } else {
              patchState(store, removeEntity(record.id));
              patchState(store, (state) => ({ total: state.total - 1, loading: false }));
            }
          },
          error: (error: unknown) => {
            patchState(store, {
              loading: false,
              errorMessage: extractApiErrorMessage(error, DEFAULT_DELETE_ERROR_MESSAGE),
            });
          },
        }),
      );
    },
  })),
  withHooks({
    onInit(store) {
      const customerDetailsStore = inject(CustomerDetailsStore);
      store.load(
        computed(() => {
          store.reloadTrigger();
          return { customerId: customerDetailsStore.customerId(), page: store.page() };
        }),
      );
    },
  }),
);
