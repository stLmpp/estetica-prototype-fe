import { Component, computed, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { MaybeAsync } from '@angular/router';
import { firstValueFrom, isObservable } from 'rxjs';
import { ButtonComponent } from '../button/button.component';
import { safeAsync } from '../../shared/safe';

export interface ConfirmDialogAction<R = unknown> {
  label: string;
  btnPrimary?: boolean;
  btnSecondary?: boolean;
  btnOutline?: boolean;
  danger?: boolean;
  onClick?: () => MaybeAsync<R>;
}

export interface ConfirmDialogData<R = unknown> {
  title: string;
  message: string;
  actions: ConfirmDialogAction<R>[];
}

function toPromise<R>(value: MaybeAsync<R>): Promise<R> {
  return isObservable(value) ? firstValueFrom(value) : Promise.resolve(value);
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [ButtonComponent],
  templateUrl: './confirm-dialog.component.html',
  host: {
    class: 'block rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800',
  },
})
export class ConfirmDialogComponent<R = unknown> {
  protected readonly data = inject<ConfirmDialogData<R>>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<R>);

  protected readonly loadingAction = signal<ConfirmDialogAction<R> | null>(null);
  protected readonly isLoading = computed(() => this.loadingAction() !== null);

  protected async run(action: ConfirmDialogAction<R>) {
    if (this.isLoading()) {
      return;
    }

    this.loadingAction.set(action);
    this.dialogRef.disableClose = true;

    const [error, result] = await safeAsync(() =>
      action.onClick ? toPromise(action.onClick()) : Promise.resolve(undefined),
    );

    this.loadingAction.set(null);
    this.dialogRef.disableClose = false;

    if (error) {
      console.error(error);
      return;
    }

    this.dialogRef.close(result);
  }
}
