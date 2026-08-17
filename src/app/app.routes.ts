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
    path: 'anamnesis-forms',
    loadChildren: () =>
      import('./routes/anamnesis-forms/anamnesis-forms.routes').then(
        (m) => m.ANAMNESIS_FORM_ROUTES,
      ),
  },
  {
    path: 'customers',
    loadChildren: () => import('./routes/customers/customer.routes').then((m) => m.CUSTOMER_ROUTES),
  },
  {
    path: 'employees',
    loadChildren: () => import('./routes/employees/employee.routes').then((m) => m.EMPLOYEE_ROUTES),
  },
  {
    path: 'appointments',
    loadChildren: () =>
      import('./routes/appointments/appointment.routes').then((m) => m.APPOINTMENT_ROUTES),
  },
  {
    path: 'sales',
    loadChildren: () => import('./routes/sales/sale.routes').then((m) => m.SALE_ROUTES),
  },
  {
    path: 'settings',
    canActivate: [requireAuthenticatedWithOrganizationGuard()],
    children: [
      { path: '', redirectTo: 'organization', pathMatch: 'full' },
      {
        path: 'organization',
        loadComponent: () =>
          import('./routes/settings/organization-settings.component').then(
            (m) => m.OrganizationSettingsComponent,
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
