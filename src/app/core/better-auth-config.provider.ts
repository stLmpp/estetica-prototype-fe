import { FactoryProvider, inject, InjectionToken } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BetterAuthClientOptions } from 'better-auth';
import { lastValueFrom } from 'rxjs';
import {
  adminClient,
  anonymousClient,
  organizationClient,
  usernameClient,
} from 'better-auth/client/plugins';
import { safeAsync } from '../shared/safe';

export const BetterAuthConfigToken = new InjectionToken<BetterAuthClientOptions>(
  'BetterAuthConfig',
);

async function getRequestBody(req: Request): Promise<string | null> {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return null;
  }

  return (await req.text()) || null;
}

export const BetterAuthConfigProvider: FactoryProvider = {
  provide: BetterAuthConfigToken,
  useFactory: () => {
    const httpClient = inject(HttpClient);

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
  },
};

function extractAngularHeaders(headers: HttpHeaders): Record<string, string> {
  return Object.fromEntries(
    headers.keys().map((key) => [key, headers.getAll(key)?.join(', ') || '']),
  );
}
