import { computed, inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import {
  prependEntity,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { extractApiErrorMessage } from '../../../../model/api-error';
import { CustomerDetailsStore } from '../customer-details.store';
import { CustomerAnamnesis } from './customer-anamnesis.model';
import { CustomerAnamnesisService } from './customer-anamnesis.service';

export const PAGE_SIZE = 10;
const DEFAULT_ERROR_MESSAGE = 'Não foi possível carregar as anamneses do cliente.';
const DEFAULT_DELETE_ERROR_MESSAGE = 'Não foi possível excluir a anamnese.';

interface CustomerAnamnesisTabMeta {
  total: number;
  page: number;
  reloadTrigger: number;
  loading: boolean;
  errorMessage: string | null;
}

const initialMeta: CustomerAnamnesisTabMeta = {
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

export const CustomerAnamnesisTabStore = signalStore(
  withEntities<CustomerAnamnesis>(),
  withState(initialMeta),
  withMethods((store, customerAnamnesisService = inject(CustomerAnamnesisService)) => ({
    load: rxMethod<LoadParams>(
      pipe(
        tap(() => patchState(store, { loading: true, errorMessage: null })),
        switchMap(({ customerId, page }) =>
          customerAnamnesisService.list(customerId, { page, limit: PAGE_SIZE }).pipe(
            tapResponse({
              next: (result) => {
                patchState(store, setAllEntities(result.items));
                patchState(store, { total: result.meta.total, page });
              },
              error: (error: unknown) => {
                patchState(store, setAllEntities<CustomerAnamnesis>([]));
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

    addRecord(record: CustomerAnamnesis) {
      patchState(store, prependEntity(record));
      patchState(store, (state) => ({ total: state.total + 1 }));

      const entities = store.entities();
      const lastEntity = entities.at(-1);
      if (entities.length > PAGE_SIZE && lastEntity) {
        patchState(store, removeEntity(lastEntity.id));
      }
    },

    patchRecord(recordId: string, changes: Partial<CustomerAnamnesis>) {
      patchState(store, updateEntity({ id: recordId, changes }));
    },

    deleteRecord(customerId: string, record: CustomerAnamnesis) {
      patchState(store, { loading: true, errorMessage: null });

      return customerAnamnesisService.delete(customerId, record.id).pipe(
        tapResponse({
          next: () => {
            const isLastOnPage = store.entities().length === 1 && store.page() > 1;
            if (isLastOnPage) {
              patchState(store, (state) => ({ page: state.page - 1 }));
            } else {
              patchState(store, (state) => ({ reloadTrigger: state.reloadTrigger + 1 }));
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
