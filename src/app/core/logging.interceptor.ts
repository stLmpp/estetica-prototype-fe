import { HttpInterceptorFn } from '@angular/common/http';

export function loggingInterceptor(): HttpInterceptorFn {
  return (req, next) => {
    console.log(`[HTTP] ${req.method} ${req.urlWithParams}`);
    return next(req);
  };
}
