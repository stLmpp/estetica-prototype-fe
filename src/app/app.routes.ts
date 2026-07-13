import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    // canActivate: [redirectUnauthorizedTo(['/login'])],
    loadComponent: () => import('./routes/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./routes/login/login.component').then((m) => m.LoginComponent),
    // canActivate: [redirectLoggedInTo(['/'])],
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
