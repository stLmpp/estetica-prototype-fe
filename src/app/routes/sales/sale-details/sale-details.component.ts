import { Component, computed, inject, input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AlertComponent } from '../../../components/alert/alert.component';
import { BadgeComponent } from '../../../components/badge/badge.component';
import { ButtonComponent } from '../../../components/button/button.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../components/confirm-dialog/confirm-dialog.component';
import { LoadingOverlayDirective } from '../../../components/loading-overlay/loading-overlay.directive';
import { ToastService } from '../../../components/toast/toast.service';
import { AuthStore } from '../../../core/auth/auth.store';
import { DialogService } from '../../../core/dialog/dialog.service';
import { extractApiErrorMessage } from '../../../model/api-error';
import { PaymentMethod } from '../payment-method.enum';
import { SaleStatus } from '../sale-status.enum';
import { SaleTransactionType } from '../sale-transaction-type.enum';
import { SaleService } from '../sale.service';
import {
  AddSaleTransactionDialogComponent,
  AddSaleTransactionDialogData,
} from './add-sale-transaction-dialog/add-sale-transaction-dialog.component';

const DEFAULT_LOAD_ERROR_MESSAGE = 'Não foi possível carregar a venda.';
const DEFAULT_CANCEL_ERROR_MESSAGE = 'Não foi possível cancelar a venda.';

@Component({
  selector: 'app-sale-details',
  imports: [
    AlertComponent,
    BadgeComponent,
    ButtonComponent,
    CurrencyPipe,
    DatePipe,
    LoadingOverlayDirective,
    RouterLink,
  ],
  templateUrl: './sale-details.component.html',
  host: {
    class: 'page-container',
  },
})
export class SaleDetailsComponent {
  readonly saleId = input.required<string>();

  private readonly saleService = inject(SaleService);
  private readonly authStore = inject(AuthStore);
  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);

  protected readonly SaleStatus = SaleStatus;
  protected readonly SaleTransactionType = SaleTransactionType;
  protected readonly PaymentMethod = PaymentMethod;

  private readonly saleResource = rxResource({
    params: this.saleId,
    stream: ({ params: saleId }) => this.saleService.getById(saleId),
  });

  protected readonly loading = computed(() => this.saleResource.isLoading());
  protected readonly loadErrorMessage = computed(() => {
    const error = this.saleResource.error();
    return error ? extractApiErrorMessage(error, DEFAULT_LOAD_ERROR_MESSAGE) : null;
  });
  protected readonly sale = computed(() => this.saleResource.value() ?? null);

  protected readonly canAddTransaction = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { sale: ['addTransaction'] } }),
  );
  protected readonly canUpdateStatus = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { sale: ['updateStatus'] } }),
  );

  protected readonly canRegisterTransactions = computed(
    () => this.canAddTransaction() && this.sale()?.status !== SaleStatus.Cancelled,
  );
  protected readonly canCancelSale = computed(
    () => this.canUpdateStatus() && this.sale()?.status === SaleStatus.Pending,
  );

  protected openTransactionDialog(type: SaleTransactionType) {
    const sale = this.sale();
    if (!sale) {
      return;
    }

    const dialogRef = this.dialogService.open<
      Awaited<ReturnType<SaleService['addTransaction']>> | undefined,
      AddSaleTransactionDialogData
    >(AddSaleTransactionDialogComponent, {
      data: { saleId: sale.id, type },
      size: 'md',
      ariaModal: true,
      ariaLabelledBy: 'add-sale-transaction-dialog-title',
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.saleResource.reload();
      }
    });
  }

  protected openCancelDialog() {
    const sale = this.sale();
    if (!sale) {
      return;
    }

    const dialogRef = this.dialogService.open<boolean, ConfirmDialogData>(ConfirmDialogComponent, {
      data: {
        title: 'Cancelar venda',
        message: `Tem certeza que deseja cancelar a venda de "${sale.customerName}"?`,
        confirmLabel: 'Cancelar venda',
        cancelLabel: 'Voltar',
        danger: true,
      },
      size: 'md',
      role: 'alertdialog',
      ariaModal: true,
      ariaLabelledBy: 'confirm-dialog-title',
    });

    dialogRef.closed.subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.saleService.updateStatus(sale.id, { status: SaleStatus.Cancelled }).subscribe({
        next: () => {
          this.toastService.success('Venda cancelada com sucesso.');
          this.saleResource.reload();
        },
        error: (error: unknown) => {
          this.toastService.error(extractApiErrorMessage(error, DEFAULT_CANCEL_ERROR_MESSAGE));
        },
      });
    });
  }
}
