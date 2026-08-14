import { Injector, Service, inject, signal } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ToastContainerComponent } from './toast-container.component';
import { ToastItem, ToastVariant } from './toast.model';

const DEFAULT_DURATION_MS = 4000;

let nextId = 0;

@Service()
export class ToastService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);

  private readonly toastsSignal = signal<ToastItem[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  private overlayRef: OverlayRef | null = null;

  show(message: string, variant: ToastVariant = 'info', duration = DEFAULT_DURATION_MS): number {
    this.ensureAttached();
    const id = nextId++;
    this.toastsSignal.update((toasts) => [...toasts, { id, message, variant }]);
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
    return id;
  }

  success(message: string, duration?: number): number {
    return this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): number {
    return this.show(message, 'error', duration);
  }

  warning(message: string, duration?: number): number {
    return this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number): number {
    return this.show(message, 'info', duration);
  }

  dismiss(id: number) {
    this.toastsSignal.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  private ensureAttached() {
    if (this.overlayRef) {
      return;
    }
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().bottom('24px').right('24px'),
      scrollStrategy: this.overlay.scrollStrategies.noop(),
    });
    this.overlayRef.attach(new ComponentPortal(ToastContainerComponent, null, this.injector));
  }
}
