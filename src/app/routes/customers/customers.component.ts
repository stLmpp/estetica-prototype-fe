import {
  Component,
  computed,
  effect,
  inject,
  input,
  Injector,
  numberAttribute,
  signal,
  viewChild,
  TemplateRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { debounce, form, FormField } from '@angular/forms/signals';
import { LucidePencil, LucidePlus, LucideTrash2 } from '@lucide/angular';
import { AlertComponent } from '../../components/alert/alert.component';
import { ButtonComponent } from '../../components/button/button.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../components/confirm-dialog/confirm-dialog.component';
import { FormFieldComponent } from '../../components/form-field/form-field.component';
import { IconComponent } from '../../components/icon/icon.component';
import { IconButtonComponent } from '../../components/icon-button/icon-button.component';
import { InputDirective } from '../../components/input/input.directive';
import { LabelComponent } from '../../components/label/label.component';
import { LoadingOverlayDirective } from '../../components/loading-overlay/loading-overlay.directive';
import { PaginatorComponent } from '../../components/paginator/paginator.component';
import { PreloadDirective } from '../../components/preload/preload.directive';
import { ColDef } from '../../components/table/model/col-def';
import { TableEvent } from '../../components/table/model/table-event';
import { TableComponent } from '../../components/table/table.component';
import { AuthStore } from '../../core/auth/auth.store';
import { DialogService } from '../../core/dialog/dialog.service';
import { type CustomerFormDialogData } from './customer-form-dialog/customer-form-dialog.component';
import { Customer } from './customer.model';
import { CustomersStore, PAGE_SIZE } from './customers.store';

const SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-customers',
  imports: [
    AlertComponent,
    ButtonComponent,
    FormField,
    FormFieldComponent,
    IconButtonComponent,
    IconComponent,
    InputDirective,
    LabelComponent,
    LoadingOverlayDirective,
    PaginatorComponent,
    PreloadDirective,
    TableComponent,
  ],
  templateUrl: './customers.component.html',
  host: {
    class: 'mx-auto flex max-w-5xl flex-col gap-6 p-6',
  },
  providers: [CustomersStore],
})
export class CustomersComponent {
  readonly pageParam = input(1, { alias: 'page', transform: (value) => numberAttribute(value, 1) });
  readonly searchParam = input('', { alias: 'search' });

  protected readonly store = inject(CustomersStore);
  private readonly authStore = inject(AuthStore);
  private readonly dialogService = inject(DialogService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly injector = inject(Injector);

  protected readonly LucidePlus = LucidePlus;
  protected readonly LucidePencil = LucidePencil;
  protected readonly LucideTrash2 = LucideTrash2;
  protected readonly pageSize = PAGE_SIZE;

  protected readonly searchModel = signal({ name: this.searchParam() });
  protected readonly searchForm = form(this.searchModel, (schema) => {
    debounce(schema.name, SEARCH_DEBOUNCE_MS);
  });

  protected readonly trackBy = (customer: Customer) => customer.id;

  protected readonly customerFormDialogLoader = () =>
    import('./customer-form-dialog/customer-form-dialog.component').then(
      (m) => m.CustomerFormDialogComponent,
    );

  protected readonly canCreateCustomer = computed(() =>
    this.authStore.hasPermission({
      orgPermissions: { customer: ['create'], person: ['create'] },
    }),
  );
  protected readonly canUpdateCustomer = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customer: ['update'] } }),
  );
  protected readonly canDeleteCustomer = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customer: ['delete'] } }),
  );

  private readonly actionsTemplate = viewChild.required<TemplateRef<TableEvent>>('actionsTemplate');

  protected readonly columns = computed<ColDef<Customer>[]>(() => [
    { key: 'name', title: 'Nome' },
    { key: 'id', title: 'Ações', type: 'template', template: this.actionsTemplate },
  ]);

  constructor() {
    const initialPage = this.pageParam();
    if (initialPage > 1) {
      this.store.setPage(initialPage);
    }

    this.store.setSearch(computed(() => this.searchForm.name().value()));

    effect(() => {
      const page = this.store.page();
      const search = this.store.name();
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: {
          page: page > 1 ? page : null,
          search: search || null,
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }

  protected goToPage(page: number) {
    this.store.setPage(page);
  }

  protected openCreateDialog() {
    this.openFormDialog({});
  }

  protected openEditDialog(customer: Customer) {
    this.openFormDialog({ customerId: customer.id });
  }

  private openFormDialog(data: CustomerFormDialogData) {
    // The dialog itself updates the store on save (see CustomersStore
    // createCustomer/updateCustomer), so there's nothing to do here on close.
    // `injector` is required so the dialog's child injector can resolve the
    // component-scoped CustomersStore (CDK Dialog otherwise uses the root injector).
    this.dialogService.open<Customer | undefined, CustomerFormDialogData>(
      this.customerFormDialogLoader,
      {
        data,
        size: 'lg',
        injector: this.injector,
        ariaModal: true,
        ariaLabelledBy: 'customer-form-dialog-title',
      },
    );
  }

  protected openDeleteDialog(customer: Customer) {
    const dialogRef = this.dialogService.open<boolean, ConfirmDialogData>(ConfirmDialogComponent, {
      data: {
        title: 'Excluir cliente',
        message: `Tem certeza que deseja excluir "${customer.name}"? Essa ação não pode ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        danger: true,
      },
      size: 'md',
      role: 'alertdialog',
      ariaModal: true,
      ariaLabelledBy: 'confirm-dialog-title',
    });

    dialogRef.closed.subscribe((confirmed) => {
      if (confirmed) {
        this.store.deleteCustomer(customer).subscribe();
      }
    });
  }
}
