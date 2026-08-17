import { Component, computed, effect, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import dayjs from 'dayjs/esm';
import { catchError, firstValueFrom, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { ButtonToggleGroupComponent } from '../../../../../components/button-toggle-group/button-toggle-group.component';
import { ButtonToggleDirective } from '../../../../../components/button-toggle-group/button-toggle.directive';
import { CheckboxComponent } from '../../../../../components/checkbox/checkbox.component';
import { FormFieldComponent } from '../../../../../components/form-field/form-field.component';
import { HintComponent } from '../../../../../components/hint/hint.component';
import { InputDirective } from '../../../../../components/input/input.directive';
import { LabelComponent } from '../../../../../components/label/label.component';
import { LoadingOverlayDirective } from '../../../../../components/loading-overlay/loading-overlay.directive';
import { SelectDirective } from '../../../../../components/select/select.directive';
import { SwitchComponent } from '../../../../../components/switch/switch.component';
import { ToastService } from '../../../../../components/toast/toast.service';
import {
  ApiErrorDetail,
  extractApiErrorMessage,
  isApiErrorResponse,
} from '../../../../../model/api-error';
import { AnamnesisFieldType } from '../../../../anamnesis-forms/anamnesis-field-type.enum';
import { AnamnesisField } from '../../../../anamnesis-forms/anamnesis-field.model';
import { AnamnesisFieldService } from '../../../../anamnesis-forms/anamnesis-field.service';
import { AnamnesisForm } from '../../../../anamnesis-forms/anamnesis-form.model';
import { AnamnesisSection } from '../../../../anamnesis-forms/anamnesis-section.model';
import { AnamnesisSectionService } from '../../../../anamnesis-forms/anamnesis-section.service';
import { CustomerAnamnesisAnswerPayload } from '../customer-anamnesis.dto';
import { CustomerAnamnesis, CustomerAnamnesisField } from '../customer-anamnesis.model';
import { CustomerAnamnesisService } from '../customer-anamnesis.service';

export interface CustomerAnamnesisFormDialogData {
  customerId: string;
  forms: AnamnesisForm[];
  customerAnamnesis?: CustomerAnamnesis;
}

interface CheckboxOptionValue {
  value: string;
  checked: boolean;
}

interface AnswerRowValue {
  anamnesisFieldId: string;
  value: string;
  booleanValue: boolean;
  checkboxOptions: CheckboxOptionValue[];
}

interface FormModel {
  anamnesisFormId: string;
  date: string;
  answers: AnswerRowValue[];
}

interface FieldMeta {
  field: AnamnesisField;
  sectionLabel?: string;
  showSectionHeader: boolean;
}

type SaveResult =
  | { ok: true; customerAnamnesis: CustomerAnamnesis }
  | { ok: false; message: string; fieldErrors: Map<string, string[]> };

const FIELDS_LIMIT = 100;
const DEFAULT_LOAD_ERROR_MESSAGE = 'Não foi possível carregar os campos deste formulário.';
const DEFAULT_ERROR_MESSAGE = 'Não foi possível salvar a anamnese. Tente novamente.';

function byDisplayOrder(sections: AnamnesisSection[]) {
  const sectionOrderById = new Map(sections.map((section) => [section.id, section.displayOrder]));
  return (a: AnamnesisField, b: AnamnesisField) => {
    const orderA = a.anamnesisSectionId
      ? (sectionOrderById.get(a.anamnesisSectionId) ?? Infinity)
      : Infinity;
    const orderB = b.anamnesisSectionId
      ? (sectionOrderById.get(b.anamnesisSectionId) ?? Infinity)
      : Infinity;
    return orderA - orderB || a.displayOrder - b.displayOrder;
  };
}

function buildAnswerRows(
  fields: AnamnesisField[],
  existingAnswers: CustomerAnamnesisField[] | undefined,
): AnswerRowValue[] {
  const existingByFieldId = new Map(
    (existingAnswers ?? []).map((answer) => [answer.anamnesisFieldId, answer]),
  );
  return fields.map((field) => {
    const existing = existingByFieldId.get(field.id);
    const isTextLike =
      field.fieldType !== AnamnesisFieldType.BOOLEAN &&
      field.fieldType !== AnamnesisFieldType.CHECKBOX;
    return {
      anamnesisFieldId: field.id,
      value: isTextLike ? (existing?.value ?? '') : '',
      booleanValue: existing?.value === 'true',
      checkboxOptions: (field.fieldArgs?.options ?? []).map((option) => ({
        value: option.value,
        checked: existing?.extraValues?.values.includes(option.value) ?? false,
      })),
    };
  });
}

@Component({
  selector: 'app-customer-anamnesis-form-dialog',
  imports: [
    ButtonComponent,
    ButtonToggleGroupComponent,
    ButtonToggleDirective,
    CheckboxComponent,
    FormField,
    FormFieldComponent,
    FormRoot,
    HintComponent,
    InputDirective,
    LabelComponent,
    LoadingOverlayDirective,
    SelectDirective,
    SwitchComponent,
  ],
  templateUrl: './customer-anamnesis-form-dialog.component.html',
  host: {
    class:
      'block max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800',
  },
})
export class CustomerAnamnesisFormDialogComponent {
  protected readonly data = inject<CustomerAnamnesisFormDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<CustomerAnamnesis | undefined>);
  private readonly customerAnamnesisService = inject(CustomerAnamnesisService);
  private readonly anamnesisFieldService = inject(AnamnesisFieldService);
  private readonly anamnesisSectionService = inject(AnamnesisSectionService);
  private readonly toastService = inject(ToastService);

  protected readonly isEditing = !!this.data.customerAnamnesis;
  protected readonly showFormSelector = !this.isEditing && this.data.forms.length > 1;
  protected readonly AnamnesisFieldType = AnamnesisFieldType;

  protected readonly submitErrorMessage = signal<string | null>(null);
  protected readonly fieldErrorsByFieldId = signal<Map<string, string[]>>(new Map());

  protected readonly loadingFields = signal(false);
  protected readonly loadFieldsErrorMessage = signal<string | null>(null);

  private readonly fieldsSignal = signal<AnamnesisField[]>([]);
  private readonly sectionsSignal = signal<AnamnesisSection[]>([]);

  protected readonly fieldMeta = computed<FieldMeta[]>(() => {
    const sections = this.sectionsSignal();
    const sectionLabelById = new Map(sections.map((section) => [section.id, section.label]));
    let lastSectionLabel: string | undefined;
    return this.fieldsSignal().map((field) => {
      const sectionLabel = field.anamnesisSectionId
        ? sectionLabelById.get(field.anamnesisSectionId)
        : undefined;
      const showSectionHeader = sectionLabel !== lastSectionLabel;
      lastSectionLabel = sectionLabel;
      return { field, sectionLabel, showSectionHeader };
    });
  });

  protected readonly orphanedAnswerLabels = computed(() => {
    if (!this.isEditing || this.loadingFields()) {
      return [];
    }
    const activeFieldIds = new Set(this.fieldsSignal().map((field) => field.id));
    return (this.data.customerAnamnesis?.answers ?? [])
      .filter((answer) => !activeFieldIds.has(answer.anamnesisFieldId))
      .map((answer) => answer.anamnesisFieldLabel);
  });

  protected readonly model = signal<FormModel>({
    anamnesisFormId: this.initialFormId(),
    date: this.data.customerAnamnesis
      ? dayjs(this.data.customerAnamnesis.date).format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD'),
    answers: [],
  });

  protected readonly f = form(this.model, {
    submission: {
      action: async (field) => {
        this.submitErrorMessage.set(null);
        this.fieldErrorsByFieldId.set(new Map());

        const value = field().value();
        if (!value.anamnesisFormId) {
          return;
        }

        const answers = this.buildAnswerPayloads(value.answers);
        const result = await this.save(value, answers);

        if (!result.ok) {
          this.submitErrorMessage.set(result.message);
          this.fieldErrorsByFieldId.set(result.fieldErrors);
          return;
        }

        this.toastService.success(
          this.isEditing ? 'Anamnese atualizada com sucesso.' : 'Anamnese criada com sucesso.',
        );
        this.dialogRef.close(result.customerAnamnesis);
      },
    },
  });

  constructor() {
    effect(() => {
      const anamnesisFormId = this.f.anamnesisFormId().value();
      if (anamnesisFormId) {
        this.loadFieldsForForm(anamnesisFormId);
      }
    });
  }

  private initialFormId(): string {
    if (this.data.customerAnamnesis) {
      return this.data.customerAnamnesis.anamnesisFormId;
    }
    if (this.data.forms.length === 1) {
      return this.data.forms[0]!.id;
    }
    return '';
  }

  private loadFieldsForForm(anamnesisFormId: string) {
    this.loadingFields.set(true);
    this.loadFieldsErrorMessage.set(null);

    forkJoin({
      fields: this.anamnesisFieldService
        .list({ anamnesisFormId, active: true, limit: FIELDS_LIMIT })
        .pipe(map((result) => result.items)),
      sections: this.anamnesisSectionService.list(anamnesisFormId),
    }).subscribe({
      next: ({ fields, sections }) => {
        const sortedFields = [...fields].sort(byDisplayOrder(sections));
        this.fieldsSignal.set(sortedFields);
        this.sectionsSignal.set(sections);
        this.model.update((value) => ({
          ...value,
          answers: buildAnswerRows(sortedFields, this.data.customerAnamnesis?.answers),
        }));
        this.loadingFields.set(false);
      },
      error: (error: unknown) => {
        this.loadingFields.set(false);
        this.loadFieldsErrorMessage.set(extractApiErrorMessage(error, DEFAULT_LOAD_ERROR_MESSAGE));
      },
    });
  }

  private buildAnswerPayloads(rows: AnswerRowValue[]): CustomerAnamnesisAnswerPayload[] {
    const fieldsById = new Map(this.fieldsSignal().map((field) => [field.id, field]));
    const payloads: CustomerAnamnesisAnswerPayload[] = [];

    for (const row of rows) {
      const field = fieldsById.get(row.anamnesisFieldId);
      if (!field) {
        continue;
      }

      if (field.fieldType === AnamnesisFieldType.BOOLEAN) {
        payloads.push({
          anamnesisFieldId: row.anamnesisFieldId,
          value: row.booleanValue ? 'true' : 'false',
        });
        continue;
      }

      if (field.fieldType === AnamnesisFieldType.CHECKBOX) {
        const values = row.checkboxOptions
          .filter((option) => option.checked)
          .map((option) => option.value);
        if (values.length) {
          payloads.push({
            anamnesisFieldId: row.anamnesisFieldId,
            value: '',
            extraValues: { values },
          });
        }
        continue;
      }

      if (row.value.trim()) {
        payloads.push({ anamnesisFieldId: row.anamnesisFieldId, value: row.value.trim() });
      }
    }

    return payloads;
  }

  private save(value: FormModel, answers: CustomerAnamnesisAnswerPayload[]): Promise<SaveResult> {
    const isoDate = value.date ? dayjs(value.date).toISOString() : undefined;
    const customerAnamnesis = this.data.customerAnamnesis;

    const request$: Observable<SaveResult> = customerAnamnesis
      ? this.customerAnamnesisService
          .update(this.data.customerId, customerAnamnesis.id, { date: isoDate, answers })
          .pipe(
            switchMap(() =>
              this.customerAnamnesisService.getById(this.data.customerId, customerAnamnesis.id),
            ),
            map((updated): SaveResult => ({ ok: true, customerAnamnesis: updated })),
          )
      : this.customerAnamnesisService
          .create(this.data.customerId, {
            anamnesisFormId: value.anamnesisFormId,
            date: isoDate,
            answers,
          })
          .pipe(map((created): SaveResult => ({ ok: true, customerAnamnesis: created })));

    return firstValueFrom(request$.pipe(catchError((error) => of(this.toSaveError(error)))));
  }

  private toSaveError(error: unknown): SaveResult {
    const fieldErrors = new Map<string, string[]>();
    const body =
      error && typeof error === 'object' && 'error' in error
        ? (error as { error: unknown }).error
        : undefined;

    if (isApiErrorResponse(body)) {
      for (const detail of body.error.details ?? []) {
        const fieldId = fieldIdFromDetail(detail);
        if (fieldId) {
          fieldErrors.set(fieldId, [...(fieldErrors.get(fieldId) ?? []), detail.issue]);
        }
      }
    }

    return {
      ok: false,
      message: extractApiErrorMessage(error, DEFAULT_ERROR_MESSAGE),
      fieldErrors,
    };
  }

  protected cancel() {
    this.dialogRef.close(undefined);
  }
}

function fieldIdFromDetail(detail: ApiErrorDetail): string | undefined {
  const match = /^answers\.(.+)$/.exec(detail.field);
  return match?.[1];
}
