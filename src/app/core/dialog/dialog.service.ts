import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { inject, Service } from '@angular/core';

export type LazyDialogComponent<C> = () => Promise<ComponentType<C>>;

/**
 * Matches Tailwind's `max-w-*` scale so picking a size here reads the same
 * as picking a `max-w-*` class would.
 */
export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const DIALOG_MAX_WIDTH_BY_SIZE: Record<DialogSize, string> = {
  sm: '24rem',
  md: '28rem',
  lg: '32rem',
  xl: '36rem',
  '2xl': '42rem',
};

const DEFAULT_DIALOG_SIZE: DialogSize = 'md';

export interface DialogOpenConfig<D, R, C> extends DialogConfig<D, DialogRef<R, C>> {
  /** Caps the dialog's width. Defaults to `'md'`. */
  size?: DialogSize;
}

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
    config?: DialogOpenConfig<D, R, C>,
  ): DialogRef<R, C>;
  open<R = unknown, D = unknown, C = unknown>(
    component: LazyDialogComponent<C>,
    config?: DialogOpenConfig<D, R, C>,
  ): Promise<DialogRef<R, C>>;
  open<R = unknown, D = unknown, C = unknown>(
    component: ComponentType<C> | LazyDialogComponent<C>,
    config?: DialogOpenConfig<D, R, C>,
  ): DialogRef<R, C> | Promise<DialogRef<R, C>> {
    const { size, ...restConfig } = config ?? {};
    const resolvedConfig: DialogConfig<D, DialogRef<R, C>> = {
      width: '100%',
      maxWidth: DIALOG_MAX_WIDTH_BY_SIZE[size ?? DEFAULT_DIALOG_SIZE],
      ...restConfig,
    };

    if (!isLazyDialogComponent(component)) {
      return this.dialog.open<R, D, C>(component, resolvedConfig);
    }

    return component().then((resolvedComponent) =>
      this.dialog.open<R, D, C>(resolvedComponent, resolvedConfig),
    );
  }
}
