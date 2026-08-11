import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { inject, Service } from '@angular/core';

export type LazyDialogComponent<C> = () => Promise<ComponentType<C>>;

function isLazyDialogComponent<C>(
  component: ComponentType<C> | LazyDialogComponent<C>,
): component is LazyDialogComponent<C> {
  return !('prototype' in component);
}

@Service()
export class DialogService {
  private readonly dialog = inject(Dialog);

  open<R = unknown, D = unknown, C = unknown>(
    component: ComponentType<C>,
    config?: DialogConfig<D, DialogRef<R, C>>,
  ): DialogRef<R, C>;
  open<R = unknown, D = unknown, C = unknown>(
    component: LazyDialogComponent<C>,
    config?: DialogConfig<D, DialogRef<R, C>>,
  ): Promise<DialogRef<R, C>>;
  open<R = unknown, D = unknown, C = unknown>(
    component: ComponentType<C> | LazyDialogComponent<C>,
    config?: DialogConfig<D, DialogRef<R, C>>,
  ): DialogRef<R, C> | Promise<DialogRef<R, C>> {
    if (!isLazyDialogComponent(component)) {
      return this.dialog.open<R, D, C>(component, config);
    }

    return component().then((resolvedComponent) => this.dialog.open<R, D, C>(resolvedComponent, config));
  }
}
