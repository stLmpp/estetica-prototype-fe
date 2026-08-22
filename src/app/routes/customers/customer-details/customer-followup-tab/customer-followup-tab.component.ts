import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideCalendarPlus,
  LucideEye,
  LucidePencil,
  LucidePlus,
  LucideReceiptText,
  LucideTrash2,
} from '@lucide/angular';
import { AlertComponent } from '../../../../components/alert/alert.component';
import { ButtonComponent } from '../../../../components/button/button.component';
import { IconComponent } from '../../../../components/icon/icon.component';
import { IconButtonComponent } from '../../../../components/icon-button/icon-button.component';
import { LoadingOverlayDirective } from '../../../../components/loading-overlay/loading-overlay.directive';
import { PaginatorComponent } from '../../../../components/paginator/paginator.component';
import { ColDef } from '../../../../components/table/model/col-def';
import { TableComponent } from '../../../../components/table/table.component';
import { AuthStore } from '../../../../core/auth/auth.store';
import { DialogService } from '../../../../core/dialog/dialog.service';
import { CustomerDetailsStore } from '../customer-details.store';
import { CustomerFollowupListItem } from './customer-followup.model';
import { CustomerFollowupTabStore, PAGE_SIZE } from './customer-followup-tab.store';
import { viewChild, TemplateRef } from '@angular/core';
import { TableEvent } from '../../../../components/table/model/table-event';

@Component({
  selector: 'app-customer-followup-tab',
  imports: [
    AlertComponent,
    ButtonComponent,
    DatePipe,
    IconButtonComponent,
    IconComponent,
    LoadingOverlayDirective,
    PaginatorComponent,
    RouterLink,
    TableComponent,
  ],
  templateUrl: './customer-followup-tab.component.html',
  providers: [CustomerFollowupTabStore],
})
export class CustomerFollowupTabComponent {
  protected readonly detailsStore = inject(CustomerDetailsStore);
  protected readonly store = inject(CustomerFollowupTabStore);
  private readonly authStore = inject(AuthStore);
  private readonly dialogService = inject(DialogService);

  protected readonly LucidePlus = LucidePlus;
  protected readonly LucideEye = LucideEye;
  protected readonly LucidePencil = LucidePencil;
  protected readonly LucideTrash2 = LucideTrash2;
  protected readonly LucideCalendarPlus = LucideCalendarPlus;
  protected readonly LucideReceiptText = LucideReceiptText;
  protected readonly pageSize = PAGE_SIZE;

  protected readonly canCreate = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customerFollowup: ['create'] } }),
  );
  protected readonly canUpdate = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customerFollowup: ['update'] } }),
  );
  protected readonly canDelete = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { customerFollowup: ['delete'] } }),
  );

  protected readonly trackBy = (record: CustomerFollowupListItem) => record.id;

  private readonly textTemplate = viewChild.required<TemplateRef<TableEvent>>('textTemplate');
  private readonly dateTemplate = viewChild.required<TemplateRef<TableEvent>>('dateTemplate');
  private readonly linkedTemplate = viewChild.required<TemplateRef<TableEvent>>('linkedTemplate');
  private readonly actionsTemplate = viewChild.required<TemplateRef<TableEvent>>('actionsTemplate');

  protected readonly columns = computed<ColDef<CustomerFollowupListItem>[]>(() => [
    { key: 'date', title: 'Data', type: 'template', template: this.dateTemplate },
    { key: 'text', title: 'Texto', type: 'template', template: this.textTemplate },
    { key: 'appointmentId', title: 'Vinculado', type: 'template', template: this.linkedTemplate },
    { key: 'id', title: 'Ações', type: 'template', template: this.actionsTemplate },
  ]);

  protected goToPage(page: number) {
    this.store.setPage(page);
  }

  protected openDeleteDialog(record: CustomerFollowupListItem) {
    this.dialogService.openConfirm({
      title: 'Excluir follow-up',
      message: 'Tem certeza que deseja excluir este follow-up? Essa ação não pode ser desfeita.',
      actions: [
        { label: 'Cancelar', btnOutline: true },
        {
          label: 'Excluir',
          danger: true,
          onClick: () => this.store.deleteRecord(record),
        },
      ],
    });
  }
}
