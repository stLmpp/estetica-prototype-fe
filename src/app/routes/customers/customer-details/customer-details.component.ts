import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { disabled, form, FormField, FormRoot } from '@angular/forms/signals';
import { NgxMaskDirective } from 'ngx-mask';
import { tap } from 'rxjs';
import { AlertComponent } from '../../../components/alert/alert.component';
import { BadgeComponent } from '../../../components/badge/badge.component';
import { ButtonComponent } from '../../../components/button/button.component';
import { FormFieldComponent } from '../../../components/form-field/form-field.component';
import { InputDirective } from '../../../components/input/input.directive';
import { LabelComponent } from '../../../components/label/label.component';
import { LoadingOverlayDirective } from '../../../components/loading-overlay/loading-overlay.directive';
import { SelectDirective } from '../../../components/select/select.directive';
import { ToastService } from '../../../components/toast/toast.service';
import { AuthStore } from '../../../core/auth/auth.store';
import { DialogService } from '../../../core/dialog/dialog.service';
import { extractApiErrorMessage } from '../../../model/api-error';
import { MaritalStatus } from '../../../model/marital-status.enum';
import { AppointmentStatus } from '../../appointments/appointment-status.enum';
import { AppointmentService } from '../../appointments/appointment.service';
import { SaleStatus } from '../../sales/sale-status.enum';
import { SaleService } from '../../sales/sale.service';
import { UpdateCustomerPayload } from '../customer.dto';
import { CustomerDetail } from '../customer.model';
import { CustomerService } from '../customer.service';

const DEFAULT_SAVE_ERROR_MESSAGE = 'Não foi possível salvar os dados do cliente.';
const DEFAULT_DELETE_ERROR_MESSAGE = 'Não foi possível excluir o cliente.';
const HISTORY_LIMIT = 10;

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
  selector: 'app-customer-details',
  imports: [
    AlertComponent,
    BadgeComponent,
    ButtonComponent,
    CurrencyPipe,
    DatePipe,
    FormField,
    FormFieldComponent,
    FormRoot,
    InputDirective,
    LabelComponent,
    LoadingOverlayDirective,
    NgxMaskDirective,
    RouterLink,
    SelectDirective,
  ],
  templateUrl: './customer-details.component.html',
  host: {
    class: 'page-container',
  },
})
export class CustomerDetailsComponent {
  readonly customerId = input.required<string>();
  readonly initialCustomer = input.required<CustomerDetail>({ alias: 'customer' });

  private readonly customerService = inject(CustomerService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly saleService = inject(SaleService);
  private readonly authStore = inject(AuthStore);
  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly AppointmentStatus = AppointmentStatus;
  protected readonly SaleStatus = SaleStatus;
  protected readonly MaritalStatus = MaritalStatus;

  protected readonly customer = linkedSignal(() => this.initialCustomer());

  protected readonly canUpdate = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customer: ['update'] } }),
  );
  protected readonly canDelete = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customer: ['delete'] } }),
  );
  protected readonly canViewAppointments = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { appointment: ['get'] } }),
  );
  protected readonly canViewSales = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { sale: ['get'] } }),
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
        this.customer.update((customer) => ({ ...customer, ...payload }));
      },
      error: (error: unknown) => {
        this.infoSaving.set(false);
        this.infoSaveErrorMessage.set(extractApiErrorMessage(error, DEFAULT_SAVE_ERROR_MESSAGE));
      },
    });
  }

  private readonly appointmentsResource = rxResource({
    params: () => (this.canViewAppointments() ? this.customerId() : undefined),
    stream: ({ params: customerId }) =>
      this.appointmentService.list({ customerId, limit: HISTORY_LIMIT }),
  });
  protected readonly appointmentsLoading = computed(() => this.appointmentsResource.isLoading());
  protected readonly appointments = computed(() => this.appointmentsResource.value()?.items ?? []);

  private readonly salesResource = rxResource({
    params: () => (this.canViewSales() ? this.customerId() : undefined),
    stream: ({ params: customerId }) => this.saleService.list({ customerId, limit: HISTORY_LIMIT }),
  });
  protected readonly salesLoading = computed(() => this.salesResource.isLoading());
  protected readonly sales = computed(() => this.salesResource.value()?.items ?? []);

  protected openDeleteDialog() {
    const customer = this.customer();

    this.dialogService.openConfirm({
      title: 'Excluir cliente',
      message: `Tem certeza que deseja excluir "${customer.name}"? Essa ação não pode ser desfeita.`,
      actions: [
        { label: 'Voltar', btnOutline: true },
        {
          label: 'Excluir',
          danger: true,
          onClick: () =>
            this.customerService.delete(this.customerId()).pipe(
              tap({
                next: () => {
                  this.toastService.success('Cliente excluído com sucesso.');
                  this.router.navigate(['/customers']);
                },
                error: (error: unknown) => {
                  this.toastService.error(
                    extractApiErrorMessage(error, DEFAULT_DELETE_ERROR_MESSAGE),
                  );
                },
              }),
            ),
        },
      ],
    });
  }
}
