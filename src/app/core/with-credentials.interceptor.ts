import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID, REQUEST } from '@angular/core';
import { isPlatformServer } from '@angular/common';

export function withCredentialsInterceptor(): HttpInterceptorFn {
  return (req, next) => {
    const ssrRequest = inject(REQUEST, { optional: true });
    const isServer = isPlatformServer(inject(PLATFORM_ID));

    let newReq = req.clone({ credentials: 'include' });

    const cookieHeader = ssrRequest?.headers.get('cookie');

    if (isServer && cookieHeader) {
      newReq = newReq.clone({ headers: req.headers.set('cookie', cookieHeader) });
    }

    return next(newReq);
  };
}
