import { Router, Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthQuery } from './core/better-auth/auth.query';
import { OrganizationService } from './core/better-auth/organization.service';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./routes/home/home.component').then((m) => m.HomeComponent),
    canActivate: [
      () => {
        const authQuery = inject(AuthQuery);
        const router = inject(Router);

        const session = authQuery.session();

        if (!session) {
          return router.createUrlTree(['/login']);
        }

        if (!session.activeOrganization) {
          return router.createUrlTree(['/organizations']);
        }

        return true;
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () => import('./routes/login/login.component').then((m) => m.LoginComponent),
    canActivate: [
      () => {
        const authQuery = inject(AuthQuery);
        const router = inject(Router);

        const session = authQuery.session();

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
        const authQuery = inject(AuthQuery);
        const router = inject(Router);

        const session = authQuery.session();

        if (!session) {
          return router.createUrlTree(['/login']);
        }

        return true;
      },
    ],
    resolve: [() => inject(OrganizationService).list()],
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
