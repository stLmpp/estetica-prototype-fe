import { Component, computed, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { form, FormField, FormRoot, hidden, required, validate } from '@angular/forms/signals';
import { catchError, firstValueFrom, map, Observable, of } from 'rxjs';
import { NgxMaskDirective } from 'ngx-mask';
import { AlertComponent } from '../../../../components/alert/alert.component';
import { ButtonComponent } from '../../../../components/button/button.component';
import { FormFieldComponent } from '../../../../components/form-field/form-field.component';
import { InputDirective } from '../../../../components/input/input.directive';
import { LabelComponent } from '../../../../components/label/label.component';
import { SelectDirective } from '../../../../components/select/select.directive';
import { SwitchComponent } from '../../../../components/switch/switch.component';
import { ToastService } from '../../../../components/toast/toast.service';
import { extractApiErrorMessage } from '../../../../model/api-error';
import { AddSaleTransactionResult, SaleTransactionPayload } from '../../sale.dto';
import { SaleService } from '../../sale.service';
import { PaymentMethod } from '../../payment-method.enum';
import { SaleTransactionType } from '../../sale-transaction-type.enum';

export interface AddSaleTransactionDialogData {
  saleId: string;
  type: SaleTransactionType;
}

interface FormModel {
  paymentMethod: PaymentMethod | '';
  amount: string;
  installments: boolean;
  installmentCount: number | null;
  dueDate: string;
  receivedNow: boolean;
  markFirstInstallmentAsReceived: boolean;
}

type SaveResult = { ok: true; result: AddSaleTransactionResult } | { ok: false; message: string };

const DEFAULT_ERROR_MESSAGE = 'Não foi possível registrar a transação. Tente novamente.';

function emptyModel(): FormModel {
  return {
    paymentMethod: '',
    amount: '',
    installments: false,
    installmentCount: 2,
    dueDate: '',
    receivedNow: false,
    markFirstInstallmentAsReceived: false,
  };
}

@Component({
  selector: 'app-add-sale-transaction-dialog',
  imports: [
    AlertComponent,
    ButtonComponent,
    FormField,
    FormFieldComponent,
    FormRoot,
    InputDirective,
    LabelComponent,
    NgxMaskDirective,
    SelectDirective,
    SwitchComponent,
  ],
  templateUrl: './add-sale-transaction-dialog.component.html',
  host: {
    class: 'block rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800',
  },
})
export class AddSaleTransactionDialogComponent {
  protected readonly data = inject<AddSaleTransactionDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<AddSaleTransactionResult | undefined>);
  private readonly saleService = inject(SaleService);
  private readonly toastService = inject(ToastService);

  protected readonly PaymentMethod = PaymentMethod;
  protected readonly paymentMethodOptions = Object.values(PaymentMethod);
  protected readonly isRefund = this.data.type === SaleTransactionType.Refund;
  protected readonly submitErrorMessage = signal<string | null>(null);

  protected readonly title = computed(() =>
    this.isRefund ? 'Registrar estorno' : 'Adicionar pagamento',
  );

  protected readonly model = signal(emptyModel());

  protected readonly f = form(
    this.model,
    (schema) => {
      required(schema.amount, { message: 'Valor é obrigatório' });

      hidden(schema.paymentMethod, { when: (ctx) => ctx.valueOf(schema.installments) });
      required(schema.paymentMethod, {
        message: 'Forma de pagamento é obrigatória',
        when: (ctx) => !ctx.valueOf(schema.installments),
      });

      required(schema.installmentCount, {
        message: 'Número de parcelas é obrigatório',
        when: (ctx) => ctx.valueOf(schema.installments),
      });
      validate(schema.installmentCount, ({ value }) => {
        const count = value();
        return count === null || (Number.isInteger(count) && count >= 2)
          ? null
          : { kind: 'invalidInstallmentCount', message: 'Mínimo de 2 parcelas' };
      });

      required(schema.dueDate, {
        message: 'Data de vencimento é obrigatória',
        when: (ctx) => ctx.valueOf(schema.installments),
      });
    },
    {
      submission: {
        action: async (field) => {
          this.submitErrorMessage.set(null);
          const value = field().value();

          const result = await this.save(value);
          if (!result.ok) {
            this.submitErrorMessage.set(result.message);
            return;
          }

          this.toastService.success(
            this.isRefund ? 'Estorno registrado com sucesso.' : 'Pagamento registrado com sucesso.',
          );
          this.dialogRef.close(result.result);
        },
      },
    },
  );

  private save(value: FormModel): Promise<SaveResult> {
    const payload: SaleTransactionPayload = {
      type: this.data.type,
      paymentMethod: value.installments
        ? PaymentMethod.CreditCard
        : (value.paymentMethod as PaymentMethod),
      amount: value.amount,
      installmentCount: value.installments ? value.installmentCount! : undefined,
      dueDate: value.dueDate || undefined,
      receivedAt: !value.installments && value.receivedNow ? new Date().toISOString() : undefined,
      markFirstInstallmentAsReceived: value.installments
        ? value.markFirstInstallmentAsReceived
        : undefined,
    };

    const request$: Observable<SaveResult> = this.saleService
      .addTransaction(this.data.saleId, payload)
      .pipe(map((result): SaveResult => ({ ok: true, result })));

    return firstValueFrom(
      request$.pipe(
        catchError((error: unknown) =>
          of<SaveResult>({
            ok: false,
            message: extractApiErrorMessage(error, DEFAULT_ERROR_MESSAGE),
          }),
        ),
      ),
    );
  }

  protected cancel() {
    this.dialogRef.close(undefined);
  }
}
