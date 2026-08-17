import { Routes } from '@angular/router';
import { hasPermissionGuard, requireAuthenticatedWithOrganizationGuard } from '../../core/auth/auth.guards';
import { customerDetailsResolver } from './customer-details/customer-details.resolver';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./customers.component').then((m) => m.CustomersComponent),
    canActivate: [
      requireAuthenticatedWithOrganizationGuard(),
      hasPermissionGuard({ orgPermissions: { customer: ['get'] } }),
    ],
  },
  {
    path: ':customerId',
    loadComponent: () =>
      import('./customer-details/customer-details.component').then(
        (m) => m.CustomerDetailsComponent,
      ),
    canActivate: [
      requireAuthenticatedWithOrganizationGuard(),
      hasPermissionGuard({ orgPermissions: { customer: ['get'] } }),
    ],
    resolve: {
      customer: customerDetailsResolver(),
    },
    children: [
      { path: '', redirectTo: 'info', pathMatch: 'full' },
      {
        path: 'info',
        loadComponent: () =>
          import('./customer-details/customer-info-tab/customer-info-tab.component').then(
            (m) => m.CustomerInfoTabComponent,
          ),
      },
      {
        path: 'phones',
        loadComponent: () =>
          import('./customer-details/customer-phones-tab/customer-phones-tab.component').then(
            (m) => m.CustomerPhonesTabComponent,
          ),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import(
            './customer-details/customer-appointments-tab/customer-appointments-tab.component'
          ).then((m) => m.CustomerAppointmentsTabComponent),
        canActivate: [hasPermissionGuard({ orgPermissions: { appointment: ['get'] } })],
      },
      {
        path: 'sales',
        loadComponent: () =>
          import('./customer-details/customer-sales-tab/customer-sales-tab.component').then(
            (m) => m.CustomerSalesTabComponent,
          ),
        canActivate: [hasPermissionGuard({ orgPermissions: { sale: ['get'] } })],
      },
    ],
  },
];
