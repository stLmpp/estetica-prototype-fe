import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { catchError, of, tap } from 'rxjs';
import { extractApiErrorMessage } from '../../../model/api-error';
import { CatalogItemType } from '../../catalog-items/catalog-item-type.enum';
import { CatalogItem } from '../../catalog-items/catalog-item.model';
import { CatalogItemService } from '../../catalog-items/catalog-item.service';
import { Customer } from '../../customers/customer.model';
import { Employee } from '../../employees/employee.model';
import { EmployeeService } from '../../employees/employee.service';
import { AppointmentPayload } from '../appointment.dto';
import { AppointmentService } from '../appointment.service';

const MAX_LIMIT = 100;
const DEFAULT_DURATION_MINUTES = '60';
const DEFAULT_SERVICES_ERROR_MESSAGE = 'Não foi possível carregar os serviços.';
const DEFAULT_EMPLOYEES_ERROR_MESSAGE = 'Não foi possível carregar os profissionais.';
const DEFAULT_SUBMIT_ERROR_MESSAGE = 'Não foi possível criar o agendamento. Tente novamente.';
const CONFLICT_ERROR_MESSAGE = 'Este profissional já possui um agendamento nesse horário.';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

// TODO(claude) use dayjs
function todayDateInputValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
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
  withMethods(
    (
      store,
      catalogItemService = inject(CatalogItemService),
      employeeService = inject(EmployeeService),
      appointmentService = inject(AppointmentService),
    ) => ({
      loadServices() {
        patchState(store, { servicesLoading: true, servicesErrorMessage: null });
        catalogItemService
          .list({
            itemType: CatalogItemType.Service,
            active: true,
            hasEmployees: true,
            limit: MAX_LIMIT,
          })
          .subscribe({
            next: (result) => {
              patchState(store, { services: result.items, servicesLoading: false });
            },
            error: (error: unknown) => {
              patchState(store, {
                servicesLoading: false,
                servicesErrorMessage: extractApiErrorMessage(error, DEFAULT_SERVICES_ERROR_MESSAGE),
              });
            },
          });
      },

      setCustomer(customer: Customer | null) {
        patchState(store, { customer });
      },

      setService(service: CatalogItem) {
        patchState(store, {
          service,
          employee: null,
          employees: [],
          priceApplied: service.defaultPrice || store.priceApplied(),
        });

        patchState(store, { employeesLoading: true, employeesErrorMessage: null });
        employeeService.list({ catalogItemId: service.id, limit: MAX_LIMIT }).subscribe({
          next: (result) => {
            patchState(store, { employees: result.items, employeesLoading: false });
          },
          error: (error: unknown) => {
            patchState(store, {
              employeesLoading: false,
              employeesErrorMessage: extractApiErrorMessage(error, DEFAULT_EMPLOYEES_ERROR_MESSAGE),
            });
          },
        });
      },

      setEmployee(employee: Employee) {
        patchState(store, { employee });
      },

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

        // TODO(claude) use dayjs
        const startDate = new Date(`${store.date()}T${store.startTime()}:00`);
        // TODO(claude) use dayjs
        const endDate = new Date(startDate.getTime() + Number(store.durationMinutes()) * 60_000);

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
          tap(() => patchState(store, { submitting: false })),
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
    }),
  ),
  withHooks({
    onInit(store) {
      store.loadServices();
    },
  }),
);
