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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounce, form, FormField } from '@angular/forms/signals';
import { LucideEye, LucidePencil, LucidePlus, LucideTrash2 } from '@lucide/angular';
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
import { type EmployeeFormDialogData } from './employee-form-dialog/employee-form-dialog.component';
import { Employee } from './employee.model';
import { EmployeesStore, PAGE_SIZE } from './employees.store';

const SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-employees',
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
    RouterLink,
    TableComponent,
  ],
  templateUrl: './employees.component.html',
  host: {
    class: 'page-container',
  },
  providers: [EmployeesStore],
})
export class EmployeesComponent {
  readonly pageParam = input(1, { alias: 'page', transform: (value) => numberAttribute(value, 1) });
  readonly searchParam = input('', { alias: 'search' });

  protected readonly store = inject(EmployeesStore);
  private readonly authStore = inject(AuthStore);
  private readonly dialogService = inject(DialogService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly injector = inject(Injector);

  protected readonly LucidePlus = LucidePlus;
  protected readonly LucidePencil = LucidePencil;
  protected readonly LucideTrash2 = LucideTrash2;
  protected readonly LucideEye = LucideEye;
  protected readonly pageSize = PAGE_SIZE;

  protected readonly searchModel = signal({ name: this.searchParam() });
  protected readonly searchForm = form(this.searchModel, (schema) => {
    debounce(schema.name, SEARCH_DEBOUNCE_MS);
  });

  protected readonly trackBy = (employee: Employee) => employee.id;

  protected readonly employeeFormDialogLoader = () =>
    import('./employee-form-dialog/employee-form-dialog.component').then(
      (m) => m.EmployeeFormDialogComponent,
    );

  protected readonly canCreateEmployee = computed(() =>
    this.authStore.hasPermission({
      orgPermissions: { employee: ['create'], person: ['create'] },
    }),
  );
  protected readonly canUpdateEmployee = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { employee: ['update'] } }),
  );
  protected readonly canDeleteEmployee = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { employee: ['delete'] } }),
  );

  private readonly actionsTemplate = viewChild.required<TemplateRef<TableEvent>>('actionsTemplate');

  protected readonly columns = computed<ColDef<Employee>[]>(() => [
    { key: 'name', title: 'Nome' },
    { key: 'role', title: 'Cargo' },
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

  protected openEditDialog(employee: Employee) {
    this.openFormDialog({ employeeId: employee.id });
  }

  private openFormDialog(data: EmployeeFormDialogData) {
    // The dialog itself updates the store on save (see EmployeesStore
    // createEmployee/updateEmployee), so there's nothing to do here on close.
    // `injector` is required so the dialog's child injector can resolve the
    // component-scoped EmployeesStore (CDK Dialog otherwise uses the root injector).
    this.dialogService.open<Employee | undefined, EmployeeFormDialogData>(
      this.employeeFormDialogLoader,
      {
        data,
        size: 'xl',
        injector: this.injector,
        ariaModal: true,
        ariaLabelledBy: 'employee-form-dialog-title',
      },
    );
  }

  protected openDeleteDialog(employee: Employee) {
    const dialogRef = this.dialogService.open<boolean, ConfirmDialogData>(ConfirmDialogComponent, {
      data: {
        title: 'Excluir funcionário',
        message: `Tem certeza que deseja excluir "${employee.name}"? Essa ação não pode ser desfeita.`,
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
        this.store.deleteEmployee(employee).subscribe();
      }
    });
  }
}
