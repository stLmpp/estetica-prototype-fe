import { Routes } from '@angular/router';
import {
  hasPermissionGuard,
  requireAuthenticatedWithOrganizationGuard,
} from '../../core/auth/auth.guards';
import { customerAnamnesisDetailResolver } from './customer-details/customer-anamnesis-tab/customer-anamnesis-detail.resolver';
import { customerFollowupDetailResolver } from './customer-details/customer-followup-tab/customer-followup-detail.resolver';
import { customerFollowupOwnershipGuard } from './customer-details/customer-followup-tab/customer-followup-ownership.guard';
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
          import('./customer-details/customer-appointments-tab/customer-appointments-tab.component').then(
            (m) => m.CustomerAppointmentsTabComponent,
          ),
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
      {
        path: 'anamnesis',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./customer-details/customer-anamnesis-tab/customer-anamnesis-tab.component').then(
                (m) => m.CustomerAnamnesisTabComponent,
              ),
            canActivate: [hasPermissionGuard({ orgPermissions: { customerAnamnesis: ['get'] } })],
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./customer-details/customer-anamnesis-tab/customer-anamnesis-form-page/customer-anamnesis-form-page.component').then(
                (m) => m.CustomerAnamnesisFormPageComponent,
              ),
            canActivate: [
              hasPermissionGuard({ orgPermissions: { customerAnamnesis: ['create'] } }),
            ],
          },
          {
            path: ':customerAnamnesisId',
            loadComponent: () =>
              import('./customer-details/customer-anamnesis-tab/customer-anamnesis-detail-page/customer-anamnesis-detail-page.component').then(
                (m) => m.CustomerAnamnesisDetailPageComponent,
              ),
            canActivate: [hasPermissionGuard({ orgPermissions: { customerAnamnesis: ['get'] } })],
            resolve: { customerAnamnesis: customerAnamnesisDetailResolver() },
          },
          {
            path: ':customerAnamnesisId/edit',
            loadComponent: () =>
              import('./customer-details/customer-anamnesis-tab/customer-anamnesis-form-page/customer-anamnesis-form-page.component').then(
                (m) => m.CustomerAnamnesisFormPageComponent,
              ),
            canActivate: [
              hasPermissionGuard({ orgPermissions: { customerAnamnesis: ['update'] } }),
            ],
            resolve: { customerAnamnesis: customerAnamnesisDetailResolver() },
          },
        ],
      },
      {
        path: 'follow-up',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./customer-details/customer-followup-tab/customer-followup-tab.component').then(
                (m) => m.CustomerFollowupTabComponent,
              ),
            canActivate: [hasPermissionGuard({ orgPermissions: { customerFollowup: ['get'] } })],
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./customer-details/customer-followup-tab/customer-followup-form-page/customer-followup-form-page.component').then(
                (m) => m.CustomerFollowupFormPageComponent,
              ),
            canActivate: [hasPermissionGuard({ orgPermissions: { customerFollowup: ['create'] } })],
          },
          {
            path: ':customerFollowupId',
            loadComponent: () =>
              import('./customer-details/customer-followup-tab/customer-followup-detail-page/customer-followup-detail-page.component').then(
                (m) => m.CustomerFollowupDetailPageComponent,
              ),
            canActivate: [
              hasPermissionGuard({ orgPermissions: { customerFollowup: ['get'] } }),
              customerFollowupOwnershipGuard(),
            ],
            resolve: { customerFollowup: customerFollowupDetailResolver() },
          },
          {
            path: ':customerFollowupId/edit',
            loadComponent: () =>
              import('./customer-details/customer-followup-tab/customer-followup-form-page/customer-followup-form-page.component').then(
                (m) => m.CustomerFollowupFormPageComponent,
              ),
            canActivate: [
              hasPermissionGuard({ orgPermissions: { customerFollowup: ['update'] } }),
              customerFollowupOwnershipGuard(),
            ],
            resolve: { customerFollowup: customerFollowupDetailResolver() },
          },
        ],
      },
    ],
  },
];
