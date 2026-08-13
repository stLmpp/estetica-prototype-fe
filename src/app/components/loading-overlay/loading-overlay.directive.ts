import {
  booleanAttribute,
  ComponentRef,
  debounced,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  numberAttribute,
  OnDestroy,
  Renderer2,
  ViewContainerRef,
} from '@angular/core';
import { LoadingOverlayContentComponent } from './loading-overlay-content.component';

const DEFAULT_SHOW_DELAY_MS = 200;

@Directive({
  selector: '[loadingOverlay]',
  host: {
    class: 'relative',
  },
})
export class LoadingOverlayDirective implements OnDestroy {
  readonly loadingOverlay = input(false, { transform: booleanAttribute });
  readonly loadingOverlayLabel = input('Carregando');
  readonly loadingOverlayShowDelay = input(DEFAULT_SHOW_DELAY_MS, {
    transform: (value) => {
      let newValue = numberAttribute(value, DEFAULT_SHOW_DELAY_MS);
      if (newValue < 0) {
        newValue = DEFAULT_SHOW_DELAY_MS;
      }
      return newValue;
    },
  });

  private readonly hostElement = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly viewContainerRef = inject(ViewContainerRef);

  private readonly debouncedLoadingOverlay = debounced(this.loadingOverlay, (show) =>
    show
      ? new Promise<void>((resolve) => setTimeout(resolve, this.loadingOverlayShowDelay()))
      : undefined,
  );

  private overlayRef: ComponentRef<LoadingOverlayContentComponent> | null = null;

  constructor() {
    effect(() => {
      if (this.debouncedLoadingOverlay.value()) {
        this.attachOverlay();
      } else {
        this.detachOverlay();
      }
    });
  }

  private attachOverlay() {
    if (this.overlayRef) {
      return;
    }

    this.overlayRef = this.viewContainerRef.createComponent(LoadingOverlayContentComponent);
    this.overlayRef.setInput('label', this.loadingOverlayLabel());
    this.renderer.appendChild(this.hostElement, this.overlayRef.location.nativeElement);
    this.renderer.setAttribute(this.hostElement, 'aria-busy', 'true');

    for (const child of this.hostContentElements()) {
      this.renderer.setAttribute(child, 'inert', '');
    }
  }

  private detachOverlay() {
    if (!this.overlayRef) {
      return;
    }

    for (const child of this.hostContentElements()) {
      this.renderer.removeAttribute(child, 'inert');
    }
    this.renderer.removeAttribute(this.hostElement, 'aria-busy');

    this.overlayRef.destroy();
    this.overlayRef = null;
  }

  private hostContentElements() {
    const overlayElement = this.overlayRef?.location.nativeElement;
    return Array.from(this.hostElement.children).filter((child) => child !== overlayElement);
  }

  ngOnDestroy() {
    this.detachOverlay();
  }
}
