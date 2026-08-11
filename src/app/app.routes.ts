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
