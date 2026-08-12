import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { disabled, form, FormField, FormRoot } from '@angular/forms/signals';
import { forkJoin, of } from 'rxjs';
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
import { EmployeeServicePayload } from '../employee-service.dto';
import { EmployeeService as EmployeeServiceModel } from '../employee-service.model';
import { EmployeeServiceService } from '../employee-service.service';
import { EmployeeDetail } from '../employee.model';
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

  protected readonly loading = signal(true);
  protected readonly loadErrorMessage = signal<string | null>(null);
  protected readonly employee = signal<EmployeeDetail | null>(null);
  protected readonly services = signal<TransferListItem[]>([]);

  protected readonly canManageServices = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { employeeService: ['create', 'delete'] } }),
  );

  private initialCatalogItemIds: string[] = [];
  private employeeServiceIdByCatalogItemId = new Map<string, string>();

  protected readonly servicesModel = signal({ catalogItemIds: [] as string[] });
  protected readonly servicesForm = form(this.servicesModel, (schema) => {
    disabled(schema.catalogItemIds, {
      when: () => !this.canManageServices() || this.saving(),
    });
  });

  protected readonly isDirty = computed(() => {
    const current = [...this.servicesForm.catalogItemIds().value()].sort();
    const initial = [...this.initialCatalogItemIds].sort();
    return current.length !== initial.length || current.some((id, index) => id !== initial[index]);
  });

  protected readonly saving = signal(false);
  protected readonly saveErrorMessage = signal<string | null>(null);
  protected readonly saveSuccessMessage = signal<string | null>(null);

  constructor() {
    // TODO(claude) this component should be more declarative, and less imperative
    // I don't like this approach of using an effect to fetch the data
    effect(() => {
      const employeeId = this.employeeId();
      untracked(() => this.load(employeeId));
    });
  }

  private load(employeeId: string) {
    this.loading.set(true);
    this.loadErrorMessage.set(null);

    forkJoin({
      employee: this.employeeService.getById(employeeId),
      services: this.catalogItemService.list({
        active: true,
        itemType: CatalogItemType.Service,
        limit: MAX_LIMIT,
      }),
      links: this.employeeServiceService.list({ employeeId, limit: MAX_LIMIT }),
    }).subscribe({
      next: ({ employee, services, links }) => {
        this.employee.set(employee);
        this.services.set(services.items.map((item) => ({ id: item.id, label: item.name })));
        this.setLinks(links.items);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loadErrorMessage.set(extractApiErrorMessage(error, DEFAULT_LOAD_ERROR_MESSAGE));
        this.loading.set(false);
      },
    });
  }

  private setLinks(links: EmployeeServiceModel[]) {
    this.employeeServiceIdByCatalogItemId = new Map(
      links.map((link) => [link.catalogItemId, link.id]),
    );
    this.initialCatalogItemIds = links.map((link) => link.catalogItemId);
    this.servicesModel.set({ catalogItemIds: [...this.initialCatalogItemIds] });
  }

  protected save() {
    const employeeId = this.employeeId();
    const current = this.servicesForm.catalogItemIds().value();
    const addedCatalogItemIds = current.filter((id) => !this.initialCatalogItemIds.includes(id));
    const removedCatalogItemIds = this.initialCatalogItemIds.filter((id) => !current.includes(id));

    if (!addedCatalogItemIds.length && !removedCatalogItemIds.length) {
      return;
    }

    this.saving.set(true);
    this.saveErrorMessage.set(null);
    this.saveSuccessMessage.set(null);

    // TODO(claude) this is horrible, create a bulk end-point in the back-end to handle additions and deletions
    const creates$ = addedCatalogItemIds.map((catalogItemId) =>
      this.employeeServiceService.create({
        employeeId,
        catalogItemId,
      } satisfies EmployeeServicePayload),
    );
    const deletes$ = removedCatalogItemIds.map((catalogItemId) =>
      this.employeeServiceService.delete(this.employeeServiceIdByCatalogItemId.get(catalogItemId)!),
    );

    forkJoin([...creates$, ...deletes$, of(null)]).subscribe({
      next: () => {
        this.employeeServiceService.list({ employeeId, limit: MAX_LIMIT }).subscribe({
          next: (links) => {
            this.setLinks(links.items);
            this.saving.set(false);
            this.saveSuccessMessage.set('Serviços atualizados com sucesso.');
          },
          error: (error: unknown) => {
            this.saving.set(false);
            this.saveErrorMessage.set(extractApiErrorMessage(error, DEFAULT_SAVE_ERROR_MESSAGE));
          },
        });
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.saveErrorMessage.set(extractApiErrorMessage(error, DEFAULT_SAVE_ERROR_MESSAGE));
      },
    });
  }
}
