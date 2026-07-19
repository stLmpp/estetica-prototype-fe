import { BetterAuthClientOptions, createAuthClient } from 'better-auth/client';
import { inject, InjectionToken, Provider, REQUEST } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  adminClient,
  anonymousClient,
  organizationClient,
  usernameClient,
} from 'better-auth/client/plugins';
import { safeAsync } from '../../shared/safe';
import { lastValueFrom } from 'rxjs';

async function getRequestBody(req: Request): Promise<string | null> {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return null;
  }

  return (await req.text()) || null;
}

function extractAngularHeaders(headers: HttpHeaders): Record<string, string> {
  return Object.fromEntries(
    headers.keys().map((key) => [key, headers.getAll(key)?.join(', ') || '']),
  );
}

export const BetterAuthConfig = new InjectionToken<BetterAuthClientOptions>('BetterAuthConfig');

export function createAuthConfig(httpClient: HttpClient) {
  return {
    baseURL: environment.api,
    basePath: '/v1/auth',
    plugins: [adminClient(), anonymousClient(), usernameClient(), organizationClient()],
    fetchOptions: {
      customFetchImpl: async (input, init) => {
        const req = new Request(input, init);
        const body = await getRequestBody(req);

        let headers = new HttpHeaders();
        req.headers.forEach((value, key) => {
          headers = headers.append(key, value);
        });

        const [error, response] = await safeAsync(() =>
          lastValueFrom(
            httpClient.request(req.method, req.url, {
              body,
              headers,
              observe: 'response',
              responseType: 'text',
              credentials: req.credentials,
              keepalive: req.keepalive,
              mode: req.mode,
              cache: req.cache,
              redirect: req.redirect,
              referrer: req.referrer,
              referrerPolicy: req.referrerPolicy,
              integrity: req.integrity,
            }),
          ),
        );

        if (!error) {
          return new Response(response.body, {
            status: response.status,
            headers: extractAngularHeaders(response.headers),
          });
        }

        if (error instanceof HttpErrorResponse) {
          return new Response(error.error, {
            status: error.status,
            headers: extractAngularHeaders(error.headers),
          });
        }
        throw error;
      },
    },
  } satisfies BetterAuthClientOptions;
}

export function createClient(options: ReturnType<typeof createAuthConfig>) {
  return createAuthClient(options);
}

export type AuthClientType = ReturnType<typeof createClient>;
export type BetterAuthSession = AuthClientType['$Infer']['Session'];
export type BetterAuthOrganization = AuthClientType['$Infer']['Organization'];

export const AuthClient = new InjectionToken<AuthClientType>('better-auth.client');

export function provideBetterAuthClient(): Provider[] {
  return [
    {
      provide: BetterAuthConfig,
      deps: [HttpClient],
      useFactory: createAuthConfig,
    },
    {
      provide: AuthClient,
      deps: [BetterAuthConfig],
      useFactory: createClient,
    },
  ];
}

export function provideBetterAuthServer(): Provider[] {
  return [
    {
      provide: BetterAuthConfig,
      deps: [HttpClient],
      useFactory: () => {
        const httpClient = inject(HttpClient);
        const config = createAuthConfig(httpClient);
        const req = inject(REQUEST, { optional: true });
        const cookieHeader = req?.headers.get('cookie');
        return {
          ...config,
          fetchOptions: {
            ...config.fetchOptions,
            headers: cookieHeader ? { cookie: cookieHeader as string } : {},
          },
        };
      },
    },
  ];
}
