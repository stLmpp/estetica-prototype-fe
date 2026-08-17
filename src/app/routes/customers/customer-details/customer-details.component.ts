import { Component, computed, effect, inject, input } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { tap } from 'rxjs';
import { ButtonComponent } from '../../../components/button/button.component';
import { TabItem } from '../../../components/tabs/tab-item.model';
import { TabsComponent } from '../../../components/tabs/tabs.component';
import { ToastService } from '../../../components/toast/toast.service';
import { AuthStore } from '../../../core/auth/auth.store';
import { DialogService } from '../../../core/dialog/dialog.service';
import { extractApiErrorMessage } from '../../../model/api-error';
import { CustomerDetail } from '../customer.model';
import { CustomerService } from '../customer.service';
import { CustomerDetailsStore } from './customer-details.store';

const DEFAULT_DELETE_ERROR_MESSAGE = 'Não foi possível excluir o cliente.';

@Component({
  selector: 'app-customer-details',
  imports: [ButtonComponent, RouterLink, RouterOutlet, TabsComponent],
  providers: [CustomerDetailsStore],
  templateUrl: './customer-details.component.html',
  host: {
    class: 'page-container',
  },
})
export class CustomerDetailsComponent {
  readonly customerId = input.required<string>();
  readonly initialCustomer = input.required<CustomerDetail>({ alias: 'customer' });

  protected readonly store = inject(CustomerDetailsStore);
  private readonly customerService = inject(CustomerService);
  private readonly authStore = inject(AuthStore);
  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly canDelete = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customer: ['delete'] } }),
  );
  protected readonly canViewAppointments = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { appointment: ['get'] } }),
  );
  protected readonly canViewSales = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { sale: ['get'] } }),
  );
  protected readonly canViewAnamnesis = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customerAnamnesis: ['get'] } }),
  );

  protected readonly tabs = computed<TabItem[]>(() => [
    { label: 'Info', link: 'info' },
    { label: 'Telefones', link: 'phones' },
    ...(this.canViewAppointments()
      ? [{ label: 'Agendamentos recentes', link: 'appointments' }]
      : []),
    ...(this.canViewSales() ? [{ label: 'Vendas recentes', link: 'sales' }] : []),
    ...(this.canViewAnamnesis() ? [{ label: 'Anamnese', link: 'anamnesis' }] : []),
  ]);

  constructor() {
    effect(() => this.store.setCustomer(this.customerId(), this.initialCustomer()));
  }

  protected openDeleteDialog() {
    const customer = this.store.customer();
    if (!customer) {
      return;
    }

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
