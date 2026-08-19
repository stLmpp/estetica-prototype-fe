import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { rxResource, takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { applyEach, form, FormField, FormRoot, validate } from '@angular/forms/signals';
import dayjs from 'dayjs/esm';
import {
  catchError,
  filter,
  firstValueFrom,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
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
import { AnamnesisFieldValidationType } from '../../../../anamnesis-forms/anamnesis-field-validation-type.enum';
import { AnamnesisField } from '../../../../anamnesis-forms/anamnesis-field.model';
import { AnamnesisFieldService } from '../../../../anamnesis-forms/anamnesis-field.service';
import { AnamnesisFormService } from '../../../../anamnesis-forms/anamnesis-form.service';
import { AnamnesisSection } from '../../../../anamnesis-forms/anamnesis-section.model';
import { AnamnesisSectionService } from '../../../../anamnesis-forms/anamnesis-section.service';
import { CustomerDetailsStore } from '../../customer-details.store';
import { CustomerAnamnesisAnswerPayload } from '../customer-anamnesis.dto';
import { CustomerAnamnesis, CustomerAnamnesisField } from '../customer-anamnesis.model';
import { CustomerAnamnesisService } from '../customer-anamnesis.service';

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

const FORMS_LIMIT = 100;
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

interface AnswerValidationError {
  kind: string;
  message: string;
}

function textAnswerValidationError(
  field: AnamnesisField,
  rawValue: string,
): AnswerValidationError | null {
  const trimmed = rawValue.trim();
  for (const validation of field.validations ?? []) {
    if (!validation.active) {
      continue;
    }
    switch (validation.validationType) {
      case AnamnesisFieldValidationType.REQUIRED:
        if (!trimmed) {
          return { kind: 'required', message: 'Campo obrigatório' };
        }
        break;
      case AnamnesisFieldValidationType.MIN_LENGTH: {
        const min = (validation.validationArgs as { length: number } | undefined)?.length ?? 0;
        if (trimmed.length < min) {
          return { kind: 'minLength', message: `Tamanho mínimo de ${min} caracteres` };
        }
        break;
      }
      case AnamnesisFieldValidationType.MAX_LENGTH: {
        const max =
          (validation.validationArgs as { length: number } | undefined)?.length ?? Infinity;
        if (trimmed.length > max) {
          return { kind: 'maxLength', message: `Tamanho máximo de ${max} caracteres` };
        }
        break;
      }
      case AnamnesisFieldValidationType.MIN_VALUE: {
        if (!trimmed) {
          break;
        }
        const num = Number(trimmed);
        const min =
          (validation.validationArgs as { value: number } | undefined)?.value ?? -Infinity;
        if (!Number.isNaN(num) && num < min) {
          return { kind: 'minValue', message: `Valor mínimo de ${min}` };
        }
        break;
      }
      case AnamnesisFieldValidationType.MAX_VALUE: {
        if (!trimmed) {
          break;
        }
        const num = Number(trimmed);
        const max = (validation.validationArgs as { value: number } | undefined)?.value ?? Infinity;
        if (!Number.isNaN(num) && num > max) {
          return { kind: 'maxValue', message: `Valor máximo de ${max}` };
        }
        break;
      }
      case AnamnesisFieldValidationType.PATTERN: {
        if (!trimmed) {
          break;
        }
        const pattern = (validation.validationArgs as { pattern: string } | undefined)?.pattern;
        if (pattern) {
          let matches: boolean;
          try {
            matches = new RegExp(pattern).test(trimmed);
          } catch {
            matches = true;
          }
          if (!matches) {
            return { kind: 'pattern', message: 'Formato inválido' };
          }
        }
        break;
      }
    }
  }
  return null;
}

function checkboxAnswerValidationError(
  field: AnamnesisField,
  options: CheckboxOptionValue[],
): AnswerValidationError | null {
  const requiresAtLeastOne = (field.validations ?? []).some(
    (validation) =>
      validation.active && validation.validationType === AnamnesisFieldValidationType.REQUIRED,
  );
  if (requiresAtLeastOne && !options.some((option) => option.checked)) {
    return { kind: 'required', message: 'Selecione ao menos uma opção' };
  }
  return null;
}

@Component({
  selector: 'app-customer-anamnesis-form-page',
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
    RouterLink,
    SelectDirective,
    SwitchComponent,
  ],
  templateUrl: './customer-anamnesis-form-page.component.html',
})
export class CustomerAnamnesisFormPageComponent {
  readonly customerAnamnesis = input<CustomerAnamnesis>();

  private readonly customerDetailsStore = inject(CustomerDetailsStore);
  private readonly customerAnamnesisService = inject(CustomerAnamnesisService);
  private readonly anamnesisFormService = inject(AnamnesisFormService);
  private readonly anamnesisFieldService = inject(AnamnesisFieldService);
  private readonly anamnesisSectionService = inject(AnamnesisSectionService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly customerId = computed(() => this.customerDetailsStore.customerId());
  protected readonly isEditing = computed(() => !!this.customerAnamnesis());
  protected readonly AnamnesisFieldType = AnamnesisFieldType;

  protected readonly submitErrorMessage = signal<string | null>(null);
  protected readonly fieldErrorsByFieldId = signal<Map<string, string[]>>(new Map());

  protected readonly loadingFields = signal(false);
  protected readonly loadFieldsErrorMessage = signal<string | null>(null);

  private readonly fieldsSignal = signal<AnamnesisField[]>([]);
  private readonly sectionsSignal = signal<AnamnesisSection[]>([]);

  private readonly fieldById = computed(
    () => new Map(this.fieldsSignal().map((field) => [field.id, field])),
  );

  protected readonly formsResource = rxResource({
    stream: () => this.anamnesisFormService.list({ limit: FORMS_LIMIT }),
  });
  protected readonly forms = computed(() => this.formsResource.value()?.items ?? []);
  protected readonly activeForms = computed(() => this.forms().filter((form) => form.active));
  protected readonly showFormSelector = computed(
    () => !this.isEditing() && this.activeForms().length > 1,
  );

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
    if (!this.isEditing() || this.loadingFields()) {
      return [];
    }
    const activeFieldIds = new Set(this.fieldsSignal().map((field) => field.id));
    return (this.customerAnamnesis()?.answers ?? [])
      .filter((answer) => !activeFieldIds.has(answer.anamnesisFieldId))
      .map((answer) => answer.anamnesisFieldLabel);
  });

  protected readonly model = signal<FormModel>({
    anamnesisFormId: '',
    date: dayjs().format('YYYY-MM-DD'),
    answers: [],
  });

  protected readonly f = form(
    this.model,
    (schema) => {
      applyEach(schema.answers, (row) => {
        validate(row.value, ({ value, valueOf }) => {
          const field = this.fieldById().get(valueOf(row.anamnesisFieldId));
          if (
            !field ||
            field.fieldType === AnamnesisFieldType.BOOLEAN ||
            field.fieldType === AnamnesisFieldType.CHECKBOX
          ) {
            return null;
          }
          return textAnswerValidationError(field, value());
        });
        validate(row.checkboxOptions, ({ value, valueOf }) => {
          const field = this.fieldById().get(valueOf(row.anamnesisFieldId));
          if (!field || field.fieldType !== AnamnesisFieldType.CHECKBOX) {
            return null;
          }
          return checkboxAnswerValidationError(field, value());
        });
      });
    },
    {
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
            this.isEditing() ? 'Anamnese atualizada com sucesso.' : 'Anamnese criada com sucesso.',
          );
          await this.router.navigate([
            '/customers',
            this.customerId(),
            'anamnesis',
            result.customerAnamnesis.id,
          ]);
        },
      },
    },
  );

  constructor() {
    effect(() => {
      const customerAnamnesis = this.customerAnamnesis();
      if (customerAnamnesis) {
        untracked(() => {
          this.model.update((value) => ({
            ...value,
            anamnesisFormId: customerAnamnesis.anamnesisFormId,
            date: dayjs(customerAnamnesis.date).format('YYYY-MM-DD'),
          }));
        });
        return;
      }

      if (this.model().anamnesisFormId) {
        return;
      }
      const active = this.activeForms();
      if (active.length === 1) {
        this.model.update((value) => ({ ...value, anamnesisFormId: active[0]!.id }));
      }
    });

    toObservable(computed(() => this.f.anamnesisFormId().value()))
      .pipe(
        filter((anamnesisFormId): anamnesisFormId is string => !!anamnesisFormId),
        switchMap((anamnesisFormId) => this.loadFieldsForForm$(anamnesisFormId)),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  private loadFieldsForForm$(anamnesisFormId: string): Observable<void> {
    this.loadingFields.set(true);
    this.loadFieldsErrorMessage.set(null);

    return forkJoin({
      fields: this.anamnesisFieldService.list({ anamnesisFormId, active: true }),
      sections: this.anamnesisSectionService.list(anamnesisFormId),
    }).pipe(
      tap(({ fields, sections }) => {
        const sortedFields = [...fields].sort(byDisplayOrder(sections));
        this.fieldsSignal.set(sortedFields);
        this.sectionsSignal.set(sections);
        this.model.update((value) => ({
          ...value,
          answers: buildAnswerRows(sortedFields, this.customerAnamnesis()?.answers),
        }));
        this.loadingFields.set(false);
      }),
      map(() => undefined),
      catchError((error: unknown) => {
        this.loadingFields.set(false);
        this.loadFieldsErrorMessage.set(extractApiErrorMessage(error, DEFAULT_LOAD_ERROR_MESSAGE));
        return of(undefined);
      }),
    );
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
        payloads.push({
          anamnesisFieldId: row.anamnesisFieldId,
          value: '',
          extraValues: { values },
        });
        continue;
      }

      payloads.push({ anamnesisFieldId: row.anamnesisFieldId, value: row.value.trim() });
    }

    return payloads;
  }

  private save(value: FormModel, answers: CustomerAnamnesisAnswerPayload[]): Promise<SaveResult> {
    const isoDate = value.date ? dayjs(value.date).toISOString() : undefined;
    const customerAnamnesis = this.customerAnamnesis();
    const customerId = this.customerId();

    const request$: Observable<SaveResult> = customerAnamnesis
      ? this.customerAnamnesisService
          .update(customerId, customerAnamnesis.id, { date: isoDate, answers })
          .pipe(
            map((): SaveResult => ({
              ok: true,
              customerAnamnesis: {
                ...customerAnamnesis,
                date: isoDate ?? customerAnamnesis.date,
              },
            })),
          )
      : this.customerAnamnesisService
          .create(customerId, {
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
}

function fieldIdFromDetail(detail: ApiErrorDetail): string | undefined {
  const match = /^answers\.(.+)$/.exec(detail.field);
  return match?.[1];
}
