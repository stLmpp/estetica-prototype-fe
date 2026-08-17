import { Component, computed, effect, inject, input, TemplateRef, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucidePencil, LucidePlus, LucideTrash2 } from '@lucide/angular';
import { AlertComponent } from '../../../components/alert/alert.component';
import { BadgeComponent } from '../../../components/badge/badge.component';
import { ButtonComponent } from '../../../components/button/button.component';
import { IconComponent } from '../../../components/icon/icon.component';
import { IconButtonComponent } from '../../../components/icon-button/icon-button.component';
import { LoadingOverlayDirective } from '../../../components/loading-overlay/loading-overlay.directive';
import { PreloadDirective } from '../../../components/preload/preload.directive';
import { ColDef } from '../../../components/table/model/col-def';
import { TableEvent } from '../../../components/table/model/table-event';
import { TableComponent } from '../../../components/table/table.component';
import { AuthStore } from '../../../core/auth/auth.store';
import { DialogService } from '../../../core/dialog/dialog.service';
import { ANAMNESIS_FIELD_TYPE_LABELS, AnamnesisFieldType } from '../anamnesis-field-type.enum';
import { type AnamnesisFieldDialogData } from '../anamnesis-field-dialog/anamnesis-field-dialog.component';
import { AnamnesisField } from '../anamnesis-field.model';
import { AnamnesisForm } from '../anamnesis-form.model';
import { type AnamnesisFormDialogData } from '../anamnesis-form-dialog/anamnesis-form-dialog.component';
import { type AnamnesisSectionDialogData } from '../anamnesis-section-dialog/anamnesis-section-dialog.component';
import { AnamnesisSection } from '../anamnesis-section.model';
import { AnamnesisFormDetailStore } from './anamnesis-form-detail.store';

@Component({
  selector: 'app-anamnesis-form-detail',
  imports: [
    AlertComponent,
    BadgeComponent,
    ButtonComponent,
    IconButtonComponent,
    IconComponent,
    LoadingOverlayDirective,
    PreloadDirective,
    RouterLink,
    TableComponent,
  ],
  templateUrl: './anamnesis-form-detail.component.html',
  host: {
    class: 'page-container',
  },
  providers: [AnamnesisFormDetailStore],
})
export class AnamnesisFormDetailComponent {
  readonly initialAnamnesisForm = input.required<AnamnesisForm>({ alias: 'anamnesisForm' });

  protected readonly store = inject(AnamnesisFormDetailStore);
  private readonly authStore = inject(AuthStore);
  private readonly dialogService = inject(DialogService);

  protected readonly LucidePlus = LucidePlus;
  protected readonly LucidePencil = LucidePencil;
  protected readonly LucideTrash2 = LucideTrash2;
  protected readonly trackByFieldId = (field: AnamnesisField) => field.id;

  protected fieldTypeLabel(fieldType: AnamnesisFieldType): string {
    return ANAMNESIS_FIELD_TYPE_LABELS[fieldType];
  }

  protected readonly canCreate = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { anamnesisField: ['create'] } }),
  );
  protected readonly canUpdate = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { anamnesisField: ['update'] } }),
  );
  protected readonly canDelete = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { anamnesisField: ['delete'] } }),
  );

  protected readonly anamnesisFormDialogLoader = () =>
    import('../anamnesis-form-dialog/anamnesis-form-dialog.component').then(
      (m) => m.AnamnesisFormDialogComponent,
    );
  protected readonly anamnesisSectionDialogLoader = () =>
    import('../anamnesis-section-dialog/anamnesis-section-dialog.component').then(
      (m) => m.AnamnesisSectionDialogComponent,
    );
  protected readonly anamnesisFieldDialogLoader = () =>
    import('../anamnesis-field-dialog/anamnesis-field-dialog.component').then(
      (m) => m.AnamnesisFieldDialogComponent,
    );

  private readonly fieldTypeTemplate =
    viewChild.required<TemplateRef<TableEvent>>('fieldTypeTemplate');
  private readonly fieldStatusTemplate =
    viewChild.required<TemplateRef<TableEvent>>('fieldStatusTemplate');
  private readonly fieldActionsTemplate =
    viewChild.required<TemplateRef<TableEvent>>('fieldActionsTemplate');

  protected readonly fieldColumns = computed<ColDef<AnamnesisField>[]>(() => [
    { key: 'label', title: 'Campo' },
    { key: 'fieldType', title: 'Tipo', type: 'template', template: this.fieldTypeTemplate },
    { key: 'displayOrder', title: 'Ordem' },
    { key: 'active', title: 'Status', type: 'template', template: this.fieldStatusTemplate },
    { key: 'id', title: 'Ações', type: 'template', template: this.fieldActionsTemplate },
  ]);

  protected readonly groupedFields = computed(() => {
    const sections = this.store.sections();
    const fields = this.store.fields();
    const groups: { section?: AnamnesisSection; fields: AnamnesisField[] }[] = sections.map(
      (section) => ({
        section,
        fields: fields.filter((field) => field.anamnesisSectionId === section.id),
      }),
    );
    const ungrouped = fields.filter((field) => !field.anamnesisSectionId);
    return ungrouped.length ? [...groups, { section: undefined, fields: ungrouped }] : groups;
  });

  constructor() {
    effect(() => this.store.setAnamnesisForm(this.initialAnamnesisForm()));
  }

  protected async openEditFormDialog() {
    const anamnesisForm = this.store.anamnesisForm();
    if (!anamnesisForm) {
      return;
    }
    const dialogRef = await this.dialogService.open<
      AnamnesisForm | undefined,
      AnamnesisFormDialogData
    >(this.anamnesisFormDialogLoader, {
      data: { anamnesisForm },
      ariaModal: true,
      ariaLabelledBy: 'anamnesis-form-dialog-title',
    });
    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.store.patchAnamnesisForm(result);
      }
    });
  }

  protected openCreateSectionDialog() {
    this.openSectionDialog({});
  }

  protected openEditSectionDialog(section: AnamnesisSection) {
    this.openSectionDialog({ anamnesisSection: section });
  }

  private async openSectionDialog(partialData: Partial<AnamnesisSectionDialogData>) {
    const anamnesisForm = this.store.anamnesisForm();
    if (!anamnesisForm) {
      return;
    }
    const data: AnamnesisSectionDialogData = { ...partialData, anamnesisFormId: anamnesisForm.id };
    const dialogRef = await this.dialogService.open<
      AnamnesisSection | undefined,
      AnamnesisSectionDialogData
    >(this.anamnesisSectionDialogLoader, {
      data,
      ariaModal: true,
      ariaLabelledBy: 'anamnesis-section-dialog-title',
    });
    dialogRef.closed.subscribe((result) => {
      if (!result) {
        return;
      }
      if (data.anamnesisSection) {
        this.store.patchSection(data.anamnesisSection.id, result);
      } else {
        this.store.addSection(result);
      }
    });
  }

  protected openDeleteSectionDialog(section: AnamnesisSection) {
    const anamnesisForm = this.store.anamnesisForm();
    if (!anamnesisForm) {
      return;
    }
    this.dialogService.openConfirm({
      title: 'Excluir seção',
      message: `Tem certeza que deseja excluir a seção "${section.label}"? Os campos associados não serão excluídos, apenas ficarão sem seção.`,
      actions: [
        { label: 'Cancelar', btnOutline: true },
        {
          label: 'Excluir',
          danger: true,
          onClick: () => this.store.deleteSection(anamnesisForm.id, section),
        },
      ],
    });
  }

  protected openCreateFieldDialog() {
    this.openFieldDialog({});
  }

  protected openEditFieldDialog(field: AnamnesisField) {
    this.openFieldDialog({ anamnesisField: field });
  }

  private async openFieldDialog(partialData: Partial<Omit<AnamnesisFieldDialogData, 'sections'>>) {
    const anamnesisForm = this.store.anamnesisForm();
    if (!anamnesisForm) {
      return;
    }
    const data: AnamnesisFieldDialogData = {
      ...partialData,
      anamnesisFormId: anamnesisForm.id,
      sections: this.store.sections(),
    };
    const dialogRef = await this.dialogService.open<
      AnamnesisField | undefined,
      AnamnesisFieldDialogData
    >(this.anamnesisFieldDialogLoader, {
      data,
      size: 'lg',
      ariaModal: true,
      ariaLabelledBy: 'anamnesis-field-dialog-title',
    });
    dialogRef.closed.subscribe((result) => {
      if (!result) {
        return;
      }
      if (data.anamnesisField) {
        this.store.patchField(data.anamnesisField.id, result);
      } else {
        this.store.addField(result);
      }
    });
  }

  protected openDeleteFieldDialog(field: AnamnesisField) {
    this.dialogService.openConfirm({
      title: 'Excluir campo',
      message: `Tem certeza que deseja excluir "${field.label}"? Essa ação não pode ser desfeita.`,
      actions: [
        { label: 'Cancelar', btnOutline: true },
        {
          label: 'Excluir',
          danger: true,
          onClick: () => this.store.deleteField(field),
        },
      ],
    });
  }
}
