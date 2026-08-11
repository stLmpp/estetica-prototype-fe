import { computed, inject } from '@angular/core';
import {
  patchState,
  signalMethod,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
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
import { extractApiErrorMessage } from '../../model/api-error';
import { EmployeePayload, UpdateEmployeePayload } from './employee.dto';
import { Employee } from './employee.model';
import { EmployeeService } from './employee.service';

export const PAGE_SIZE = 10;
const DEFAULT_ERROR_MESSAGE = 'Não foi possível carregar os funcionários.';
const DEFAULT_DELETE_ERROR_MESSAGE = 'Não foi possível excluir o funcionário.';

interface EmployeesMeta {
  total: number;
  page: number;
  name: string;
  reloadTrigger: number;
  loading: boolean;
  errorMessage: string | null;
}

const initialMeta: EmployeesMeta = {
  total: 0,
  page: 1,
  name: '',
  reloadTrigger: 0,
  loading: true,
  errorMessage: null,
};

interface LoadParams {
  name: string;
  page: number;
}

export const EmployeesStore = signalStore(
  withEntities<Employee>(),
  withState(initialMeta),
  withMethods((store, employeeService = inject(EmployeeService)) => ({
    load: rxMethod<LoadParams>(
      pipe(
        tap(() => patchState(store, { loading: true, errorMessage: null })),
        switchMap(({ name, page }) =>
          employeeService.list({ page, limit: PAGE_SIZE, name: name || undefined }).pipe(
            tapResponse({
              next: (result) => {
                patchState(store, setAllEntities(result.items));
                patchState(store, { total: result.meta.total, page });
              },
              error: (error: unknown) => {
                patchState(store, setAllEntities<Employee>([]));
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

    setSearch: signalMethod<string>((name) => {
      const trimmed = name.trim();
      if (trimmed === store.name()) {
        return;
      }
      patchState(store, { name: trimmed, page: 1 });
    }),

    setPage(page: number) {
      patchState(store, { page });
    },

    createEmployee(payload: EmployeePayload) {
      return employeeService.create(payload).pipe(
        tap((employee) => {
          patchState(
            store,
            prependEntity({ id: employee.id, name: employee.name, role: employee.role }),
          );
          patchState(store, (state) => ({ total: state.total + 1 }));

          const entities = store.entities();
          const lastEntity = entities.at(-1);
          if (entities.length > PAGE_SIZE && lastEntity) {
            patchState(store, removeEntity(lastEntity.id));
          }
        }),
      );
    },

    updateEmployee(employeeId: string, payload: UpdateEmployeePayload) {
      return employeeService.update(employeeId, payload).pipe(
        tap(() => {
          const changes: Partial<Employee> = {};
          if (payload.name !== undefined) {
            changes.name = payload.name;
          }
          if (payload.role !== undefined) {
            changes.role = payload.role;
          }
          if (Object.keys(changes).length) {
            patchState(store, updateEntity({ id: employeeId, changes }));
          }
        }),
      );
    },

    deleteEmployee(employee: Employee) {
      patchState(store, { loading: true, errorMessage: null });

      return employeeService.delete(employee.id).pipe(
        tapResponse({
          next: () => {
            // Left true here: the page/reloadTrigger change below re-triggers `load`,
            // which owns turning it back off once the refreshed list arrives.
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
          return { name: store.name(), page: store.page() };
        }),
      );
    },
  }),
);
