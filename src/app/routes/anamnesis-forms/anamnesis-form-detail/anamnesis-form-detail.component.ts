import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { LucidePencil, LucidePlus, LucideTrash2 } from '@lucide/angular';
import { AlertComponent } from '../../../components/alert/alert.component';
import { BadgeComponent } from '../../../components/badge/badge.component';
import { ButtonComponent } from '../../../components/button/button.component';
import { FormFieldComponent } from '../../../components/form-field/form-field.component';
import { IconComponent } from '../../../components/icon/icon.component';
import { IconButtonComponent } from '../../../components/icon-button/icon-button.component';
import { InputDirective } from '../../../components/input/input.directive';
import { LabelComponent } from '../../../components/label/label.component';
import { ListItemComponent } from '../../../components/list/list-item.component';
import { ListComponent } from '../../../components/list/list.component';
import { LoadingOverlayDirective } from '../../../components/loading-overlay/loading-overlay.directive';
import { SwitchComponent } from '../../../components/switch/switch.component';
import { ToastService } from '../../../components/toast/toast.service';
import { AuthStore } from '../../../core/auth/auth.store';
import { DialogService } from '../../../core/dialog/dialog.service';
import { extractApiErrorMessage } from '../../../model/api-error';
import { ANAMNESIS_FIELD_TYPE_LABELS } from '../anamnesis-field-type.enum';
import { AnamnesisField } from '../anamnesis-field.model';
import { AnamnesisFormPayload } from '../anamnesis-form.dto';
import { AnamnesisForm } from '../anamnesis-form.model';
import { AnamnesisFormService } from '../anamnesis-form.service';
import { AnamnesisSection } from '../anamnesis-section.model';
import { AnamnesisFieldFormComponent } from './anamnesis-field-form/anamnesis-field-form.component';
import { AnamnesisFormDetailStore } from './anamnesis-form-detail.store';
import { AnamnesisFormPreviewComponent } from './anamnesis-form-preview/anamnesis-form-preview.component';
import { AnamnesisSectionFormComponent } from './anamnesis-section-form/anamnesis-section-form.component';

const DEFAULT_SETTINGS_ERROR_MESSAGE = 'Não foi possível salvar o formulário. Tente novamente.';

type AnamnesisFieldWithTypeLabel = AnamnesisField & { fieldTypeLabel: string };

@Component({
  selector: 'app-anamnesis-form-detail',
  imports: [
    AlertComponent,
    AnamnesisFieldFormComponent,
    AnamnesisFormPreviewComponent,
    AnamnesisSectionFormComponent,
    BadgeComponent,
    ButtonComponent,
    FormField,
    FormFieldComponent,
    FormRoot,
    IconButtonComponent,
    IconComponent,
    InputDirective,
    LabelComponent,
    ListComponent,
    ListItemComponent,
    LoadingOverlayDirective,
    RouterLink,
    SwitchComponent,
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
  private readonly anamnesisFormService = inject(AnamnesisFormService);
  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);

  protected readonly LucidePlus = LucidePlus;
  protected readonly LucidePencil = LucidePencil;
  protected readonly LucideTrash2 = LucideTrash2;

  protected readonly canCreate = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { anamnesisField: ['create'] } }),
  );
  protected readonly canUpdate = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { anamnesisField: ['update'] } }),
  );
  protected readonly canDelete = computed(() =>
    this.authStore.hasPermission({ orgPermissions: { anamnesisField: ['delete'] } }),
  );

  protected readonly editingSectionId = signal<string | null>(null);
  protected readonly addingSection = signal(false);
  protected readonly editingFieldId = signal<string | null>(null);
  protected readonly addingField = signal(false);

  protected readonly groupedFields = computed(() => {
    const sections = this.store.sections();
    const fields: AnamnesisFieldWithTypeLabel[] = this.store
      .fields()
      .map((field) => ({ ...field, fieldTypeLabel: ANAMNESIS_FIELD_TYPE_LABELS[field.fieldType] }));
    const groups: { section?: AnamnesisSection; fields: AnamnesisFieldWithTypeLabel[] }[] =
      sections.map((section) => ({
        section,
        fields: fields.filter((field) => field.anamnesisSectionId === section.id),
      }));
    const ungrouped = fields.filter((field) => !field.anamnesisSectionId);
    return ungrouped.length ? [...groups, { section: undefined, fields: ungrouped }] : groups;
  });

  protected readonly settingsErrorMessage = signal<string | null>(null);

  protected readonly settingsModel = signal({
    name: '',
    description: '',
    displayOrder: '0',
    active: true,
  });

  protected readonly settingsForm = form(
    this.settingsModel,
    (schema) => {
      required(schema.name, { message: 'Nome é obrigatório' });
    },
    {
      submission: {
        action: async (field) => {
          this.settingsErrorMessage.set(null);

          const value = field().value();
          const payload: AnamnesisFormPayload = {
            name: value.name.trim(),
            description: value.description.trim() || null,
            displayOrder: Number(value.displayOrder) || 0,
            active: value.active,
          };

          const result = await firstValueFrom(
            this.anamnesisFormService.update(this.initialAnamnesisForm().id, payload).pipe(
              map(() => ({ ok: true as const })),
              catchError((error) =>
                of({
                  ok: false as const,
                  message: extractApiErrorMessage(error, DEFAULT_SETTINGS_ERROR_MESSAGE),
                }),
              ),
            ),
          );

          if (!result.ok) {
            this.settingsErrorMessage.set(result.message);
            return;
          }

          this.store.patchAnamnesisForm({
            ...payload,
            description: payload.description ?? undefined,
          });
          this.toastService.success('Formulário atualizado com sucesso.');
        },
      },
    },
  );

  constructor() {
    let settingsSeeded = false;

    effect(() => {
      const anamnesisForm = this.initialAnamnesisForm();
      this.store.setAnamnesisForm(anamnesisForm);

      if (!settingsSeeded) {
        settingsSeeded = true;
        untracked(() => {
          this.settingsModel.set({
            name: anamnesisForm.name,
            description: anamnesisForm.description ?? '',
            displayOrder: String(anamnesisForm.displayOrder),
            active: anamnesisForm.active,
          });
        });
      }
    });
  }

  protected onSectionAdded(section: AnamnesisSection) {
    this.store.addSection(section);
    this.addingSection.set(false);
  }

  protected onSectionSaved(section: AnamnesisSection) {
    this.store.patchSection(section.id, section);
    this.editingSectionId.set(null);
  }

  protected openDeleteSectionDialog(section: AnamnesisSection) {
    const anamnesisForm = this.initialAnamnesisForm();
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

  protected onFieldAdded(field: AnamnesisField) {
    this.store.addField(field);
    this.addingField.set(false);
  }

  protected onFieldSaved(field: AnamnesisField) {
    this.store.patchField(field.id, field);
    this.editingFieldId.set(null);
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
