import { Routes } from '@angular/router';
import {
  hasPermissionGuard,
  requireAuthenticatedWithOrganizationGuard,
} from '../../core/auth/auth.guards';
import { anamnesisFormDetailResolver } from './anamnesis-form-detail/anamnesis-form-detail.resolver';

export const ANAMNESIS_FORM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./anamnesis-forms.component').then((m) => m.AnamnesisFormsComponent),
    canActivate: [
      requireAuthenticatedWithOrganizationGuard(),
      hasPermissionGuard({ orgPermissions: { anamnesisField: ['get'] } }),
    ],
  },
  {
    path: ':anamnesisFormId',
    loadComponent: () =>
      import('./anamnesis-form-detail/anamnesis-form-detail.component').then(
        (m) => m.AnamnesisFormDetailComponent,
      ),
    canActivate: [
      requireAuthenticatedWithOrganizationGuard(),
      hasPermissionGuard({ orgPermissions: { anamnesisField: ['get'] } }),
    ],
    resolve: {
      anamnesisForm: anamnesisFormDetailResolver(),
    },
  },
];
