import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import {
  applyEach,
  disabled,
  form,
  FormField,
  FormRoot,
  maxLength,
  pattern,
  required,
  validate,
  ValidationError,
} from '@angular/forms/signals';
import dayjs from 'dayjs/esm';
import { catchError, firstValueFrom, map, Observable, of } from 'rxjs';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { FormFieldComponent } from '../../../../../components/form-field/form-field.component';
import { HintComponent } from '../../../../../components/hint/hint.component';
import { InputDirective } from '../../../../../components/input/input.directive';
import { LabelComponent } from '../../../../../components/label/label.component';
import { SelectDirective } from '../../../../../components/select/select.directive';
import {
  TypeaheadComponent,
  TypeaheadItem,
} from '../../../../../components/typeahead/typeahead.component';
import { AlertComponent } from '../../../../../components/alert/alert.component';
import { IconButtonComponent } from '../../../../../components/icon-button/icon-button.component';
import { ToastService } from '../../../../../components/toast/toast.service';
import { extractApiErrorMessage, isApiErrorResponse } from '../../../../../model/api-error';
import { LucideTrash2 } from '@lucide/angular';
import { NgxMaskDirective } from 'ngx-mask';
import { AppointmentService } from '../../../../appointments/appointment.service';
import { CatalogItem } from '../../../../catalog-items/catalog-item.model';
import { CatalogItemService } from '../../../../catalog-items/catalog-item.service';
import { SaleService } from '../../../../sales/sale.service';
import { CustomerDetailsStore } from '../../customer-details.store';
import { CustomerFollowupItemPayload } from '../customer-followup.dto';
import { CustomerFollowup } from '../customer-followup.model';
import { CustomerFollowupService } from '../customer-followup.service';

const DEFAULT_ERROR_MESSAGE = 'Não foi possível salvar o follow-up. Tente novamente.';
const ENTITY_PICKER_LIMIT = 100;

interface CustomerFollowupItemFormValue {
  catalogItemId: string;
  catalogItemName: string;
  description: string;
  quantity: number | null;
  priceApplied: string;
}

interface CustomerFollowupFormModel {
  date: string;
  text: string;
  appointmentId: string;
  saleId: string;
  items: CustomerFollowupItemFormValue[];
}

type SaveResult =
  | { ok: true; customerFollowup: CustomerFollowup }
  | { ok: false; message: string; fieldErrors: Map<string, string[]> };

function emptyModel(): CustomerFollowupFormModel {
  return { date: dayjs().format('YYYY-MM-DD'), text: '', appointmentId: '', saleId: '', items: [] };
}

function emptyItem(): CustomerFollowupItemFormValue {
  return { catalogItemId: '', catalogItemName: '', description: '', quantity: 1, priceApplied: '' };
}

function modelFromRecord(record: CustomerFollowup): CustomerFollowupFormModel {
  return {
    date: dayjs(record.date).format('YYYY-MM-DD'),
    text: record.text,
    appointmentId: record.appointmentId ?? '',
    saleId: record.saleId ?? '',
    items: record.items.map((item) => ({
      catalogItemId: item.catalogItemId ?? '',
      catalogItemName: item.catalogItemName ?? '',
      description: item.description,
      quantity: item.quantity,
      priceApplied: item.priceApplied,
    })),
  };
}

@Component({
  selector: 'app-customer-followup-form-page',
  imports: [
    AlertComponent,
    ButtonComponent,
    FormField,
    FormFieldComponent,
    FormRoot,
    HintComponent,
    IconButtonComponent,
    InputDirective,
    LabelComponent,
    NgxMaskDirective,
    RouterLink,
    SelectDirective,
    TypeaheadComponent,
  ],
  templateUrl: './customer-followup-form-page.component.html',
})
export class CustomerFollowupFormPageComponent {
  readonly customerFollowup = input<CustomerFollowup>();

  private readonly customerDetailsStore = inject(CustomerDetailsStore);
  private readonly customerFollowupService = inject(CustomerFollowupService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly saleService = inject(SaleService);
  private readonly catalogItemService = inject(CatalogItemService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly LucideTrash2 = LucideTrash2;

  protected readonly customerId = computed(() => this.customerDetailsStore.customerId());
  protected readonly isEditing = computed(() => !!this.customerFollowup());

  protected readonly submitErrorMessage = signal<string | null>(null);
  protected readonly fieldErrorsByFieldId = signal<Map<string, string[]>>(new Map());

  private readonly appointmentIdChanged = signal(false);
  private readonly saleIdChanged = signal(false);

  private readonly catalogItemCache = new Map<string, CatalogItem>();

  protected readonly model = linkedSignal<CustomerFollowupFormModel>(() => {
    const record = this.customerFollowup();
    return record ? modelFromRecord(record) : emptyModel();
  });

  // The appointment/sale list APIs have no free-text search param (only
  // customerId/status/date-range), so these are bounded dropdowns scoped to
  // the customer, not a typeahead like the catalog-item picker below.
  protected readonly appointmentsResource = rxResource({
    params: () => ({ customerId: this.customerId() }),
    stream: ({ params }) =>
      this.appointmentService.list({ customerId: params.customerId, limit: ENTITY_PICKER_LIMIT }),
  });
  protected readonly appointmentOptions = computed(() =>
    (this.appointmentsResource.value()?.items ?? []).map((appointment) => ({
      id: appointment.id,
      label: `${dayjs(appointment.startTime).format('DD/MM/YYYY HH:mm')} — ${appointment.catalogItemName}`,
    })),
  );

  protected readonly salesResource = rxResource({
    params: () => ({
      customerId: this.customerId(),
      appointmentId: this.f.appointmentId().value() || undefined,
    }),
    stream: ({ params }) =>
      this.saleService.list({
        customerId: params.customerId,
        appointmentId: params.appointmentId,
        limit: ENTITY_PICKER_LIMIT,
      }),
  });
  protected readonly sales = computed(() => this.salesResource.value()?.items ?? []);
  protected readonly saleOptions = computed(() =>
    this.sales().map((sale) => ({
      id: sale.id,
      label: `${dayjs(sale.createdAt).format('DD/MM/YYYY')} — R$ ${Number(sale.totalAmount).toFixed(2).replace('.', ',')}`,
    })),
  );

  protected readonly f = form(
    this.model,
    (schema) => {
      required(schema.text, { message: 'Texto é obrigatório' });
      required(schema.date, { message: 'Data é obrigatória' });
      disabled(schema.appointmentId, { when: (ctx) => !!ctx.valueOf(schema.saleId) });

      applyEach(schema.items, (item) => {
        required(item.description, { message: 'Descrição é obrigatória' });
        maxLength(item.description, 2048, { message: 'Tamanho máximo de 2048 caracteres' });
        required(item.priceApplied, { message: 'Preço é obrigatório' });
        pattern(item.priceApplied, /^\d{1,8}(\.\d{1,2})?$/, { message: 'Preço inválido' });
        required(item.quantity, { message: 'Quantidade é obrigatória' });
        validate(item.quantity, ({ value }): ValidationError | null => {
          const quantity = value();
          return quantity !== null && Number.isInteger(quantity) && quantity > 0
            ? null
            : { kind: 'invalidQuantity', message: 'Quantidade deve ser maior que zero' };
        });
      });
    },
    {
      submission: {
        action: async (field) => {
          this.submitErrorMessage.set(null);
          this.fieldErrorsByFieldId.set(new Map());

          const value = field().value();
          const result = await this.save(value);

          if (!result.ok) {
            this.submitErrorMessage.set(result.message);
            this.fieldErrorsByFieldId.set(result.fieldErrors);
            return;
          }

          this.toastService.success(
            this.isEditing() ? 'Follow-up atualizado com sucesso.' : 'Follow-up criado com sucesso.',
          );
          await this.router.navigate([
            '/customers',
            this.customerId(),
            'follow-up',
            result.customerFollowup.id,
          ]);
        },
      },
    },
  );

  protected readonly itemInitialItems = computed<(TypeaheadItem | null)[]>(() =>
    this.model().items.map((item) =>
      item.catalogItemId ? { id: item.catalogItemId, label: item.catalogItemName } : null,
    ),
  );

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
          ? {
              ...row,
              catalogItemName: item?.label ?? '',
              priceApplied: row.priceApplied || (catalogItem?.defaultPrice ?? ''),
            }
          : row,
      ),
    }));
  }

  protected onAppointmentChange() {
    this.appointmentIdChanged.set(true);
  }

  protected onSaleChange() {
    this.saleIdChanged.set(true);
    const saleId = this.f.saleId().value();
    if (!saleId) {
      return;
    }
    const sale = this.sales().find((item) => item.id === saleId);
    this.appointmentIdChanged.set(true);
    this.model.update((value) => ({ ...value, appointmentId: sale?.appointmentId ?? '' }));
  }

  protected addItem() {
    this.model.update((value) => ({ ...value, items: [...value.items, emptyItem()] }));
    this.f.items().markAsDirty();
  }

  protected removeItem(index: number) {
    this.model.update((value) => ({ ...value, items: value.items.filter((_, i) => i !== index) }));
    this.f.items().markAsDirty();
  }

  private buildItemsPayload(items: CustomerFollowupItemFormValue[]): CustomerFollowupItemPayload[] {
    return items.map((item) => ({
      description: item.description.trim(),
      catalogItemId: item.catalogItemId || undefined,
      quantity: item.quantity ?? 1,
      priceApplied: item.priceApplied.trim(),
    }));
  }

  private save(value: CustomerFollowupFormModel): Promise<SaveResult> {
    const isoDate = dayjs(value.date).toISOString();
    const items = this.buildItemsPayload(value.items);
    const record = this.customerFollowup();
    const customerId = this.customerId();

    const request$: Observable<SaveResult> = record
      ? this.customerFollowupService
          .update(record.id, {
            text: value.text,
            date: isoDate,
            appointmentId: this.appointmentIdChanged() ? value.appointmentId || null : undefined,
            saleId: this.saleIdChanged() ? value.saleId || null : undefined,
            items,
          })
          .pipe(
            map(
              (): SaveResult => ({
                ok: true,
                customerFollowup: { ...record, text: value.text, date: isoDate },
              }),
            ),
          )
      : this.customerFollowupService
          .create({
            customerId,
            text: value.text,
            date: isoDate,
            appointmentId: value.appointmentId || undefined,
            saleId: value.saleId || undefined,
            items,
          })
          .pipe(map((created): SaveResult => ({ ok: true, customerFollowup: created })));

    return firstValueFrom(request$.pipe(catchError((error) => of(this.toSaveError(error)))));
  }

  private toSaveError(error: unknown): SaveResult {
    const fieldErrors = new Map<string, string[]>();
    const body =
      error && typeof error === 'object' && 'error' in error
        ? (error as { error: unknown }).error
        : undefined;

    if (isApiErrorResponse(body)) {
      for (const detail of body.error.details ?? []) {
        fieldErrors.set(detail.field, [...(fieldErrors.get(detail.field) ?? []), detail.issue]);
      }
    }

    return {
      ok: false,
      message: extractApiErrorMessage(error, DEFAULT_ERROR_MESSAGE),
      fieldErrors,
    };
  }
}
