import {
  booleanAttribute,
  ComponentRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  Renderer2,
  ViewContainerRef,
} from '@angular/core';
import { LoadingOverlayContentComponent } from './loading-overlay-content.component';

@Directive({
  selector: '[loadingOverlay]',
  host: {
    class: 'relative',
  },
})
export class LoadingOverlayDirective {
  readonly loadingOverlay = input(false, { transform: booleanAttribute });
  readonly loadingOverlayLabel = input('Carregando');

  private readonly hostElement = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly viewContainerRef = inject(ViewContainerRef);

  private overlayRef: ComponentRef<LoadingOverlayContentComponent> | null = null;

  constructor() {
    effect(() => {
      if (this.loadingOverlay()) {
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
}
