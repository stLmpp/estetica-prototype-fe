import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { disabled, form, FormField, FormRoot } from '@angular/forms/signals';
import { NgxMaskDirective } from 'ngx-mask';
import { AlertComponent } from '../../../../components/alert/alert.component';
import { ButtonComponent } from '../../../../components/button/button.component';
import { FormFieldComponent } from '../../../../components/form-field/form-field.component';
import { InputDirective } from '../../../../components/input/input.directive';
import { LabelComponent } from '../../../../components/label/label.component';
import { SelectDirective } from '../../../../components/select/select.directive';
import { ToastService } from '../../../../components/toast/toast.service';
import { AuthStore } from '../../../../core/auth/auth.store';
import { extractApiErrorMessage } from '../../../../model/api-error';
import { MaritalStatus } from '../../../../model/marital-status.enum';
import { UpdateCustomerPayload } from '../../customer.dto';
import { CustomerDetail } from '../../customer.model';
import { CustomerService } from '../../customer.service';

const DEFAULT_SAVE_ERROR_MESSAGE = 'Não foi possível salvar os dados do cliente.';

interface CustomerInfoFormModel {
  birthDate: string;
  address: string;
  zipCode: string;
  neighborhood: string;
  city: string;
  state: string;
  jobName: string;
  maritalStatus: MaritalStatus | '';
  email: string;
}

function toFormModel(customer: CustomerDetail): CustomerInfoFormModel {
  return {
    birthDate: customer.birthDate ?? '',
    address: customer.address ?? '',
    zipCode: customer.zipCode ?? '',
    neighborhood: customer.neighborhood ?? '',
    city: customer.city ?? '',
    state: customer.state ?? '',
    jobName: customer.jobName ?? '',
    maritalStatus: customer.maritalStatus ?? '',
    email: customer.email ?? '',
  };
}

@Component({
  selector: 'app-customer-info-form',
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
  ],
  templateUrl: './customer-info-form.component.html',
})
export class CustomerInfoFormComponent {
  readonly customerId = input.required<string>();
  readonly customer = input.required<CustomerDetail>();

  readonly saved = output<UpdateCustomerPayload>();

  private readonly customerService = inject(CustomerService);
  private readonly authStore = inject(AuthStore);
  private readonly toastService = inject(ToastService);

  protected readonly MaritalStatus = MaritalStatus;

  protected readonly canUpdate = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customer: ['update'] } }),
  );

  private readonly infoModel = linkedSignal(() => toFormModel(this.customer()));
  protected readonly infoForm = form(this.infoModel, (schema) => {
    disabled(schema, { when: () => !this.canUpdate() || this.infoSaving() });
  });

  protected readonly infoSaving = signal(false);
  protected readonly infoSaveErrorMessage = signal<string | null>(null);

  protected saveInfo() {
    const value = this.infoForm().value();
    const payload: UpdateCustomerPayload = {
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

    this.infoSaving.set(true);
    this.infoSaveErrorMessage.set(null);

    this.customerService.update(this.customerId(), payload).subscribe({
      next: () => {
        this.infoSaving.set(false);
        this.toastService.success('Cliente atualizado com sucesso.');
        this.saved.emit(payload);
      },
      error: (error: unknown) => {
        this.infoSaving.set(false);
        this.infoSaveErrorMessage.set(extractApiErrorMessage(error, DEFAULT_SAVE_ERROR_MESSAGE));
      },
    });
  }
}
