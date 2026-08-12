import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { disabled, form, FormField, FormRoot } from '@angular/forms/signals';
import { forkJoin } from 'rxjs';
import { AlertComponent } from '../../../components/alert/alert.component';
import { ButtonComponent } from '../../../components/button/button.component';
import { LoadingOverlayDirective } from '../../../components/loading-overlay/loading-overlay.directive';
import {
  TransferListComponent,
  TransferListItem,
} from '../../../components/transfer-list/transfer-list.component';
import { AuthStore } from '../../../core/auth/auth.store';
import { extractApiErrorMessage } from '../../../model/api-error';
import { CatalogItemType } from '../../catalog-items/catalog-item-type.enum';
import { CatalogItemService } from '../../catalog-items/catalog-item.service';
import { EmployeeServiceService } from '../employee-service.service';
import { EmployeeService } from '../employee.service';

const DEFAULT_LOAD_ERROR_MESSAGE = 'Não foi possível carregar os dados do funcionário.';
const DEFAULT_SAVE_ERROR_MESSAGE = 'Não foi possível salvar os serviços do funcionário.';
const MAX_LIMIT = 100;

@Component({
  selector: 'app-employee-details',
  imports: [
    AlertComponent,
    ButtonComponent,
    FormField,
    FormRoot,
    LoadingOverlayDirective,
    RouterLink,
    TransferListComponent,
  ],
  templateUrl: './employee-details.component.html',
  host: {
    class: 'mx-auto flex max-w-5xl flex-col gap-6 p-6',
  },
})
export class EmployeeDetailsComponent {
  readonly employeeId = input.required<string>();

  private readonly employeeService = inject(EmployeeService);
  private readonly catalogItemService = inject(CatalogItemService);
  private readonly employeeServiceService = inject(EmployeeServiceService);
  private readonly authStore = inject(AuthStore);

  private readonly employeeResource = rxResource({
    params: this.employeeId,
    stream: ({ params: employeeId }) =>
      forkJoin({
        employee: this.employeeService.getById(employeeId),
        services: this.catalogItemService.list({
          active: true,
          itemType: CatalogItemType.Service,
          limit: MAX_LIMIT,
        }),
        links: this.employeeServiceService.list({ employeeId, limit: MAX_LIMIT }),
      }),
  });

  protected readonly loading = computed(() => this.employeeResource.isLoading());
  protected readonly loadErrorMessage = computed(() => {
    const error = this.employeeResource.error();
    return error ? extractApiErrorMessage(error, DEFAULT_LOAD_ERROR_MESSAGE) : null;
  });
  protected readonly employee = computed(() => this.employeeResource.value()?.employee ?? null);
  protected readonly services = computed<TransferListItem[]>(() =>
    (this.employeeResource.value()?.services.items ?? []).map((item) => ({ id: item.id, label: item.name })),
  );

  private readonly initialCatalogItemIds = computed(() =>
    (this.employeeResource.value()?.links.items ?? []).map((link) => link.catalogItemId),
  );

  protected readonly canManageServices = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { employeeService: ['create', 'delete'] } }),
  );

  protected readonly servicesModel = linkedSignal(() => ({
    catalogItemIds: [...this.initialCatalogItemIds()],
  }));
  protected readonly servicesForm = form(this.servicesModel, (schema) => {
    disabled(schema.catalogItemIds, {
      when: () => !this.canManageServices() || this.saving(),
    });
  });

  protected readonly isDirty = computed(() => {
    const current = [...this.servicesForm.catalogItemIds().value()].sort();
    const initial = [...this.initialCatalogItemIds()].sort();
    return current.length !== initial.length || current.some((id, index) => id !== initial[index]);
  });

  protected readonly saving = signal(false);
  protected readonly saveErrorMessage = signal<string | null>(null);
  protected readonly saveSuccessMessage = signal<string | null>(null);

  protected save() {
    const employeeId = this.employeeId();
    const catalogItemIds = this.servicesForm.catalogItemIds().value();

    this.saving.set(true);
    this.saveErrorMessage.set(null);
    this.saveSuccessMessage.set(null);

    this.employeeServiceService.sync(employeeId, catalogItemIds).subscribe({
      next: () => {
        this.saving.set(false);
        this.saveSuccessMessage.set('Serviços atualizados com sucesso.');
        this.employeeResource.reload();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.saveErrorMessage.set(extractApiErrorMessage(error, DEFAULT_SAVE_ERROR_MESSAGE));
      },
    });
  }
}
