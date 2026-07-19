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
import { environment } from '../environments/environment';
import { isPlatformServer } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { smallTtlCacheInterceptor } from './core/small-ttl-cache.interceptor';
import { provideBetterAuthClient } from './core/better-auth/better-auth.provider';
import { AuthService } from './core/better-auth/auth.service';

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
      const req = inject(REQUEST, { optional: true });
      const isServer = isPlatformServer(inject(PLATFORM_ID));
      if (!req && isServer) {
        return;
      }
      return authService.getSession();
    }),
  ],
};
