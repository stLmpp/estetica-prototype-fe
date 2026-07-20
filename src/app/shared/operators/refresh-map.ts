import { map, MonoTypeOperatorFunction, Observable, of, switchMap } from 'rxjs';

export function refreshMap<T>(
  project: (value: T) => Observable<unknown> | undefined,
): MonoTypeOperatorFunction<T> {
  return switchMap((value) => {
    const response$ = project(value) ?? of(null);
    return response$.pipe(map(() => value));
  });
}
