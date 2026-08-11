import { afterNextRender, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';

export type PreloadTrigger = 'hover' | 'viewport' | 'idle';

function scheduleIdlePreload(callback: () => void): () => void {
  if (typeof requestIdleCallback === 'function') {
    const handle = requestIdleCallback(callback);
    return () => cancelIdleCallback(handle);
  }

  const handle = setTimeout(callback, 1);
  return () => clearTimeout(handle);
}

/**
 * Preloads a lazily-imported component (e.g. a dialog opened via `DialogService`) ahead of the
 * action that actually needs it, so the chunk is already cached by the time the user commits.
 * `hover` also listens for `focus` so keyboard users get the same head start as mouse users.
 */
@Directive({
  selector: '[appPreloadLoader]',
  host: {
    '(mouseenter)': 'onHoverTrigger()',
    '(focus)': 'onHoverTrigger()',
  },
})
export class PreloadDirective {
  readonly appPreloadLoader = input.required<() => Promise<unknown>>();
  readonly appPreloadOn = input<PreloadTrigger>('hover');

  private readonly hostElement = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly destroyRef = inject(DestroyRef);

  private preloaded = false;

  constructor() {
    afterNextRender(() => {
      if (this.appPreloadOn() === 'viewport') {
        this.observeViewport();
      } else if (this.appPreloadOn() === 'idle') {
        this.observeIdle();
      }
    });
  }

  protected onHoverTrigger() {
    if (this.appPreloadOn() === 'hover') {
      this.preload();
    }
  }

  private observeViewport() {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        this.preload();
        observer.disconnect();
      }
    });
    observer.observe(this.hostElement);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private observeIdle() {
    const cancel = scheduleIdlePreload(() => this.preload());
    this.destroyRef.onDestroy(cancel);
  }

  private preload() {
    if (this.preloaded) {
      return;
    }
    this.preloaded = true;
    this.appPreloadLoader()().catch(() => {});
  }
}
