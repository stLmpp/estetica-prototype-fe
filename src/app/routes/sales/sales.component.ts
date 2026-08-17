import {
  Component,
  computed,
  inject,
  input,
  numberAttribute,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { map, skip, tap } from 'rxjs';
import dayjs from 'dayjs/esm';
import { LucideEye, LucidePlus, LucideTrash2 } from '@lucide/angular';
import { AlertComponent } from '../../components/alert/alert.component';
import { BadgeComponent } from '../../components/badge/badge.component';
import { ButtonComponent } from '../../components/button/button.component';
import { FormFieldComponent } from '../../components/form-field/form-field.component';
import { IconButtonComponent } from '../../components/icon-button/icon-button.component';
import { IconComponent } from '../../components/icon/icon.component';
import { LabelComponent } from '../../components/label/label.component';
import { LoadingOverlayDirective } from '../../components/loading-overlay/loading-overlay.directive';
import { PaginatorComponent } from '../../components/paginator/paginator.component';
import { SelectDirective } from '../../components/select/select.directive';
import { ColDef } from '../../components/table/model/col-def';
import { TableEvent } from '../../components/table/model/table-event';
import { TableComponent } from '../../components/table/table.component';
import { ToastService } from '../../components/toast/toast.service';
import { TypeaheadComponent } from '../../components/typeahead/typeahead.component';
import { AuthStore } from '../../core/auth/auth.store';
import { DialogService } from '../../core/dialog/dialog.service';
import { CustomerService } from '../customers/customer.service';
import { EmployeeService } from '../employees/employee.service';
import { Sale } from './sale.model';
import { SaleStatus } from './sale-status.enum';
import { PAGE_SIZE, SalesStore } from './sales.store';
import { InputDirective } from '../../components/input/input.directive';

const STATUS_OPTIONS = Object.values(SaleStatus);

interface SalesFiltersFormModel {
  status: SaleStatus | '';
  customerId: string | null;
  employeeId: string | null;
  fromDate: string;
  toDate: string;
}

function toRangeStartIso(date: string): string | undefined {
  return date ? dayjs(date).startOf('day').toISOString() : undefined;
}

function toRangeEndIso(date: string): string | undefined {
  return date ? dayjs(date).endOf('day').toISOString() : undefined;
}

@Component({
  selector: 'app-sales',
  imports: [
    AlertComponent,
    BadgeComponent,
    ButtonComponent,
    FormField,
    FormFieldComponent,
    FormRoot,
    IconButtonComponent,
    IconComponent,
    LabelComponent,
    LoadingOverlayDirective,
    PaginatorComponent,
    RouterLink,
    SelectDirective,
    TableComponent,
    TypeaheadComponent,
    InputDirective,
  ],
  templateUrl: './sales.component.html',
  host: {
    class: 'page-container',
  },
  providers: [SalesStore],
})
export class SalesComponent {
  readonly pageParam = input(1, {
    alias: 'page',
    transform: (value: string) => numberAttribute(value, 1),
  });

  protected readonly store = inject(SalesStore);
  private readonly authStore = inject(AuthStore);
  private readonly dialogService = inject(DialogService);
  private readonly customerService = inject(CustomerService);
  private readonly employeeService = inject(EmployeeService);
  private readonly toastService = inject(ToastService);

  protected readonly LucidePlus = LucidePlus;
  protected readonly LucideEye = LucideEye;
  protected readonly LucideTrash2 = LucideTrash2;
  protected readonly pageSize = PAGE_SIZE;
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly SaleStatus = SaleStatus;

  protected readonly trackBy = (sale: Sale) => sale.id;

  protected readonly canCreateSale = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { sale: ['create'] } }),
  );
  protected readonly canDeleteSale = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { sale: ['delete'] } }),
  );

  private readonly statusTemplate = viewChild.required<TemplateRef<TableEvent>>('statusTemplate');
  private readonly actionsTemplate = viewChild.required<TemplateRef<TableEvent>>('actionsTemplate');

  protected readonly columns = computed<ColDef<Sale>[]>(() => [
    { key: 'customerName', title: 'Cliente' },
    { key: 'employeeName', title: 'Funcionário' },
    { key: 'totalAmount', title: 'Total', type: 'currency' },
    { key: 'status', title: 'Status', type: 'template', template: this.statusTemplate },
    { key: 'createdAt', title: 'Data', type: 'date', format: 'dd/MM/yyyy HH:mm' },
    { key: 'id', title: 'Ações', type: 'template', template: this.actionsTemplate },
  ]);

  protected readonly filtersModel = signal<SalesFiltersFormModel>({
    status: '',
    customerId: null,
    employeeId: null,
    fromDate: '',
    toDate: '',
  });
  protected readonly filtersForm = form(this.filtersModel);

  protected readonly customerSearchFn = (query: string) =>
    this.customerService
      .list({ name: query, limit: 10 })
      .pipe(
        map((result) =>
          result.items.map((customer) => ({ id: customer.id, label: customer.name })),
        ),
      );

  protected readonly employeeSearchFn = (query: string) =>
    this.employeeService
      .list({ name: query, limit: 10 })
      .pipe(
        map((result) =>
          result.items.map((employee) => ({ id: employee.id, label: employee.name })),
        ),
      );

  constructor() {
    const initialPage = this.pageParam();
    if (initialPage > 1) {
      this.store.setPage(initialPage);
    }

    toObservable(this.filtersForm().value)
      .pipe(skip(1), takeUntilDestroyed())
      .subscribe((value) => {
        this.store.setFilters({
          status: value.status,
          customerId: value.customerId ?? '',
          employeeId: value.employeeId ?? '',
          from: toRangeStartIso(value.fromDate) ?? '',
          to: toRangeEndIso(value.toDate) ?? '',
        });
      });
  }

  protected goToPage(page: number) {
    this.store.setPage(page);
  }

  protected openDeleteDialog(sale: Sale) {
    this.dialogService.openConfirm({
      title: 'Excluir venda',
      message: `Tem certeza que deseja excluir a venda de "${sale.customerName}"? Essa ação não pode ser desfeita.`,
      actions: [
        { label: 'Cancelar', btnOutline: true },
        {
          label: 'Excluir',
          danger: true,
          onClick: () =>
            this.store.deleteSale(sale).pipe(
              tap(() => {
                if (!this.store.errorMessage()) {
                  this.toastService.success('Venda excluída com sucesso.');
                }
              }),
            ),
        },
      ],
    });
  }
}
