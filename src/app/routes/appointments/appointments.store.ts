import { computed, inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { prependEntity, removeEntity, setAllEntities, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { extractApiErrorMessage } from '../../model/api-error';
import { AppointmentStatus } from './appointment-status.enum';
import { Appointment } from './appointment.model';
import { AppointmentService } from './appointment.service';

export const PAGE_SIZE = 10;
const DEFAULT_ERROR_MESSAGE = 'Não foi possível carregar os agendamentos.';
const DEFAULT_UPDATE_STATUS_ERROR_MESSAGE = 'Não foi possível cancelar o agendamento.';

export interface AppointmentsFilters {
  status: AppointmentStatus | '';
  customerId: string;
  employeeId: string;
  catalogItemId: string;
  from: string;
  to: string;
}

interface AppointmentsMeta extends AppointmentsFilters {
  total: number;
  page: number;
  reloadTrigger: number;
  loading: boolean;
  errorMessage: string | null;
}

const initialMeta: AppointmentsMeta = {
  total: 0,
  page: 1,
  status: '',
  customerId: '',
  employeeId: '',
  catalogItemId: '',
  from: '',
  to: '',
  reloadTrigger: 0,
  loading: true,
  errorMessage: null,
};

type LoadParams = AppointmentsFilters & { page: number };

export const AppointmentsStore = signalStore(
  withEntities<Appointment>(),
  withState(initialMeta),
  withMethods((store, appointmentService = inject(AppointmentService)) => ({
    load: rxMethod<LoadParams>(
      pipe(
        tap(() => patchState(store, { loading: true, errorMessage: null })),
        switchMap(({ status, customerId, employeeId, catalogItemId, from, to, page }) =>
          appointmentService
            .list({
              page,
              limit: PAGE_SIZE,
              status: status || undefined,
              customerId: customerId || undefined,
              employeeId: employeeId || undefined,
              catalogItemId: catalogItemId || undefined,
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
                  patchState(store, setAllEntities<Appointment>([]));
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

    setFilters(filters: Partial<AppointmentsFilters>) {
      patchState(store, { ...filters, page: 1 });
    },

    setPage(page: number) {
      patchState(store, { page });
    },

    addAppointment(appointment: Appointment) {
      patchState(store, prependEntity(appointment));
      patchState(store, (state) => ({ total: state.total + 1 }));

      const entities = store.entities();
      const lastEntity = entities.at(-1);
      if (entities.length > PAGE_SIZE && lastEntity) {
        patchState(store, removeEntity(lastEntity.id));
      }
    },

    cancelAppointment(appointment: Appointment) {
      patchState(store, { loading: true, errorMessage: null });

      return appointmentService
        .updateStatus(appointment.id, { status: AppointmentStatus.Cancelled })
        .pipe(
          tapResponse({
            next: () => {
              patchState(store, (state) => ({ reloadTrigger: state.reloadTrigger + 1 }));
            },
            error: (error: unknown) => {
              patchState(store, {
                loading: false,
                errorMessage: extractApiErrorMessage(error, DEFAULT_UPDATE_STATUS_ERROR_MESSAGE),
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
            catalogItemId: store.catalogItemId(),
            from: store.from(),
            to: store.to(),
            page: store.page(),
          };
        }),
      );
    },
  }),
);
