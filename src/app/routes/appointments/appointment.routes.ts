import { Routes } from '@angular/router';
import {
  hasPermissionGuard,
  requireAuthenticatedWithOrganizationGuard,
} from '../../core/auth/auth.guards';
import { appointmentBookingCanDeactivateGuard } from './appointment-booking/appointment-booking-can-deactivate.guard';
import {
  appointmentBookingStepGuard,
  BOOKING_STEP_REQUIREMENTS,
} from './appointment-booking/appointment-booking-step.guard';
import {
  professionalStepEmployeesResolver,
  scheduleDayScheduleResolver,
  serviceStepServicesResolver,
} from './appointment-booking/appointment-booking.resolvers';
import {
  appointmentsEmployeesResolver,
  appointmentsServicesResolver,
} from './appointments.resolvers';
import { appointmentDetailsResolver } from './appointment-details/appointment-details.resolver';

export const APPOINTMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./appointments.component').then((m) => m.AppointmentsComponent),
    canActivate: [
      requireAuthenticatedWithOrganizationGuard(),
      hasPermissionGuard({ orgPermissions: { appointment: ['get'] } }),
    ],
    resolve: {
      services: appointmentsServicesResolver(),
      employees: appointmentsEmployeesResolver(),
    },
  },
  {
    path: 'calendar',
    loadComponent: () =>
      import('./appointments-calendar/appointments-calendar.component').then(
        (m) => m.AppointmentsCalendarComponent,
      ),
    canActivate: [
      requireAuthenticatedWithOrganizationGuard(),
      hasPermissionGuard({ orgPermissions: { appointment: ['get'] } }),
    ],
    resolve: {
      employees: appointmentsEmployeesResolver(),
    },
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./appointment-booking/appointment-booking.component').then(
        (m) => m.AppointmentBookingComponent,
      ),
    canActivate: [
      requireAuthenticatedWithOrganizationGuard(),
      hasPermissionGuard({ orgPermissions: { appointment: ['create'] } }),
    ],
    canDeactivate: [appointmentBookingCanDeactivateGuard()],
    children: [
      { path: '', redirectTo: 'customer', pathMatch: 'full' },
      {
        path: 'customer',
        data: { index: 0 },
        loadComponent: () =>
          import('./appointment-booking/steps/customer-step/customer-step.component').then(
            (m) => m.CustomerStepComponent,
          ),
      },
      {
        path: 'service',
        data: { index: 1 },
        canActivate: [appointmentBookingStepGuard(BOOKING_STEP_REQUIREMENTS[1])],
        resolve: { services: serviceStepServicesResolver() },
        loadComponent: () =>
          import('./appointment-booking/steps/service-step/service-step.component').then(
            (m) => m.ServiceStepComponent,
          ),
      },
      {
        path: 'professional',
        data: { index: 2 },
        canActivate: [appointmentBookingStepGuard(BOOKING_STEP_REQUIREMENTS[2])],
        resolve: { employees: professionalStepEmployeesResolver() },
        loadComponent: () =>
          import('./appointment-booking/steps/professional-step/professional-step.component').then(
            (m) => m.ProfessionalStepComponent,
          ),
      },
      {
        path: 'schedule',
        data: { index: 3 },
        canActivate: [appointmentBookingStepGuard(BOOKING_STEP_REQUIREMENTS[3])],
        resolve: { daySchedule: scheduleDayScheduleResolver() },
        loadComponent: () =>
          import('./appointment-booking/steps/schedule-step/schedule-step.component').then(
            (m) => m.ScheduleStepComponent,
          ),
      },
      {
        path: 'review',
        data: { index: 4 },
        canActivate: [appointmentBookingStepGuard(BOOKING_STEP_REQUIREMENTS[4])],
        loadComponent: () =>
          import('./appointment-booking/steps/review-step/review-step.component').then(
            (m) => m.ReviewStepComponent,
          ),
      },
    ],
  },
  {
    path: ':appointmentId',
    loadComponent: () =>
      import('./appointment-details/appointment-details.component').then(
        (m) => m.AppointmentDetailsComponent,
      ),
    canActivate: [
      requireAuthenticatedWithOrganizationGuard(),
      hasPermissionGuard({ orgPermissions: { appointment: ['get'] } }),
    ],
    resolve: {
      appointment: appointmentDetailsResolver(),
    },
  },
];
