import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { applyEach, disabled, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { LucideTrash2 } from '@lucide/angular';
import { NgxMaskDirective } from 'ngx-mask';
import { AlertComponent } from '../../../../components/alert/alert.component';
import { ButtonComponent } from '../../../../components/button/button.component';
import { FormFieldComponent } from '../../../../components/form-field/form-field.component';
import { IconButtonComponent } from '../../../../components/icon-button/icon-button.component';
import { InputDirective } from '../../../../components/input/input.directive';
import { LabelComponent } from '../../../../components/label/label.component';
import { SelectDirective } from '../../../../components/select/select.directive';
import { ToastService } from '../../../../components/toast/toast.service';
import { AuthStore } from '../../../../core/auth/auth.store';
import { extractApiErrorMessage } from '../../../../model/api-error';
import { PhoneType } from '../../../../model/phone-type.enum';
import { SyncCustomerPhonesPayload } from '../../customer.dto';
import { CustomerPhone } from '../../customer.model';
import { CustomerService } from '../../customer.service';

const DEFAULT_SAVE_ERROR_MESSAGE = 'Não foi possível salvar os telefones do cliente.';

interface PhoneFormValue {
  type: PhoneType;
  number: string;
}

function toPhonesFormModel(phones: CustomerPhone[] | undefined): { phones: PhoneFormValue[] } {
  return {
    phones: (phones ?? []).map((phone) => ({ type: phone.type, number: phone.number })),
  };
}

@Component({
  selector: 'app-customer-phones-form',
  imports: [
    AlertComponent,
    ButtonComponent,
    FormField,
    FormFieldComponent,
    FormRoot,
    IconButtonComponent,
    InputDirective,
    LabelComponent,
    NgxMaskDirective,
    SelectDirective,
  ],
  templateUrl: './customer-phones-form.component.html',
})
export class CustomerPhonesFormComponent {
  readonly customerId = input.required<string>();
  readonly phones = input<CustomerPhone[]>();

  readonly saved = output<CustomerPhone[]>();

  private readonly customerService = inject(CustomerService);
  private readonly authStore = inject(AuthStore);
  private readonly toastService = inject(ToastService);

  protected readonly PhoneType = PhoneType;
  protected readonly LucideTrash2 = LucideTrash2;

  protected readonly canUpdate = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customer: ['update'] } }),
  );

  private readonly phonesModel = linkedSignal(() => toPhonesFormModel(this.phones()));
  protected readonly phonesForm = form(this.phonesModel, (schema) => {
    applyEach(schema.phones, (phone) => {
      required(phone.number, { message: 'Número é obrigatório' });
      required(phone.type, { message: 'Tipo é obrigatório' });
    });
    disabled(schema, { when: () => !this.canUpdate() || this.phonesSaving() });
  });

  protected readonly phonesSaving = signal(false);
  protected readonly phonesSaveErrorMessage = signal<string | null>(null);

  protected addPhone() {
    this.phonesModel.update((value) => ({
      ...value,
      phones: [...value.phones, { type: PhoneType.Mobile, number: '' }],
    }));
  }

  protected removePhone(index: number) {
    this.phonesModel.update((value) => ({
      ...value,
      phones: value.phones.filter((_, i) => i !== index),
    }));
  }

  protected savePhones() {
    const phones: SyncCustomerPhonesPayload = this.phonesForm
      .phones()
      .value()
      .map((phone) => ({ type: phone.type, number: phone.number.trim() }));

    this.phonesSaving.set(true);
    this.phonesSaveErrorMessage.set(null);

    this.customerService.syncPhones(this.customerId(), phones).subscribe({
      next: (updatedPhones) => {
        this.phonesSaving.set(false);
        this.toastService.success('Telefones atualizados com sucesso.');
        this.saved.emit(updatedPhones);
      },
      error: (error: unknown) => {
        this.phonesSaving.set(false);
        this.phonesSaveErrorMessage.set(
          extractApiErrorMessage(error, DEFAULT_SAVE_ERROR_MESSAGE),
        );
      },
    });
  }
}
