import { mergeApplicationConfig, ApplicationConfig, inject, REQUEST } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { BETTER_AUTH_CONFIG_TOKEN } from 'ngx-better-auth';
import { BetterAuthConfigToken } from './core/better-auth-config.provider';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      // Override the default config provided in app.config.ts
      provide: BETTER_AUTH_CONFIG_TOKEN,
      useFactory: () => {
        // Inject the incoming HTTP request from Angular SSR
        const config = inject(BetterAuthConfigToken);
        const req = inject(REQUEST, { optional: true });

        // Safely extract the cookie header
        const cookieHeader = req?.headers.get('cookie');

        return {
          ...config,
          // 1. Must be an absolute URL for the Node.js fetch to work

          // 2. Forward the cookies to Better Auth's fetch requests
          fetchOptions: {
            ...config.fetchOptions,
            headers: cookieHeader ? { cookie: cookieHeader as string } : {},
          },
        };
      },
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
