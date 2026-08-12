import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import {
  hasPermissionGuard,
  redirectIfAuthenticatedGuard,
  requireAuthenticatedGuard,
  requireAuthenticatedWithOrganizationGuard,
} from './core/auth/auth.guards';
import { OrganizationService } from './core/auth/organization.service';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./routes/home/home.component').then((m) => m.HomeComponent),
    canActivate: [requireAuthenticatedWithOrganizationGuard()],
  },
  {
    path: 'login',
    loadComponent: () => import('./routes/login/login.component').then((m) => m.LoginComponent),
    canActivate: [redirectIfAuthenticatedGuard()],
  },
  {
    path: 'organizations',
    loadComponent: () =>
      import('./routes/organizations/organizations.component').then(
        (m) => m.OrganizationsComponent,
      ),
    canActivate: [requireAuthenticatedGuard()],
    resolve: [() => inject(OrganizationService).list()],
  },
  {
    path: 'catalog-items',
    loadComponent: () =>
      import('./routes/catalog-items/catalog-items.component').then((m) => m.CatalogItemsComponent),
    canActivate: [
      requireAuthenticatedWithOrganizationGuard(),
      hasPermissionGuard({ orgPermissions: { catalogItem: ['get'] } }),
    ],
  },
  {
    path: 'customers',
    loadComponent: () =>
      import('./routes/customers/customers.component').then((m) => m.CustomersComponent),
    canActivate: [
      requireAuthenticatedWithOrganizationGuard(),
      hasPermissionGuard({ orgPermissions: { customer: ['get'] } }),
    ],
  },
  // TODO(claude) create employee.routes.ts to handle employee routes
  {
    path: 'employees',
    loadComponent: () =>
      import('./routes/employees/employees.component').then((m) => m.EmployeesComponent),
    canActivate: [
      requireAuthenticatedWithOrganizationGuard(),
      hasPermissionGuard({ orgPermissions: { employee: ['get'] } }),
    ],
  },
  {
    path: 'employees/:employeeId',
    loadComponent: () =>
      import('./routes/employees/employee-details/employee-details.component').then(
        (m) => m.EmployeeDetailsComponent,
      ),
    canActivate: [
      requireAuthenticatedWithOrganizationGuard(),
      hasPermissionGuard({ orgPermissions: { employee: ['get'] } }),
    ],
  },
  // TODO(claude) create appointments.routes.ts to handle appointment routes
  {
    path: 'appointments',
    loadComponent: () =>
      import('./routes/appointments/appointments.component').then((m) => m.AppointmentsComponent),
    canActivate: [
      requireAuthenticatedWithOrganizationGuard(),
      hasPermissionGuard({ orgPermissions: { appointment: ['get'] } }),
    ],
  },
  {
    path: 'appointments/new',
    loadComponent: () =>
      import('./routes/appointments/appointment-booking/appointment-booking.component').then(
        (m) => m.AppointmentBookingComponent,
      ),
    canActivate: [
      requireAuthenticatedWithOrganizationGuard(),
      hasPermissionGuard({ orgPermissions: { appointment: ['create'] } }),
    ],
    children: [
      { path: '', redirectTo: 'customer', pathMatch: 'full' },
      {
        path: 'customer',
        loadComponent: () =>
          import('./routes/appointments/appointment-booking/steps/customer-step/customer-step.component').then(
            (m) => m.CustomerStepComponent,
          ),
      },
      {
        path: 'service',
        loadComponent: () =>
          import('./routes/appointments/appointment-booking/steps/service-step/service-step.component').then(
            (m) => m.ServiceStepComponent,
          ),
      },
      {
        path: 'professional',
        loadComponent: () =>
          import('./routes/appointments/appointment-booking/steps/professional-step/professional-step.component').then(
            (m) => m.ProfessionalStepComponent,
          ),
      },
      {
        path: 'schedule',
        loadComponent: () =>
          import('./routes/appointments/appointment-booking/steps/schedule-step/schedule-step.component').then(
            (m) => m.ScheduleStepComponent,
          ),
      },
      {
        path: 'review',
        loadComponent: () =>
          import('./routes/appointments/appointment-booking/steps/review-step/review-step.component').then(
            (m) => m.ReviewStepComponent,
          ),
      },
    ],
  },
  {
    path: 'raw-ds',
    loadComponent: () => import('./temp.component').then((m) => m.TempComponent),
  },
  {
    path: 'ds',
    loadComponent: () => import('./ds.component').then((m) => m.DsComponent),
  },
  {
    path: '**',
    redirectTo: '/',
  },
];
