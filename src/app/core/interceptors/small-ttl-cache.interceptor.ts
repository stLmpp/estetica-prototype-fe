import {
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import {
  inject,
  Injectable,
  makeStateKey,
  PLATFORM_ID,
  REQUEST,
  TransferState,
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { catchError, finalize, Observable, of, shareReplay, tap, throwError } from 'rxjs';
import { CacheableMemory } from '@cacheable/memory';

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

interface TransferStateData {
  body: unknown;
  status: number;
  headers: Record<string, string[]>;
}

@Injectable({ providedIn: 'root' })
class SmallTtlCacheStore {
  readonly memoryCache = new CacheableMemory({
    ttl: 100,
    maxTtl: 100,
    useClone: false,
  });

  readonly inflightRequests = new Map<string, Observable<HttpEvent<unknown>>>();
}

type Flag = 'inflight' | 'transferState' | 'cacheHit' | 'cacheMiss';

const symbolMap: Record<Flag, string> = {
  inflight: '⏳',
  cacheHit: '⚡',
  cacheMiss: '☁️',
  transferState: '📦',
};

// TODO logger
console.log(
  Object.entries(symbolMap)
    .map(([flag, symbol]) => `${symbol} -> ${flag}`)
    .join('\n'),
);

function logRequest(req: HttpRequest<unknown>, flag: Flag) {
  // TODO add logger
  const url = new URL(req.urlWithParams);
  const args: unknown[] = [`${symbolMap[flag]} [HTTP] ${req.method} ${url.pathname}`];
  if (url.searchParams.size) {
    const params = Object.fromEntries(url.searchParams.entries());
    args.push(params);
  }
  console.log(...args);
}

export function smallTtlCacheInterceptor(): HttpInterceptorFn {
  return (req, next) => {
    if (req.method !== 'GET' || req.context.get(SMALL_TTL_CACHE_DISABLE)) {
      logRequest(req, 'cacheMiss');
      return next(req);
    }

    const { memoryCache, inflightRequests } = inject(SmallTtlCacheStore);
    const ssrRequest = inject(REQUEST, { optional: true });
    const transferState = inject(TransferState);
    const platformId = inject(PLATFORM_ID);
    const isServer = isPlatformServer(platformId);

    const cookies =
      req.headers.get('Cookie') ?? (isServer ? ssrRequest?.headers.get('Cookie') : null) ?? '';
    const memoryCacheKey = `${req.urlWithParams}-${cookies}`;
    const transferKey = makeStateKey<TransferStateData>(`transfer-${req.urlWithParams}`);

    // 2. Check Memory Cache (for recently finished requests)
    const memoryCached = memoryCache.get<Cache>(memoryCacheKey);
    if (memoryCached) {
      logRequest(req, 'cacheHit');
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
        let headers = new HttpHeaders();
        for (const [key, values] of Object.entries(stateData.headers)) {
          headers = headers.set(key, values);
        }
        const response = new HttpResponse({
          body: stateData.body,
          status: stateData.status,
          headers,
          url: req.urlWithParams,
        });
        logRequest(req, 'transferState');
        memoryCache.set(memoryCacheKey, { response } satisfies Cache);
        return of(response);
      }
    }

    // 4. NEW: Check if this exact request is currently in-flight!
    const inflightRequest$ = inflightRequests.get(memoryCacheKey);
    if (inflightRequest$) {
      logRequest(req, 'inflight');
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
          const headers = response.headers.keys().reduce<Record<string, string[]>>((acc, key) => {
            acc[key] = response.headers.getAll(key) ?? [];
            return acc;
          }, {});
          transferState.set(transferKey, {
            body: response.body,
            status: response.status,
            headers,
          } satisfies TransferStateData);
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

    logRequest(req, 'cacheMiss');

    return request$;
  };
}
