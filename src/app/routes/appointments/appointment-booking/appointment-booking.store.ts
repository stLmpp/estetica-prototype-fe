import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { type SyncConfig, withStorageSync } from '@angular-architects/ngrx-toolkit';
import {
  getState,
  patchState,
  signalStore,
  withMethods,
  withState,
  type WritableStateSource,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import dayjs from 'dayjs/esm';
import { catchError, distinctUntilChanged, of, pipe, switchMap, tap } from 'rxjs';
import { extractApiErrorMessage } from '../../../model/api-error';
import { CatalogItemType } from '../../catalog-items/catalog-item-type.enum';
import { CatalogItem } from '../../catalog-items/catalog-item.model';
import { CatalogItemService } from '../../catalog-items/catalog-item.service';
import { Customer } from '../../customers/customer.model';
import { Employee } from '../../employees/employee.model';
import { EmployeeService } from '../../employees/employee.service';
import { AppointmentPayload } from '../appointment.dto';
import { DayScheduleAppointment } from '../appointment.model';
import { AppointmentService } from '../appointment.service';
import { tapResponse } from '@ngrx/operators';

const STORAGE_KEY = 'appointment-booking';
const MAX_LIMIT = 100;
const DEFAULT_DURATION_MINUTES = '60';
const DEFAULT_SERVICES_ERROR_MESSAGE = 'Não foi possível carregar os serviços.';
const DEFAULT_EMPLOYEES_ERROR_MESSAGE = 'Não foi possível carregar os profissionais.';
const DEFAULT_DAY_SCHEDULE_ERROR_MESSAGE = 'Não foi possível carregar a agenda do profissional.';
const DEFAULT_SUBMIT_ERROR_MESSAGE = 'Não foi possível criar o agendamento. Tente novamente.';
const CONFLICT_ERROR_MESSAGE = 'Este profissional já possui um agendamento nesse horário.';

function todayDateInputValue(): string {
  return dayjs().format('YYYY-MM-DD');
}

/**
 * `withStorageSync`'s own `isPlatformServer` check isn't enough: Angular's SSR route
 * extraction step evaluates guards (and therefore constructs this store) in a Node
 * context where `PLATFORM_ID` isn't reliably `'server'`, so it falls through to the
 * real `localStorage` global, which doesn't exist there. Checking for the global
 * directly, in addition to `useStubs`, is what actually prevents the crash.
 */
function browserLocalStorageStrategy<State extends object>() {
  const factory = (
    config: Required<SyncConfig<State>>,
    store: WritableStateSource<State>,
    useStubs: boolean,
  ) => {
    if (useStubs || typeof localStorage === 'undefined') {
      return {
        clearStorage: () => undefined,
        readFromStorage: () => undefined,
        writeToStorage: () => undefined,
      };
    }
    return {
      clearStorage() {
        localStorage.removeItem(config.key);
      },
      readFromStorage() {
        const stateString = localStorage.getItem(config.key);
        if (stateString) {
          patchState(store, config.parse(stateString));
        }
      },
      writeToStorage() {
        // `stringify` is typed as taking the full `State`, but it's meant to receive
        // whatever `select` narrowed it down to — the library's own internal
        // implementation does the same untyped pass-through.
        localStorage.setItem(config.key, config.stringify(config.select(getState(store)) as State));
      },
    };
  };
  factory.type = 'sync' as const;
  return factory;
}

interface AppointmentBookingState {
  customer: Customer | null;
  service: CatalogItem | null;
  employee: Employee | null;
  services: CatalogItem[];
  servicesLoading: boolean;
  servicesErrorMessage: string | null;
  employees: Employee[];
  employeesLoading: boolean;
  employeesErrorMessage: string | null;
  daySchedule: DayScheduleAppointment[];
  dayScheduleLoading: boolean;
  dayScheduleErrorMessage: string | null;
  date: string;
  startTime: string;
  durationMinutes: string;
  notes: string;
  priceApplied: string;
  submitting: boolean;
  submitErrorMessage: string | null;
}

const initialState: AppointmentBookingState = {
  customer: null,
  service: null,
  employee: null,
  services: [],
  servicesLoading: true,
  servicesErrorMessage: null,
  employees: [],
  employeesLoading: false,
  employeesErrorMessage: null,
  daySchedule: [],
  dayScheduleLoading: false,
  dayScheduleErrorMessage: null,
  date: todayDateInputValue(),
  startTime: '09:00',
  durationMinutes: DEFAULT_DURATION_MINUTES,
  notes: '',
  priceApplied: '',
  submitting: false,
  submitErrorMessage: null,
};

export const AppointmentBookingStore = signalStore(
  withState(initialState),
  withStorageSync(
    {
      key: STORAGE_KEY,
      select: (state: AppointmentBookingState) => ({
        customer: state.customer,
        service: state.service,
        employee: state.employee,
        date: state.date,
        startTime: state.startTime,
        durationMinutes: state.durationMinutes,
        notes: state.notes,
        priceApplied: state.priceApplied,
      }),
    },
    browserLocalStorageStrategy<AppointmentBookingState>(),
  ),
  withMethods(
    (
      store,
      catalogItemService = inject(CatalogItemService),
      employeeService = inject(EmployeeService),
      appointmentService = inject(AppointmentService),
    ) => {
      function fetchDaySchedule(date: string) {
        const employee = store.employee();
        if (!employee) {
          return of([]);
        }

        const from = dayjs(date).startOf('day').toISOString();
        const to = dayjs(date).endOf('day').toISOString();

        patchState(store, { dayScheduleLoading: true, dayScheduleErrorMessage: null });

        return appointmentService.getDaySchedule(employee.id, from, to).pipe(
          tapResponse({
            next: (appointments) =>
              patchState(store, { daySchedule: appointments, dayScheduleLoading: false }),
            error: (error: unknown) => {
              patchState(store, {
                dayScheduleLoading: false,
                dayScheduleErrorMessage: extractApiErrorMessage(
                  error,
                  DEFAULT_DAY_SCHEDULE_ERROR_MESSAGE,
                ),
              });
            },
          }),
        );
      }

      return {
        loadServices() {
          patchState(store, { servicesLoading: true, servicesErrorMessage: null });
          return catalogItemService
            .list({
              itemType: CatalogItemType.Service,
              active: true,
              hasEmployees: true,
              limit: MAX_LIMIT,
            })
            .pipe(
              tap((result) => {
                patchState(store, { services: result.items, servicesLoading: false });
              }),
              catchError((error: unknown) => {
                patchState(store, {
                  servicesLoading: false,
                  servicesErrorMessage: extractApiErrorMessage(
                    error,
                    DEFAULT_SERVICES_ERROR_MESSAGE,
                  ),
                });
                return of(null);
              }),
            );
        },

        setCustomer(customer: Customer | null) {
          patchState(store, { customer });
        },

        setService(service: CatalogItem) {
          patchState(store, {
            service,
            employee: null,
            employees: [],
            employeesErrorMessage: null,
            priceApplied: service.defaultPrice || store.priceApplied(),
          });
        },

        loadEmployees(catalogItemId: string) {
          patchState(store, { employeesLoading: true, employeesErrorMessage: null });
          return employeeService.list({ catalogItemId, limit: MAX_LIMIT }).pipe(
            tap((result) => {
              patchState(store, { employees: result.items, employeesLoading: false });
            }),
            catchError((error: unknown) => {
              patchState(store, {
                employeesLoading: false,
                employeesErrorMessage: extractApiErrorMessage(
                  error,
                  DEFAULT_EMPLOYEES_ERROR_MESSAGE,
                ),
              });
              return of(null);
            }),
          );
        },

        setEmployee(employee: Employee) {
          patchState(store, { employee });
        },

        fetchDaySchedule,

        loadDaySchedule: rxMethod<string>(
          pipe(
            distinctUntilChanged(),
            switchMap((date) => fetchDaySchedule(date)),
          ),
        ),

        setSchedule(
          patch: Partial<{
            date: string;
            startTime: string;
            durationMinutes: string;
            notes: string;
            priceApplied: string;
          }>,
        ) {
          patchState(store, patch);
        },

        submit() {
          const customer = store.customer();
          const service = store.service();
          const employee = store.employee();
          if (!customer || !service || !employee) {
            return of(null);
          }

          const startDate = dayjs(`${store.date()}T${store.startTime()}`);
          const endDate = startDate.add(Number(store.durationMinutes()), 'minute');

          const payload: AppointmentPayload = {
            customerId: customer.id,
            employeeId: employee.id,
            catalogItemId: service.id,
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
            notes: store.notes().trim() || undefined,
            priceApplied: store.priceApplied().trim() || undefined,
          };

          patchState(store, { submitting: true, submitErrorMessage: null });

          return appointmentService.create(payload).pipe(
            tap(() => {
              patchState(store, { submitting: false });
            }),
            catchError((error: unknown) => {
              patchState(store, {
                submitting: false,
                submitErrorMessage:
                  error instanceof HttpErrorResponse && error.status === 409
                    ? CONFLICT_ERROR_MESSAGE
                    : extractApiErrorMessage(error, DEFAULT_SUBMIT_ERROR_MESSAGE),
              });
              return of(null);
            }),
          );
        },

        reset() {
          patchState(store, initialState);
          store.clearStorage();
        },
      };
    },
  ),
);

export type AppointmentBookingStore = InstanceType<typeof AppointmentBookingStore>;
