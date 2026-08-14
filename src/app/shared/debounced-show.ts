import { debounced, Signal } from '@angular/core';

export function debouncedShow(value: Signal<boolean>, delayMs: () => number) {
  return debounced(value, (show) =>
    show ? new Promise<void>((resolve) => setTimeout(resolve, delayMs())) : undefined,
  );
}
