import {
  ApplicationConfig,
  inject,
  makeStateKey,
  PLATFORM_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  REQUEST,
  TransferState,
} from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  RouterFeatures,
  withComponentInputBinding,
  withDebugTracing,
  withPreloading,
  withViewTransitions,
} from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { environment } from '../environments/environment';
import { isPlatformServer } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { smallTtlCacheInterceptor } from './core/small-ttl-cache.interceptor';
import { provideBetterAuthClient } from './core/better-auth/better-auth.provider';
import { AuthService } from './core/better-auth/auth.service';
import { OrganizationService } from './core/better-auth/organization.service';
import { AuthStateSession } from './core/better-auth/auth.store';
import { map, of, switchMap, tap } from 'rxjs';

const routerFeatures: RouterFeatures[] = [
  withPreloading(PreloadAllModules),
  withComponentInputBinding(),
  withViewTransitions(),
];

if (environment.debug) {
  routerFeatures.push(withDebugTracing());
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, ...routerFeatures),
    provideHttpClient(withInterceptors([smallTtlCacheInterceptor()])),
    provideClientHydration(),
    provideBetterAuthClient(),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      const organization = inject(OrganizationService);
      const req = inject(REQUEST, { optional: true });
      const isServer = isPlatformServer(inject(PLATFORM_ID));
      const transferState = inject(TransferState);
      if (!req && isServer) {
        return;
      }
      const key = makeStateKey<AuthStateSession | null>('initial-session-state');
      if (!isServer && transferState.hasKey(key)) {
        const value = transferState.get(key, null);
        authService.setUserSession(value);
        transferState.remove(key);
        return;
      }
      return authService.getSession().pipe(
        tap((data) => {
          authService.setUserSession(data as never);
        }),
        switchMap((data) => {
          if (!data?.session.activeOrganizationId) {
            return of([data, null] as const);
          }
          return organization
            .getOrganization(data.session.activeOrganizationId)
            .pipe(map((organization) => [data, organization] as const));
        }),
        tap(([data, organization]) => {
          const userSession = data
            ? {
                user: data?.user,
                session: data?.session as never,
                activeOrganization: organization ?? undefined,
              }
            : null;
          authService.setUserSession(
            data
              ? {
                  user: data?.user,
                  session: data?.session as never,
                  activeOrganization: organization ?? undefined,
                }
              : null,
          );
          transferState.set(key, userSession);
        }),
      );
    }),
  ],
};
