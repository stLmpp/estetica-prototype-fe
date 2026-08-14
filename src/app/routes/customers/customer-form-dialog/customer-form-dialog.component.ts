import { Component, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { applyEach, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { catchError, firstValueFrom, map, Observable, of } from 'rxjs';
import { ButtonComponent } from '../../../components/button/button.component';
import { FormFieldComponent } from '../../../components/form-field/form-field.component';
import { InputDirective } from '../../../components/input/input.directive';
import { LabelComponent } from '../../../components/label/label.component';
import { LoadingOverlayDirective } from '../../../components/loading-overlay/loading-overlay.directive';
import { SelectDirective } from '../../../components/select/select.directive';
import { ToastService } from '../../../components/toast/toast.service';
import { extractApiErrorMessage } from '../../../model/api-error';
import { CustomerPayload, UpdateCustomerPayload } from '../customer.dto';
import { Customer, CustomerDetail, CustomerPhone } from '../customer.model';
import { CustomerService } from '../customer.service';
import { CustomersStore } from '../customers.store';
import { MaritalStatus } from '../../../model/marital-status.enum';
import { PhoneType } from '../../../model/phone-type.enum';
import { NgxMaskDirective } from 'ngx-mask';

export interface CustomerFormDialogData {
  customerId?: string;
}

interface PhoneFormValue {
  type: PhoneType;
  number: string;
}

interface CustomerFormModel {
  name: string;
  birthDate: string;
  address: string;
  zipCode: string;
  neighborhood: string;
  city: string;
  state: string;
  jobName: string;
  maritalStatus: MaritalStatus | '';
  email: string;
  phones: PhoneFormValue[];
}

type SaveResult = { ok: true; customer: Customer } | { ok: false; message: string };

const DEFAULT_ERROR_MESSAGE = 'Não foi possível salvar o cliente. Tente novamente.';
const DEFAULT_LOAD_ERROR_MESSAGE = 'Não foi possível carregar os dados do cliente.';

function emptyModel(): CustomerFormModel {
  return {
    name: '',
    birthDate: '',
    address: '',
    zipCode: '',
    neighborhood: '',
    city: '',
    state: '',
    jobName: '',
    maritalStatus: '',
    email: '',
    phones: [],
  };
}

function toFormModel(customer: CustomerDetail): CustomerFormModel {
  return {
    name: customer.name,
    birthDate: customer.birthDate ?? '',
    address: customer.address ?? '',
    zipCode: customer.zipCode ?? '',
    neighborhood: customer.neighborhood ?? '',
    city: customer.city ?? '',
    state: customer.state ?? '',
    jobName: customer.jobName ?? '',
    maritalStatus: customer.maritalStatus ?? '',
    email: customer.email ?? '',
    phones: [],
  };
}

@Component({
  selector: 'app-customer-form-dialog',
  imports: [
    ButtonComponent,
    FormField,
    FormFieldComponent,
    FormRoot,
    InputDirective,
    LabelComponent,
    LoadingOverlayDirective,
    NgxMaskDirective,
    SelectDirective,
  ],
  templateUrl: './customer-form-dialog.component.html',
  host: {
    class: 'block rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800',
  },
})
export class CustomerFormDialogComponent {
  protected readonly data = inject<CustomerFormDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<Customer | undefined>);
  private readonly store = inject(CustomersStore);
  private readonly customerService = inject(CustomerService);
  private readonly toastService = inject(ToastService);

  protected readonly isEditing = !!this.data.customerId;
  protected readonly MaritalStatus = MaritalStatus;
  protected readonly PhoneType = PhoneType;
  protected readonly submitErrorMessage = signal<string | null>(null);

  protected readonly loading = signal(this.isEditing);
  protected readonly loadErrorMessage = signal<string | null>(null);
  protected readonly existingPhones = signal<CustomerPhone[]>([]);

  protected readonly model = signal(emptyModel());

  protected readonly f = form(
    this.model,
    (schema) => {
      required(schema.name, { message: 'Nome é obrigatório' });
      applyEach(schema.phones, (phone) => {
        required(phone.number, { message: 'Número é obrigatório' });
        required(phone.type, { message: 'Tipo é obrigatório' });
      });
    },
    {
      submission: {
        action: async (field) => {
          this.submitErrorMessage.set(null);

          const value = field().value();
          const result = this.isEditing
            ? await this.save(this.buildUpdatePayload(value))
            : await this.save(this.buildCreatePayload(value));

          if (!result.ok) {
            this.submitErrorMessage.set(result.message);
            return;
          }

          this.toastService.success(
            this.isEditing ? 'Cliente atualizado com sucesso.' : 'Cliente criado com sucesso.',
          );
          this.dialogRef.close(result.customer);
        },
      },
    },
  );

  constructor() {
    if (this.data.customerId) {
      this.customerService.getById(this.data.customerId).subscribe({
        next: (customer) => {
          this.model.set(toFormModel(customer));
          this.existingPhones.set(customer.phones ?? []);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.loadErrorMessage.set(
            extractApiErrorMessage(error, DEFAULT_LOAD_ERROR_MESSAGE),
          );
          this.loading.set(false);
        },
      });
    }
  }

  private buildCreatePayload(value: CustomerFormModel): CustomerPayload {
    return {
      name: value.name.trim(),
      birthDate: value.birthDate || undefined,
      address: value.address.trim() || undefined,
      zipCode: value.zipCode.trim() || undefined,
      neighborhood: value.neighborhood.trim() || undefined,
      city: value.city.trim() || undefined,
      state: value.state.trim() || undefined,
      jobName: value.jobName.trim() || undefined,
      maritalStatus: value.maritalStatus || undefined,
      email: value.email.trim() || undefined,
      phones: value.phones.length
        ? value.phones.map((phone) => ({ type: phone.type, number: phone.number.trim() }))
        : undefined,
    };
  }

  private buildUpdatePayload(value: CustomerFormModel): UpdateCustomerPayload {
    return {
      name: value.name.trim(),
      birthDate: value.birthDate || undefined,
      address: value.address.trim() || undefined,
      zipCode: value.zipCode.trim() || undefined,
      neighborhood: value.neighborhood.trim() || undefined,
      city: value.city.trim() || undefined,
      state: value.state.trim() || undefined,
      jobName: value.jobName.trim() || undefined,
      maritalStatus: value.maritalStatus || undefined,
      email: value.email.trim() || undefined,
    };
  }

  private save(payload: CustomerPayload | UpdateCustomerPayload): Promise<SaveResult> {
    const request$: Observable<SaveResult> =
      this.isEditing && this.data.customerId
        ? this.store.updateCustomer(this.data.customerId, payload).pipe(
            map(
              (): SaveResult => ({
                ok: true,
                customer: { id: this.data.customerId!, name: payload.name ?? '' },
              }),
            ),
          )
        : this.store
            .createCustomer(payload as CustomerPayload)
            .pipe(map((customer) => ({ ok: true, customer })));

    return firstValueFrom(
      request$.pipe(
        catchError((error) =>
          of<SaveResult>({
            ok: false,
            message: extractApiErrorMessage(error, DEFAULT_ERROR_MESSAGE),
          }),
        ),
      ),
    );
  }

  protected addPhone() {
    this.model.update((value) => ({
      ...value,
      phones: [...value.phones, { type: PhoneType.Mobile, number: '' }],
    }));
  }

  protected removePhone(index: number) {
    this.model.update((value) => ({
      ...value,
      phones: value.phones.filter((_, i) => i !== index),
    }));
  }

  protected cancel() {
    this.dialogRef.close(undefined);
  }
}
