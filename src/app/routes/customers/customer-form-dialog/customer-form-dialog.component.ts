import { Component, inject, signal } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { applyEach, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { ButtonComponent } from '../../../components/button/button.component';
import { FormFieldComponent } from '../../../components/form-field/form-field.component';
import { InputDirective } from '../../../components/input/input.directive';
import { LabelComponent } from '../../../components/label/label.component';
import { SelectDirective } from '../../../components/select/select.directive';
import { ToastService } from '../../../components/toast/toast.service';
import { extractApiErrorMessage } from '../../../model/api-error';
import { CustomerPayload } from '../customer.dto';
import { Customer } from '../customer.model';
import { CustomersStore } from '../customers.store';
import { MaritalStatus } from '../../../model/marital-status.enum';
import { PhoneType } from '../../../model/phone-type.enum';
import { NgxMaskDirective } from 'ngx-mask';

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

@Component({
  selector: 'app-customer-form-dialog',
  imports: [
    ButtonComponent,
    FormField,
    FormFieldComponent,
    FormRoot,
    InputDirective,
    LabelComponent,
    NgxMaskDirective,
    SelectDirective,
  ],
  templateUrl: './customer-form-dialog.component.html',
  host: {
    class: 'block rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800',
  },
})
export class CustomerFormDialogComponent {
  private readonly dialogRef = inject(DialogRef<Customer | undefined>);
  private readonly store = inject(CustomersStore);
  private readonly toastService = inject(ToastService);

  protected readonly MaritalStatus = MaritalStatus;
  protected readonly PhoneType = PhoneType;
  protected readonly submitErrorMessage = signal<string | null>(null);

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

          const result = await this.save(this.buildCreatePayload(field().value()));

          if (!result.ok) {
            this.submitErrorMessage.set(result.message);
            return;
          }

          this.toastService.success('Cliente criado com sucesso.');
          this.dialogRef.close(result.customer);
        },
      },
    },
  );

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

  private save(payload: CustomerPayload): Promise<SaveResult> {
    return firstValueFrom(
      this.store.createCustomer(payload).pipe(
        map((customer): SaveResult => ({ ok: true, customer })),
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
