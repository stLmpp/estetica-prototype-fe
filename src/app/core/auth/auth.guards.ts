import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';

export function requireAuthenticatedGuard(): CanActivateFn {
  return () => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    if (!authStore.session()) {
      return router.createUrlTree(['/login']);
    }

    return true;
  };
}

export function requireAuthenticatedWithOrganizationGuard(): CanActivateFn {
  return () => {
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
  };
}

export function redirectIfAuthenticatedGuard(): CanActivateFn {
  return () => {
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
  };
}
