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
  },
];
