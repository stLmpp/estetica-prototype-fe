import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { applyEach, form, FormField, FormRoot, hidden, required, validate } from '@angular/forms/signals';
import { catchError, firstValueFrom, map, Observable, of } from 'rxjs';
import Big from 'big.js';
import { NgxMaskDirective } from 'ngx-mask';
import { LucideTrash2 } from '@lucide/angular';
import { AlertComponent } from '../../../components/alert/alert.component';
import { ButtonComponent } from '../../../components/button/button.component';
import { FormFieldComponent } from '../../../components/form-field/form-field.component';
import { IconButtonComponent } from '../../../components/icon-button/icon-button.component';
import { InputDirective } from '../../../components/input/input.directive';
import { LabelComponent } from '../../../components/label/label.component';
import { SelectDirective } from '../../../components/select/select.directive';
import { SwitchComponent } from '../../../components/switch/switch.component';
import { TypeaheadComponent, TypeaheadItem } from '../../../components/typeahead/typeahead.component';
import { ToastService } from '../../../components/toast/toast.service';
import { extractApiErrorMessage } from '../../../model/api-error';
import { AppointmentDetail } from '../../appointments/appointment.model';
import { CatalogItem } from '../../catalog-items/catalog-item.model';
import { CatalogItemService } from '../../catalog-items/catalog-item.service';
import { CustomerService } from '../../customers/customer.service';
import { EmployeeService } from '../../employees/employee.service';
import { PaymentMethod } from '../payment-method.enum';
import { SaleItemPayload, SalePayload, SaleTransactionPayload } from '../sale.dto';
import { SaleService } from '../sale.service';
import { SaleTransactionType } from '../sale-transaction-type.enum';

const DEFAULT_ERROR_MESSAGE = 'Não foi possível criar a venda. Tente novamente.';

interface SaleItemFormValue {
  catalogItemId: string;
  catalogItemName: string;
  quantity: string;
  priceApplied: string;
  defaultPrice: string;
}

interface SaleTransactionFormValue {
  paymentMethod: PaymentMethod | '';
  amount: string;
  installments: boolean;
  installmentCount: string;
  dueDate: string;
  receivedNow: boolean;
  markFirstInstallmentAsReceived: boolean;
}

interface SaleFormModel {
  customerId: string | null;
  employeeId: string | null;
  items: SaleItemFormValue[];
  transactions: SaleTransactionFormValue[];
}

type SaveResult = { ok: true; saleId: string } | { ok: false; message: string };

function emptyModel(): SaleFormModel {
  return { customerId: null, employeeId: null, items: [], transactions: [] };
}

function emptyItem(): SaleItemFormValue {
  return { catalogItemId: '', catalogItemName: '', quantity: '1', priceApplied: '', defaultPrice: '' };
}

function emptyTransaction(): SaleTransactionFormValue {
  return {
    paymentMethod: '',
    amount: '',
    installments: false,
    installmentCount: '2',
    dueDate: '',
    receivedNow: false,
    markFirstInstallmentAsReceived: false,
  };
}

function toBig(value: string): Big | null {
  const trimmed = value.trim();
  if (!trimmed || Number.isNaN(Number(trimmed))) {
    return null;
  }
  return new Big(trimmed);
}

@Component({
  selector: 'app-sale-form',
  imports: [
    AlertComponent,
    ButtonComponent,
    CurrencyPipe,
    FormField,
    FormFieldComponent,
    FormRoot,
    IconButtonComponent,
    InputDirective,
    LabelComponent,
    NgxMaskDirective,
    RouterLink,
    SelectDirective,
    SwitchComponent,
    TypeaheadComponent,
  ],
  templateUrl: './sale-form.component.html',
  host: {
    class: 'page-container',
  },
})
export class SaleFormComponent {
  readonly appointmentIdParam = input('', { alias: 'appointmentId' });
  readonly appointment = input.required<AppointmentDetail | null>();

  private readonly customerService = inject(CustomerService);
  private readonly employeeService = inject(EmployeeService);
  private readonly catalogItemService = inject(CatalogItemService);
  private readonly saleService = inject(SaleService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly PaymentMethod = PaymentMethod;
  protected readonly paymentMethodOptions = Object.values(PaymentMethod);
  protected readonly LucideTrash2 = LucideTrash2;

  private readonly catalogItemCache = new Map<string, CatalogItem>();

  protected readonly customerInitialItem = computed<TypeaheadItem | null>(() => {
    const appointment = this.appointment();
    return appointment ? { id: appointment.customerId, label: appointment.customerName } : null;
  });

  protected readonly employeeInitialItem = computed<TypeaheadItem | null>(() => {
    const appointment = this.appointment();
    return appointment ? { id: appointment.employeeId, label: appointment.employeeName } : null;
  });

  protected readonly itemInitialItems = computed<(TypeaheadItem | null)[]>(() => {
    const appointment = this.appointment();
    return appointment ? [{ id: appointment.catalogItemId, label: appointment.catalogItemName }] : [];
  });

  protected readonly model = linkedSignal<SaleFormModel>(() => {
    const appointment = this.appointment();
    if (!appointment) {
      return emptyModel();
    }
    return {
      customerId: appointment.customerId,
      employeeId: appointment.employeeId,
      items: [
        {
          catalogItemId: appointment.catalogItemId,
          catalogItemName: appointment.catalogItemName,
          quantity: '1',
          priceApplied: appointment.priceApplied,
          defaultPrice: appointment.priceApplied,
        },
      ],
      transactions: [],
    };
  });

  protected readonly submitErrorMessage = signal<string | null>(null);

  protected readonly f = form(
    this.model,
    (schema) => {
      required(schema.customerId, { message: 'Cliente é obrigatório' });
      required(schema.employeeId, { message: 'Funcionário é obrigatório' });
      applyEach(schema.items, (item) => {
        required(item.catalogItemId, { message: 'Item é obrigatório' });
        required(item.quantity, { message: 'Quantidade é obrigatória' });
        validate(item.quantity, ({ value }) => {
          const quantity = Number(value().trim());
          return Number.isInteger(quantity) && quantity > 0
            ? null
            : { kind: 'invalidQuantity', message: 'Quantidade deve ser maior que zero' };
        });
      });
      applyEach(schema.transactions, (transaction) => {
        required(transaction.amount, { message: 'Valor é obrigatório' });

        hidden(transaction.paymentMethod, { when: (ctx) => ctx.valueOf(transaction.installments) });
        required(transaction.paymentMethod, {
          message: 'Forma de pagamento é obrigatória',
          when: (ctx) => !ctx.valueOf(transaction.installments),
        });

        required(transaction.installmentCount, {
          message: 'Número de parcelas é obrigatório',
          when: (ctx) => ctx.valueOf(transaction.installments),
        });
        validate(transaction.installmentCount, ({ value }) => {
          const count = Number(value().trim());
          return !value().trim() || (Number.isInteger(count) && count >= 2)
            ? null
            : { kind: 'invalidInstallmentCount', message: 'Mínimo de 2 parcelas' };
        });

        required(transaction.dueDate, {
          message: 'Data de vencimento é obrigatória',
          when: (ctx) => ctx.valueOf(transaction.installments),
        });
      });
    },
    {
      submission: {
        action: async (field) => {
          this.submitErrorMessage.set(null);
          const value = field().value();

          const validationError = this.validate(value);
          if (validationError) {
            this.submitErrorMessage.set(validationError);
            return;
          }

          const result = await this.save(value);
          if (!result.ok) {
            this.submitErrorMessage.set(result.message);
            return;
          }

          this.toastService.success('Venda criada com sucesso.');
          this.router.navigate(['/sales', result.saleId]);
        },
      },
    },
  );

  protected readonly totalAmount = computed(() => {
    const items = this.f.items().value();
    const total = items.reduce((sum, item) => {
      const price = toBig(item.priceApplied) ?? toBig(item.defaultPrice);
      const quantity = Number(item.quantity) || 0;
      return price ? sum.plus(price.times(quantity)) : sum;
    }, new Big(0));
    return total.toFixed(2);
  });

  protected readonly confirmedPaidAmount = computed(() => {
    const transactions = this.f.transactions().value();
    const total = transactions.reduce((sum, transaction) => {
      const amount = toBig(transaction.amount);
      if (!amount) {
        return sum;
      }
      if (transaction.installments) {
        const installmentCount = Number(transaction.installmentCount);
        if (!transaction.markFirstInstallmentAsReceived || !Number.isInteger(installmentCount) || installmentCount < 2) {
          return sum;
        }
        return sum.plus(amount.div(installmentCount).round(2, Big.roundDown));
      }
      return transaction.receivedNow ? sum.plus(amount) : sum;
    }, new Big(0));
    return total.toFixed(2);
  });

  protected readonly remainingAmount = computed(() => {
    const remaining = new Big(this.totalAmount()).minus(this.confirmedPaidAmount());
    return remaining.lt(0) ? '0.00' : remaining.toFixed(2);
  });

  protected readonly customerSearchFn = (query: string) =>
    this.customerService
      .list({ name: query, limit: 10 })
      .pipe(map((result) => result.items.map((customer) => ({ id: customer.id, label: customer.name }))));

  protected readonly employeeSearchFn = (query: string) =>
    this.employeeService
      .list({ name: query, limit: 10 })
      .pipe(map((result) => result.items.map((employee) => ({ id: employee.id, label: employee.name }))));

  protected readonly catalogItemSearchFn = (query: string): Observable<TypeaheadItem[]> =>
    this.catalogItemService.list({ name: query, active: true, limit: 10 }).pipe(
      map((result) => {
        for (const item of result.items) {
          this.catalogItemCache.set(item.id, item);
        }
        return result.items.map((item) => ({ id: item.id, label: item.name }));
      }),
    );

  protected onCatalogItemSelected(index: number, item: TypeaheadItem | null) {
    const catalogItem = item ? this.catalogItemCache.get(item.id) : undefined;
    this.model.update((value) => ({
      ...value,
      items: value.items.map((row, i) =>
        i === index
          ? { ...row, catalogItemName: item?.label ?? '', defaultPrice: catalogItem?.defaultPrice ?? '' }
          : row,
      ),
    }));
  }

  protected addItem() {
    this.model.update((value) => ({ ...value, items: [...value.items, emptyItem()] }));
  }

  protected removeItem(index: number) {
    this.model.update((value) => ({ ...value, items: value.items.filter((_, i) => i !== index) }));
  }

  protected addTransaction() {
    this.model.update((value) => ({ ...value, transactions: [...value.transactions, emptyTransaction()] }));
  }

  protected removeTransaction(index: number) {
    this.model.update((value) => ({
      ...value,
      transactions: value.transactions.filter((_, i) => i !== index),
    }));
  }

  private validate(value: SaleFormModel): string | null {
    if (!value.items.length) {
      return 'Adicione pelo menos um item à venda.';
    }
    return null;
  }

  private buildPayload(value: SaleFormModel): SalePayload {
    const items: SaleItemPayload[] = value.items.map((item) => ({
      catalogItemId: item.catalogItemId,
      quantity: Number(item.quantity),
      priceApplied: item.priceApplied.trim() || undefined,
    }));

    const transactions: SaleTransactionPayload[] = value.transactions.map((transaction) => ({
      type: SaleTransactionType.Payment,
      paymentMethod: transaction.installments ? PaymentMethod.CreditCard : (transaction.paymentMethod as PaymentMethod),
      amount: transaction.amount,
      installmentCount: transaction.installments ? Number(transaction.installmentCount) : undefined,
      dueDate: transaction.dueDate || undefined,
      receivedAt:
        !transaction.installments && transaction.receivedNow ? new Date().toISOString() : undefined,
      markFirstInstallmentAsReceived: transaction.installments
        ? transaction.markFirstInstallmentAsReceived
        : undefined,
    }));

    return {
      customerId: value.customerId!,
      employeeId: value.employeeId!,
      appointmentId: this.appointmentIdParam() || undefined,
      items,
      transactions: transactions.length ? transactions : undefined,
    };
  }

  private save(value: SaleFormModel): Promise<SaveResult> {
    const payload = this.buildPayload(value);
    return firstValueFrom(
      this.saleService.create(payload).pipe(
        map((sale): SaveResult => ({ ok: true, saleId: sale.id })),
        catchError((error: unknown) =>
          of<SaveResult>({ ok: false, message: extractApiErrorMessage(error, DEFAULT_ERROR_MESSAGE) }),
        ),
      ),
    );
  }
}
