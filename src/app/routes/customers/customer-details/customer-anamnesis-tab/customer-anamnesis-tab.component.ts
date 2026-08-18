import { DatePipe } from '@angular/common';
import { Component, computed, inject, Injector, TemplateRef, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { LucideCheck, LucideEye, LucidePencil, LucidePlus, LucideTrash2 } from '@lucide/angular';
import { AlertComponent } from '../../../../components/alert/alert.component';
import { BadgeComponent } from '../../../../components/badge/badge.component';
import { ButtonComponent } from '../../../../components/button/button.component';
import { IconComponent } from '../../../../components/icon/icon.component';
import { IconButtonComponent } from '../../../../components/icon-button/icon-button.component';
import { LoadingOverlayDirective } from '../../../../components/loading-overlay/loading-overlay.directive';
import { PaginatorComponent } from '../../../../components/paginator/paginator.component';
import { PreloadDirective } from '../../../../components/preload/preload.directive';
import { ColDef } from '../../../../components/table/model/col-def';
import { TableEvent } from '../../../../components/table/model/table-event';
import { TableComponent } from '../../../../components/table/table.component';
import { AuthStore } from '../../../../core/auth/auth.store';
import { DialogService } from '../../../../core/dialog/dialog.service';
import { AnamnesisFormService } from '../../../anamnesis-forms/anamnesis-form.service';
import { CustomerDetailsStore } from '../customer-details.store';
import { type CustomerAnamnesisDetailDialogData } from './customer-anamnesis-detail-dialog/customer-anamnesis-detail-dialog.component';
import { type CustomerAnamnesisFinalizeDialogData } from './customer-anamnesis-finalize-dialog/customer-anamnesis-finalize-dialog.component';
import { type CustomerAnamnesisFormDialogData } from './customer-anamnesis-form-dialog/customer-anamnesis-form-dialog.component';
import { CustomerAnamnesis, CustomerAnamnesisStatus } from './customer-anamnesis.model';
import { CustomerAnamnesisService } from './customer-anamnesis.service';
import { CustomerAnamnesisTabStore, PAGE_SIZE } from './customer-anamnesis-tab.store';

const FORMS_LIMIT = 100;
const DEFAULT_FORM_NAME = 'Formulário removido';

@Component({
  selector: 'app-customer-anamnesis-tab',
  imports: [
    AlertComponent,
    BadgeComponent,
    ButtonComponent,
    DatePipe,
    IconButtonComponent,
    IconComponent,
    LoadingOverlayDirective,
    PaginatorComponent,
    PreloadDirective,
    TableComponent,
  ],
  templateUrl: './customer-anamnesis-tab.component.html',
  providers: [CustomerAnamnesisTabStore],
})
export class CustomerAnamnesisTabComponent {
  protected readonly detailsStore = inject(CustomerDetailsStore);
  protected readonly store = inject(CustomerAnamnesisTabStore);
  private readonly authStore = inject(AuthStore);
  private readonly dialogService = inject(DialogService);
  private readonly anamnesisFormService = inject(AnamnesisFormService);
  private readonly customerAnamnesisService = inject(CustomerAnamnesisService);
  private readonly injector = inject(Injector);

  protected readonly LucidePlus = LucidePlus;
  protected readonly LucideEye = LucideEye;
  protected readonly LucidePencil = LucidePencil;
  protected readonly LucideTrash2 = LucideTrash2;
  protected readonly LucideCheck = LucideCheck;
  protected readonly pageSize = PAGE_SIZE;
  protected readonly CustomerAnamnesisStatus = CustomerAnamnesisStatus;

  protected readonly canCreate = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customerAnamnesis: ['create'] } }),
  );
  protected readonly canUpdate = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customerAnamnesis: ['update'] } }),
  );
  protected readonly canFinalize = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customerAnamnesis: ['finalize'] } }),
  );
  protected readonly canDelete = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customerAnamnesis: ['delete'] } }),
  );

  protected readonly formsResource = rxResource({
    stream: () => this.anamnesisFormService.list({ limit: FORMS_LIMIT }),
  });
  protected readonly forms = computed(() => this.formsResource.value()?.items ?? []);
  protected readonly activeForms = computed(() => this.forms().filter((form) => form.active));
  protected readonly formNameById = computed(
    () =>
      Object.fromEntries(this.forms().map((form) => [form.id, form.name])) as Record<
        string,
        string
      >,
  );

  protected formName(anamnesisFormId: string): string {
    return this.formNameById()[anamnesisFormId] ?? DEFAULT_FORM_NAME;
  }

  protected readonly trackBy = (record: CustomerAnamnesis) => record.id;

  private readonly formTemplate = viewChild.required<TemplateRef<TableEvent>>('formTemplate');
  private readonly dateTemplate = viewChild.required<TemplateRef<TableEvent>>('dateTemplate');
  private readonly statusTemplate = viewChild.required<TemplateRef<TableEvent>>('statusTemplate');
  private readonly actionsTemplate = viewChild.required<TemplateRef<TableEvent>>('actionsTemplate');

  protected readonly columns = computed<ColDef<CustomerAnamnesis>[]>(() => [
    { key: 'anamnesisFormId', title: 'Formulário', type: 'template', template: this.formTemplate },
    { key: 'date', title: 'Data', type: 'template', template: this.dateTemplate },
    { key: 'status', title: 'Status', type: 'template', template: this.statusTemplate },
    { key: 'id', title: 'Ações', type: 'template', template: this.actionsTemplate },
  ]);

  protected readonly customerAnamnesisFormDialogLoader = () =>
    import('./customer-anamnesis-form-dialog/customer-anamnesis-form-dialog.component').then(
      (m) => m.CustomerAnamnesisFormDialogComponent,
    );
  protected readonly customerAnamnesisDetailDialogLoader = () =>
    import('./customer-anamnesis-detail-dialog/customer-anamnesis-detail-dialog.component').then(
      (m) => m.CustomerAnamnesisDetailDialogComponent,
    );
  protected readonly customerAnamnesisFinalizeDialogLoader = () =>
    import('./customer-anamnesis-finalize-dialog/customer-anamnesis-finalize-dialog.component').then(
      (m) => m.CustomerAnamnesisFinalizeDialogComponent,
    );

  protected goToPage(page: number) {
    this.store.setPage(page);
  }

  protected async openCreateDialog() {
    const customerId = this.detailsStore.customerId();
    const data: CustomerAnamnesisFormDialogData = { customerId, forms: this.activeForms() };
    const dialogRef = await this.dialogService.open<
      CustomerAnamnesis | undefined,
      CustomerAnamnesisFormDialogData
    >(this.customerAnamnesisFormDialogLoader, {
      data,
      size: 'xl',
      injector: this.injector,
      ariaModal: true,
      ariaLabelledBy: 'customer-anamnesis-form-dialog-title',
    });
    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.store.addRecord(result);
      }
    });
  }

  protected async openEditDialog(record: CustomerAnamnesis) {
    const customerId = this.detailsStore.customerId();
    const fullRecord = await firstValueFrom(
      this.customerAnamnesisService.getById(customerId, record.id),
    );
    const data: CustomerAnamnesisFormDialogData = {
      customerId,
      forms: this.activeForms(),
      customerAnamnesis: fullRecord,
    };
    const dialogRef = await this.dialogService.open<
      CustomerAnamnesis | undefined,
      CustomerAnamnesisFormDialogData
    >(this.customerAnamnesisFormDialogLoader, {
      data,
      size: 'xl',
      injector: this.injector,
      ariaModal: true,
      ariaLabelledBy: 'customer-anamnesis-form-dialog-title',
    });
    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.store.patchRecord(record.id, result);
      }
    });
  }

  protected async openDetailDialog(record: CustomerAnamnesis) {
    const customerId = this.detailsStore.customerId();
    const fullRecord = await firstValueFrom(
      this.customerAnamnesisService.getById(customerId, record.id),
    );
    const data: CustomerAnamnesisDetailDialogData = {
      customerAnamnesis: fullRecord,
      formName: this.formName(fullRecord.anamnesisFormId),
    };
    await this.dialogService.open<void, CustomerAnamnesisDetailDialogData>(
      this.customerAnamnesisDetailDialogLoader,
      {
        data,
        size: 'lg',
        injector: this.injector,
        ariaModal: true,
        ariaLabelledBy: 'customer-anamnesis-detail-dialog-title',
      },
    );
  }

  protected async openFinalizeDialog(record: CustomerAnamnesis) {
    const customerId = this.detailsStore.customerId();
    const data: CustomerAnamnesisFinalizeDialogData = { customerId, customerAnamnesis: record };
    const dialogRef = await this.dialogService.open<
      CustomerAnamnesis | undefined,
      CustomerAnamnesisFinalizeDialogData
    >(this.customerAnamnesisFinalizeDialogLoader, {
      data,
      injector: this.injector,
      ariaModal: true,
      ariaLabelledBy: 'customer-anamnesis-finalize-dialog-title',
    });
    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.store.patchRecord(record.id, result);
      }
    });
  }

  protected openDeleteDialog(record: CustomerAnamnesis) {
    const customerId = this.detailsStore.customerId();
    this.dialogService.openConfirm({
      title: 'Excluir anamnese',
      message: 'Tem certeza que deseja excluir esta anamnese? Essa ação não pode ser desfeita.',
      actions: [
        { label: 'Cancelar', btnOutline: true },
        {
          label: 'Excluir',
          danger: true,
          onClick: () => this.store.deleteRecord(customerId, record),
        },
      ],
    });
  }
}
