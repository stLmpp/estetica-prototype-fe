import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap } from 'rxjs';
import dayjs from 'dayjs/esm';
import { extractApiErrorMessage } from '../../../model/api-error';
import { AppointmentService } from '../appointment.service';
import { CalendarAppointment } from '../appointment.model';

export type CalendarView = 'day' | 'week' | 'month';

const DEFAULT_ERROR_MESSAGE = 'Não foi possível carregar os agendamentos.';
const DATE_FORMAT = 'YYYY-MM-DD';

interface AppointmentsCalendarState {
  view: CalendarView;
  anchorDate: string;
  employeeId: string;
  appointments: CalendarAppointment[];
  loading: boolean;
  errorMessage: string | null;
}

const initialState: AppointmentsCalendarState = {
  view: 'week',
  anchorDate: dayjs().format(DATE_FORMAT),
  employeeId: '',
  appointments: [],
  loading: true,
  errorMessage: null,
};

function computeRange(view: CalendarView, anchorDate: string) {
  const anchor = dayjs(anchorDate);
  if (view === 'day') {
    return { from: anchor.startOf('day'), to: anchor.endOf('day') };
  }
  if (view === 'week') {
    return { from: anchor.startOf('week'), to: anchor.endOf('week') };
  }
  return {
    from: anchor.startOf('month').startOf('week'),
    to: anchor.endOf('month').endOf('week'),
  };
}

function shiftAnchor(view: CalendarView, anchorDate: string, direction: 1 | -1): string {
  const unit = view === 'day' ? 'day' : view === 'week' ? 'week' : 'month';
  return dayjs(anchorDate).add(direction, unit).format(DATE_FORMAT);
}

export const AppointmentsCalendarStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    range: computed(() => {
      const { from, to } = computeRange(store.view(), store.anchorDate());
      return { from: from.toISOString(), to: to.toISOString() };
    }),
  })),
  withMethods((store, appointmentService = inject(AppointmentService)) => {
    function fetchAppointments(params: { from: string; to: string; employeeId: string }) {
      patchState(store, { loading: true, errorMessage: null });
      return appointmentService
        .getCalendarRange(params.from, params.to, params.employeeId || null)
        .pipe(
          tapResponse({
            next: (appointments) => patchState(store, { appointments, loading: false }),
            error: (error: unknown) =>
              patchState(store, {
                appointments: [],
                loading: false,
                errorMessage: extractApiErrorMessage(error, DEFAULT_ERROR_MESSAGE),
              }),
          }),
        );
    }

    return {
      fetchAppointments,
      loadAppointments: rxMethod<{ from: string; to: string; employeeId: string }>(
        pipe(switchMap(fetchAppointments)),
      ),

      setView(view: CalendarView) {
        patchState(store, { view });
      },

      setEmployeeId(employeeId: string) {
        patchState(store, { employeeId });
      },

      goToday() {
        patchState(store, { anchorDate: dayjs().format(DATE_FORMAT) });
      },

      goPrevious() {
        patchState(store, (state) => ({
          anchorDate: shiftAnchor(state.view, state.anchorDate, -1),
        }));
      },

      goNext() {
        patchState(store, (state) => ({
          anchorDate: shiftAnchor(state.view, state.anchorDate, 1),
        }));
      },
    };
  }),
  withHooks({
    onInit(store) {
      store.loadAppointments(
        computed(() => ({
          from: store.range().from,
          to: store.range().to,
          employeeId: store.employeeId(),
        })),
      );
    },
  }),
);
