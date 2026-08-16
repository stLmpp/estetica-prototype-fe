import { computed, inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { extractApiErrorMessage } from '../../model/api-error';
import { Sale } from './sale.model';
import { SaleService } from './sale.service';
import { SaleStatus } from './sale-status.enum';

export const PAGE_SIZE = 10;
const DEFAULT_ERROR_MESSAGE = 'Não foi possível carregar as vendas.';
const DEFAULT_DELETE_ERROR_MESSAGE = 'Não foi possível excluir a venda.';

export interface SalesFilters {
  status: SaleStatus | '';
  customerId: string;
  employeeId: string;
  from: string;
  to: string;
}

interface SalesMeta extends SalesFilters {
  total: number;
  page: number;
  reloadTrigger: number;
  loading: boolean;
  errorMessage: string | null;
}

const initialMeta: SalesMeta = {
  total: 0,
  page: 1,
  status: '',
  customerId: '',
  employeeId: '',
  from: '',
  to: '',
  reloadTrigger: 0,
  loading: true,
  errorMessage: null,
};

type LoadParams = SalesFilters & { page: number };

export const SalesStore = signalStore(
  withEntities<Sale>(),
  withState(initialMeta),
  withMethods((store, saleService = inject(SaleService)) => ({
    load: rxMethod<LoadParams>(
      pipe(
        tap(() => patchState(store, { loading: true, errorMessage: null })),
        switchMap(({ status, customerId, employeeId, from, to, page }) =>
          saleService
            .list({
              page,
              limit: PAGE_SIZE,
              status: status || undefined,
              customerId: customerId || undefined,
              employeeId: employeeId || undefined,
              from: from || undefined,
              to: to || undefined,
            })
            .pipe(
              tapResponse({
                next: (result) => {
                  patchState(store, setAllEntities(result.items));
                  patchState(store, { total: result.meta.total, page });
                },
                error: (error: unknown) => {
                  patchState(store, setAllEntities<Sale>([]));
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

    setFilters(filters: Partial<SalesFilters>) {
      patchState(store, { ...filters, page: 1 });
    },

    setPage(page: number) {
      patchState(store, { page });
    },

    deleteSale(sale: Sale) {
      patchState(store, { loading: true, errorMessage: null });

      return saleService.delete(sale.id).pipe(
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
      store.load(
        computed(() => {
          store.reloadTrigger();
          return {
            status: store.status(),
            customerId: store.customerId(),
            employeeId: store.employeeId(),
            from: store.from(),
            to: store.to(),
            page: store.page(),
          };
        }),
      );
    },
  }),
);
