import {
  ApplicationConfig,
  inject,
  PLATFORM_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  REQUEST,
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
import { AuthService, BETTER_AUTH_CONFIG_TOKEN } from 'ngx-better-auth';
import { environment } from '../environments/environment';
import { isPlatformServer } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { smallTtlCacheInterceptor } from './core/small-ttl-cache.interceptor';
import {
  BetterAuthConfigProvider,
  BetterAuthConfigToken,
} from './core/better-auth-config.provider';

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
    BetterAuthConfigProvider,
    { provide: BETTER_AUTH_CONFIG_TOKEN, useExisting: BetterAuthConfigToken },
    AuthService,
    provideAppInitializer(async () => {
      const authService = inject(AuthService);
      const req = inject(REQUEST, { optional: true });
      const isServer = isPlatformServer(inject(PLATFORM_ID));
      if (!req && isServer) {
        return;
      }
      const session = await (authService as any).client.getSession();
      if (session?.data) {
        authService.session.set(session.data);
      }
    }),
  ],
};
