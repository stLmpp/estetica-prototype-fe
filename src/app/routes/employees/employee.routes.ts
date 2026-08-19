import { Routes } from '@angular/router';
import {
  hasPermissionGuard,
  requireAuthenticatedWithOrganizationGuard,
} from '../../core/auth/auth.guards';

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./employees.component').then((m) => m.EmployeesComponent),
    canActivate: [
      requireAuthenticatedWithOrganizationGuard(),
      hasPermissionGuard({ orgPermissions: { employee: ['get'] } }),
    ],
  },
  {
    path: ':employeeId',
    loadComponent: () =>
      import('./employee-details/employee-details.component').then(
        (m) => m.EmployeeDetailsComponent,
      ),
    canActivate: [
      requireAuthenticatedWithOrganizationGuard(),
      hasPermissionGuard({ orgPermissions: { employee: ['get'] } }),
    ],
  },
];
