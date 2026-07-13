import {
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { inject, PLATFORM_ID, REQUEST, TransferState, makeStateKey } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Observable, catchError, finalize, of, shareReplay, tap, throwError } from 'rxjs';
import { CacheableMemory } from 'cacheable';

export const SMALL_TTL_CACHE_DISABLE = new HttpContextToken<boolean>(() => false);

type Cache =
  | {
      response: HttpEvent<unknown>;
      error?: undefined;
    }
  | {
      response?: undefined;
      error: HttpErrorResponse;
    };

export function smallTtlCacheInterceptor(): HttpInterceptorFn {
  const memoryCache = new CacheableMemory({
    ttl: 50,
    maxTtl: 50,
    useClone: false,
  });

  // 1. Create a Map to track requests that are currently executing
  const inflightRequests = new Map<string, Observable<HttpEvent<unknown>>>();

  return (req, next) => {
    if (req.method !== 'GET' || req.context.get(SMALL_TTL_CACHE_DISABLE)) {
      return next(req);
    }

    const ssrRequest = inject(REQUEST, { optional: true });
    const transferState = inject(TransferState);
    const platformId = inject(PLATFORM_ID);
    const isServer = isPlatformServer(platformId);

    const cookies = req.headers.get('Cookie') ?? ssrRequest?.headers.get('Cookie') ?? '';
    const memoryCacheKey = `${req.urlWithParams}-${cookies}`;
    const transferKey = makeStateKey<unknown>(`transfer-${req.urlWithParams}`);

    // 2. Check Memory Cache (for recently finished requests)
    const memoryCached = memoryCache.get<Cache>(memoryCacheKey);
    if (memoryCached) {
      if (memoryCached.error) {
        return throwError(() => memoryCached.error);
      }
      return of(memoryCached.response);
    }

    // 3. Check Transfer State (for SSR Hydration)
    if (!isServer && transferState.hasKey(transferKey)) {
      const stateData = transferState.get(transferKey, null);
      transferState.remove(transferKey);

      if (stateData) {
        const response = new HttpResponse({
          body: stateData,
          status: 200,
          url: req.urlWithParams,
        });

        memoryCache.set(memoryCacheKey, { response } satisfies Cache);
        return of(response);
      }
    }

    // 4. NEW: Check if this exact request is currently in-flight!
    const inflightRequest$ = inflightRequests.get(memoryCacheKey);
    if (inflightRequest$) {
      // If it is, return the existing Observable.
      // The waiting component will piggyback on the ongoing HTTP call.
      return inflightRequest$;
    }

    // 5. Execute Request
    const request$ = next(req).pipe(
      tap((response) => {
        if (response.type !== HttpEventType.Response) {
          return;
        }
        memoryCache.set(memoryCacheKey, { response } satisfies Cache);
        if (isServer) {
          transferState.set(transferKey, response.body);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        memoryCache.set(memoryCacheKey, { error } satisfies Cache);
        return throwError(() => error);
      }),
      // 6. NEW: Clean up the in-flight map when the request finishes (success or fail)
      finalize(() => {
        inflightRequests.delete(memoryCacheKey);
      }),
      // 7. NEW: Share the execution so multiple subscribers don't trigger multiple HTTP calls
      shareReplay(1),
    );

    // 8. NEW: Store the shared observable in the Map before returning it
    inflightRequests.set(memoryCacheKey, request$);

    return request$;
  };
}
