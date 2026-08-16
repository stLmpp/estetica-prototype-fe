import { Routes } from '@angular/router';
import { hasPermissionGuard, requireAuthenticatedWithOrganizationGuard } from '../../core/auth/auth.guards';

export const SALE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./sales.component').then((m) => m.SalesComponent),
    canActivate: [
      requireAuthenticatedWithOrganizationGuard(),
      hasPermissionGuard({ orgPermissions: { sale: ['get'] } }),
    ],
  },
  {
    path: 'new',
    loadComponent: () => import('./sale-form/sale-form.component').then((m) => m.SaleFormComponent),
    canActivate: [
      requireAuthenticatedWithOrganizationGuard(),
      hasPermissionGuard({ orgPermissions: { sale: ['create'] } }),
    ],
  },
  {
    path: ':saleId',
    loadComponent: () =>
      import('./sale-details/sale-details.component').then((m) => m.SaleDetailsComponent),
    canActivate: [
      requireAuthenticatedWithOrganizationGuard(),
      hasPermissionGuard({ orgPermissions: { sale: ['get'] } }),
    ],
  },
];
