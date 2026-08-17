import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { tap } from 'rxjs';
import { BadgeComponent } from '../../../components/badge/badge.component';
import { ButtonComponent } from '../../../components/button/button.component';
import { LoadingOverlayDirective } from '../../../components/loading-overlay/loading-overlay.directive';
import { ToastService } from '../../../components/toast/toast.service';
import { AuthStore } from '../../../core/auth/auth.store';
import { DialogService } from '../../../core/dialog/dialog.service';
import { extractApiErrorMessage } from '../../../model/api-error';
import { AppointmentStatus } from '../../appointments/appointment-status.enum';
import { AppointmentService } from '../../appointments/appointment.service';
import { SaleStatus } from '../../sales/sale-status.enum';
import { SaleService } from '../../sales/sale.service';
import { UpdateCustomerPayload } from '../customer.dto';
import { CustomerDetail, CustomerPhone } from '../customer.model';
import { CustomerService } from '../customer.service';
import { CustomerInfoFormComponent } from './customer-info-form/customer-info-form.component';
import { CustomerPhonesFormComponent } from './customer-phones-form/customer-phones-form.component';

const DEFAULT_DELETE_ERROR_MESSAGE = 'Não foi possível excluir o cliente.';
const HISTORY_LIMIT = 10;

@Component({
  selector: 'app-customer-details',
  imports: [
    BadgeComponent,
    ButtonComponent,
    CurrencyPipe,
    CustomerInfoFormComponent,
    CustomerPhonesFormComponent,
    DatePipe,
    LoadingOverlayDirective,
    RouterLink,
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

  protected readonly customer = linkedSignal(() => this.initialCustomer());

  protected readonly canDelete = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customer: ['delete'] } }),
  );
  protected readonly canViewAppointments = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { appointment: ['get'] } }),
  );
  protected readonly canViewSales = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { sale: ['get'] } }),
  );

  protected onInfoSaved(payload: UpdateCustomerPayload) {
    this.customer.update((customer) => ({ ...customer, ...payload }));
  }

  protected onPhonesSaved(phones: CustomerPhone[]) {
    this.customer.update((customer) => ({ ...customer, phones }));
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
