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
import { map, skip } from 'rxjs';
import dayjs from 'dayjs/esm';
import { LucideCalendarPlus, LucideEye, LucideReceiptText, LucideX } from '@lucide/angular';
import { AlertComponent } from '../../components/alert/alert.component';
import { ButtonComponent } from '../../components/button/button.component';
import { BadgeComponent } from '../../components/badge/badge.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../components/confirm-dialog/confirm-dialog.component';
import { FormFieldComponent } from '../../components/form-field/form-field.component';
import { IconButtonComponent } from '../../components/icon-button/icon-button.component';
import { IconComponent } from '../../components/icon/icon.component';
import { InputDirective } from '../../components/input/input.directive';
import { LabelComponent } from '../../components/label/label.component';
import { LoadingOverlayDirective } from '../../components/loading-overlay/loading-overlay.directive';
import { PaginatorComponent } from '../../components/paginator/paginator.component';
import { PreloadDirective } from '../../components/preload/preload.directive';
import { SelectDirective } from '../../components/select/select.directive';
import { ColDef } from '../../components/table/model/col-def';
import { TableEvent } from '../../components/table/model/table-event';
import { TableComponent } from '../../components/table/table.component';
import { ToastService } from '../../components/toast/toast.service';
import { TypeaheadComponent } from '../../components/typeahead/typeahead.component';
import { AuthStore } from '../../core/auth/auth.store';
import { DialogService } from '../../core/dialog/dialog.service';
import { CatalogItem } from '../catalog-items/catalog-item.model';
import { CustomerService } from '../customers/customer.service';
import { Employee } from '../employees/employee.model';
import { AppointmentStatus } from './appointment-status.enum';
import { Appointment } from './appointment.model';
import { AppointmentsStore, PAGE_SIZE } from './appointments.store';

const STATUS_OPTIONS = Object.values(AppointmentStatus);

interface AppointmentsFiltersFormModel {
  status: AppointmentStatus | '';
  catalogItemId: string;
  employeeId: string;
  customerId: string | null;
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
  selector: 'app-appointments',
  imports: [
    AlertComponent,
    BadgeComponent,
    ButtonComponent,
    FormField,
    FormFieldComponent,
    FormRoot,
    IconButtonComponent,
    IconComponent,
    InputDirective,
    LabelComponent,
    LoadingOverlayDirective,
    PaginatorComponent,
    PreloadDirective,
    RouterLink,
    SelectDirective,
    TableComponent,
    TypeaheadComponent,
  ],
  templateUrl: './appointments.component.html',
  host: {
    class: 'page-container',
  },
  providers: [AppointmentsStore],
})
export class AppointmentsComponent {
  readonly pageParam = input(1, { alias: 'page', transform: (value: string) => numberAttribute(value, 1) });
  readonly services = input.required<CatalogItem[]>();
  readonly employees = input.required<Employee[]>();

  protected readonly store = inject(AppointmentsStore);
  private readonly authStore = inject(AuthStore);
  private readonly dialogService = inject(DialogService);
  private readonly customerService = inject(CustomerService);
  private readonly toastService = inject(ToastService);

  protected readonly LucideCalendarPlus = LucideCalendarPlus;
  protected readonly LucideEye = LucideEye;
  protected readonly LucideReceiptText = LucideReceiptText;
  protected readonly LucideX = LucideX;
  protected readonly pageSize = PAGE_SIZE;
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly AppointmentStatus = AppointmentStatus;

  protected readonly trackBy = (appointment: Appointment) => appointment.id;

  protected readonly bookingRouteLoader = () =>
    import('./appointment-booking/appointment-booking.component').then(
      (m) => m.AppointmentBookingComponent,
    );

  protected readonly canCreateAppointment = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { appointment: ['create'] } }),
  );
  protected readonly canCancelAppointment = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { appointment: ['updateStatus'] } }),
  );
  protected readonly canCreateSale = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { sale: ['create'] } }),
  );

  private readonly statusTemplate = viewChild.required<TemplateRef<TableEvent>>('statusTemplate');
  private readonly actionsTemplate = viewChild.required<TemplateRef<TableEvent>>('actionsTemplate');

  protected readonly columns = computed<ColDef<Appointment>[]>(() => [
    { key: 'customerName', title: 'Cliente' },
    { key: 'catalogItemName', title: 'Serviço' },
    { key: 'employeeName', title: 'Profissional' },
    { key: 'startTime', title: 'Início', type: 'date', format: 'dd/MM/yyyy HH:mm' },
    { key: 'endTime', title: 'Término', type: 'date', format: 'HH:mm' },
    { key: 'status', title: 'Status', type: 'template', template: this.statusTemplate },
    { key: 'id', title: 'Ações', type: 'template', template: this.actionsTemplate },
  ]);

  protected readonly filtersModel = signal<AppointmentsFiltersFormModel>({
    status: '',
    catalogItemId: '',
    employeeId: '',
    customerId: null,
    fromDate: '',
    toDate: '',
  });
  protected readonly filtersForm = form(this.filtersModel);

  protected readonly customerSearchFn = (query: string) =>
    this.customerService
      .list({ name: query, limit: 10 })
      .pipe(map((result) => result.items.map((customer) => ({ id: customer.id, label: customer.name }))));

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
          catalogItemId: value.catalogItemId,
          employeeId: value.employeeId,
          customerId: value.customerId ?? '',
          from: toRangeStartIso(value.fromDate) ?? '',
          to: toRangeEndIso(value.toDate) ?? '',
        });
      });
  }

  protected goToPage(page: number) {
    this.store.setPage(page);
  }

  protected openCancelDialog(appointment: Appointment) {
    const dialogRef = this.dialogService.open<boolean, ConfirmDialogData>(ConfirmDialogComponent, {
      data: {
        title: 'Cancelar agendamento',
        message: `Tem certeza que deseja cancelar o agendamento de "${appointment.customerName}"?`,
        confirmLabel: 'Cancelar agendamento',
        cancelLabel: 'Voltar',
        danger: true,
      },
      size: 'md',
      role: 'alertdialog',
      ariaModal: true,
      ariaLabelledBy: 'confirm-dialog-title',
    });

    dialogRef.closed.subscribe((confirmed) => {
      if (confirmed) {
        this.store.cancelAppointment(appointment).subscribe(() => {
          if (!this.store.errorMessage()) {
            this.toastService.success('Agendamento cancelado com sucesso.');
          }
        });
      }
    });
  }
}
