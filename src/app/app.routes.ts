import { Router, Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from './core/better-auth/auth.store';
import { OrganizationService } from './core/better-auth/organization.service';

function requireAuthenticatedWithOrganization() {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const session = authStore.session();

  if (!session) {
    return router.createUrlTree(['/login']);
  }

  if (!session.activeOrganization) {
    return router.createUrlTree(['/organizations']);
  }

  return true;
}

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./routes/home/home.component').then((m) => m.HomeComponent),
    canActivate: [requireAuthenticatedWithOrganization],
  },
  {
    path: 'login',
    loadComponent: () => import('./routes/login/login.component').then((m) => m.LoginComponent),
    canActivate: [
      () => {
        const authStore = inject(AuthStore);
        const router = inject(Router);

        const session = authStore.session();

        if (!session) {
          return true;
        }

        if (!session.activeOrganization) {
          return router.createUrlTree(['/organizations']);
        }

        return router.createUrlTree(['/']);
      },
    ],
  },
  {
    path: 'organizations',
    loadComponent: () =>
      import('./routes/organizations/organizations.component').then(
        (m) => m.OrganizationsComponent,
      ),
    canActivate: [
      () => {
        const authStore = inject(AuthStore);
        const router = inject(Router);

        const session = authStore.session();

        if (!session) {
          return router.createUrlTree(['/login']);
        }

        return true;
      },
    ],
    resolve: [() => inject(OrganizationService).list()],
  },
  {
    path: 'catalog-items',
    loadComponent: () =>
      import('./routes/catalog-items/catalog-items.component').then((m) => m.CatalogItemsComponent),
    canActivate: [requireAuthenticatedWithOrganization],
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
