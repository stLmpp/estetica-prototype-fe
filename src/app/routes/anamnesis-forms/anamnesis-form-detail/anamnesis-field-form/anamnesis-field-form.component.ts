import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import {
  applyEach,
  form,
  FormField,
  FormRoot,
  hidden,
  required,
  validate,
} from '@angular/forms/signals';
import { catchError, firstValueFrom, map, Observable, of } from 'rxjs';
import { ButtonComponent } from '../../../../components/button/button.component';
import { FormFieldComponent } from '../../../../components/form-field/form-field.component';
import { IconButtonComponent } from '../../../../components/icon-button/icon-button.component';
import { InputDirective } from '../../../../components/input/input.directive';
import { LabelComponent } from '../../../../components/label/label.component';
import { SelectDirective } from '../../../../components/select/select.directive';
import { SwitchComponent } from '../../../../components/switch/switch.component';
import { ToastService } from '../../../../components/toast/toast.service';
import { extractApiErrorMessage } from '../../../../model/api-error';
import { LucideTrash2 } from '@lucide/angular';
import {
  ANAMNESIS_FIELD_TYPE_LABELS,
  AnamnesisFieldType,
  CHOICE_FIELD_TYPES,
} from '../../anamnesis-field-type.enum';
import {
  ANAMNESIS_FIELD_VALIDATION_TYPE_LABELS,
  AnamnesisFieldValidationType,
  VALIDATION_ARGS_KEY,
  VALIDATION_TYPES_BY_FIELD_TYPE,
} from '../../anamnesis-field-validation-type.enum';
import {
  AnamnesisFieldValidationPayload,
  CreateAnamnesisFieldPayload,
} from '../../anamnesis-field.dto';
import {
  AnamnesisField,
  AnamnesisFieldOption,
  AnamnesisFieldValidation,
  AnamnesisFieldValidationArgs,
  AnamnesisFieldValidationArgsDate,
  AnamnesisFieldValidationArgsLength,
  AnamnesisFieldValidationArgsPattern,
  AnamnesisFieldValidationArgsValue,
} from '../../anamnesis-field.model';
import { AnamnesisFieldService } from '../../anamnesis-field.service';
import { AnamnesisSection } from '../../anamnesis-section.model';

interface ValidationRowValue {
  validationType: AnamnesisFieldValidationType;
  length: string;
  value: string;
  pattern: string;
  date: string;
  active: boolean;
}

type SaveResult = { ok: true; anamnesisField: AnamnesisField } | { ok: false; message: string };

const DEFAULT_ERROR_MESSAGE = 'Não foi possível salvar o campo. Tente novamente.';

function toValidationRow(
  validationType: AnamnesisFieldValidationType,
  validationArgs: AnamnesisFieldValidationArgs | undefined,
  active: boolean,
): ValidationRowValue {
  return {
    validationType,
    length: validationArgs && 'length' in validationArgs ? String(validationArgs.length) : '',
    value: validationArgs && 'value' in validationArgs ? String(validationArgs.value) : '',
    pattern: validationArgs && 'pattern' in validationArgs ? validationArgs.pattern : '',
    date: validationArgs && 'date' in validationArgs ? validationArgs.date : '',
    active,
  };
}

function toAnamnesisFieldValidation(
  id: string,
  validationType: AnamnesisFieldValidationType,
  validationArgs: AnamnesisFieldValidationArgs | undefined,
  active: boolean,
): AnamnesisFieldValidation {
  switch (validationType) {
    case AnamnesisFieldValidationType.REQUIRED:
      return { id, validationType, validationArgs: undefined, active };
    case AnamnesisFieldValidationType.MIN_LENGTH:
    case AnamnesisFieldValidationType.MAX_LENGTH:
      return {
        id,
        validationType,
        validationArgs: validationArgs as AnamnesisFieldValidationArgsLength,
        active,
      };
    case AnamnesisFieldValidationType.MIN_VALUE:
    case AnamnesisFieldValidationType.MAX_VALUE:
      return {
        id,
        validationType,
        validationArgs: validationArgs as AnamnesisFieldValidationArgsValue,
        active,
      };
    case AnamnesisFieldValidationType.PATTERN:
      return {
        id,
        validationType,
        validationArgs: validationArgs as AnamnesisFieldValidationArgsPattern,
        active,
      };
    case AnamnesisFieldValidationType.MIN_DATE:
    case AnamnesisFieldValidationType.MAX_DATE:
      return {
        id,
        validationType,
        validationArgs: validationArgs as AnamnesisFieldValidationArgsDate,
        active,
      };
    case AnamnesisFieldValidationType.DATE_IN_FUTURE:
    case AnamnesisFieldValidationType.DATE_IN_PAST:
    case AnamnesisFieldValidationType.DATE_TODAY_OR_LATER:
    case AnamnesisFieldValidationType.DATE_TODAY_OR_EARLIER:
      return { id, validationType, validationArgs: undefined, active };
  }
}

function mergeValidations(
  payloadValidations: AnamnesisFieldValidationPayload[],
  previousValidations: AnamnesisFieldValidation[] | undefined,
): AnamnesisFieldValidation[] {
  const previousByType = new Map(
    (previousValidations ?? []).map((validation) => [validation.validationType, validation]),
  );
  return payloadValidations.map((validationPayload) =>
    toAnamnesisFieldValidation(
      previousByType.get(validationPayload.validationType)?.id ?? crypto.randomUUID(),
      validationPayload.validationType,
      validationPayload.validationArgs ?? undefined,
      validationPayload.active,
    ),
  );
}

function buildValidationArgs(row: ValidationRowValue): AnamnesisFieldValidationArgs | null {
  const key = VALIDATION_ARGS_KEY[row.validationType];
  if (key === 'length') {
    return { length: Number(row.length) || 0 };
  }
  if (key === 'value') {
    return { value: Number(row.value) || 0 };
  }
  if (key === 'pattern') {
    return { pattern: row.pattern.trim() };
  }
  if (key === 'date') {
    return { date: row.date.trim() };
  }
  return null;
}

@Component({
  selector: 'app-anamnesis-field-form',
  imports: [
    ButtonComponent,
    FormField,
    FormFieldComponent,
    FormRoot,
    IconButtonComponent,
    InputDirective,
    LabelComponent,
    SelectDirective,
    SwitchComponent,
  ],
  templateUrl: './anamnesis-field-form.component.html',
  host: {
    class:
      'block rounded-xl border border-neutral-200 p-4 dark:border-neutral-700 dark:bg-neutral-800/50',
  },
})
export class AnamnesisFieldFormComponent {
  readonly anamnesisFormId = input.required<string>();
  readonly sections = input.required<AnamnesisSection[]>();
  readonly anamnesisField = input<AnamnesisField>();

  readonly saved = output<AnamnesisField>();
  readonly cancelled = output<void>();

  private readonly anamnesisFieldService = inject(AnamnesisFieldService);
  private readonly toastService = inject(ToastService);

  protected readonly isEditing = computed(() => !!this.anamnesisField());
  protected readonly submitErrorMessage = signal<string | null>(null);

  protected readonly AnamnesisFieldType = AnamnesisFieldType;
  protected readonly fieldTypeOptions = Object.values(AnamnesisFieldType);
  protected readonly ANAMNESIS_FIELD_TYPE_LABELS = ANAMNESIS_FIELD_TYPE_LABELS;
  protected readonly ANAMNESIS_FIELD_VALIDATION_TYPE_LABELS =
    ANAMNESIS_FIELD_VALIDATION_TYPE_LABELS;
  protected readonly VALIDATION_ARGS_KEY = VALIDATION_ARGS_KEY;
  protected readonly CHOICE_FIELD_TYPES = CHOICE_FIELD_TYPES;
  protected readonly LucideTrash2 = LucideTrash2;

  protected readonly model = signal({
    label: '',
    fieldType: AnamnesisFieldType.TEXT,
    anamnesisSectionId: '',
    description: '',
    displayOrder: '0',
    active: true,
    options: [] as AnamnesisFieldOption[],
    validations: [] as ValidationRowValue[],
  });

  protected readonly availableValidationTypes = computed(
    () => VALIDATION_TYPES_BY_FIELD_TYPE[this.f.fieldType().value()],
  );

  constructor() {
    effect(() => {
      const anamnesisField = this.anamnesisField();
      if (anamnesisField) {
        untracked(() => {
          this.model.set({
            label: anamnesisField.label,
            fieldType: anamnesisField.fieldType,
            anamnesisSectionId: anamnesisField.anamnesisSectionId ?? '',
            description: anamnesisField.extraLabels?.description ?? '',
            displayOrder: String(anamnesisField.displayOrder),
            active: anamnesisField.active,
            options: anamnesisField.fieldArgs?.options.map((option) => ({ ...option })) ?? [],
            validations: (anamnesisField.validations ?? []).map((validation) =>
              toValidationRow(
                validation.validationType,
                validation.validationArgs,
                validation.active,
              ),
            ),
          });
        });
      }
    });

    effect(() => {
      const allowedTypes = new Set(this.availableValidationTypes());
      this.model.update((value) => {
        const validations = value.validations.filter((validationRow) =>
          allowedTypes.has(validationRow.validationType),
        );
        return validations.length === value.validations.length ? value : { ...value, validations };
      });
    });
  }

  protected readonly f = form(
    this.model,
    (schema) => {
      required(schema.label, { message: 'Nome do campo é obrigatório' });
      required(schema.fieldType, { message: 'Tipo é obrigatório' });

      hidden(schema.options, {
        when: (ctx) => !CHOICE_FIELD_TYPES.has(ctx.valueOf(schema.fieldType)),
      });
      validate(schema.options, ({ value, valueOf }) => {
        if (!CHOICE_FIELD_TYPES.has(valueOf(schema.fieldType))) {
          return null;
        }
        return value().length > 0
          ? null
          : { kind: 'required', message: 'Adicione ao menos uma opção' };
      });
      applyEach(schema.options, (option) => {
        required(option.value, { message: 'Valor é obrigatório' });
        required(option.label, { message: 'Rótulo é obrigatório' });
      });

      validate(schema.validations, ({ value }) => {
        const types = value().map((validation) => validation.validationType);
        return new Set(types).size === types.length
          ? null
          : {
              kind: 'duplicateValidation',
              message: 'Cada tipo de validação só pode ser usado uma vez',
            };
      });
      applyEach(schema.validations, (validationRow) => {
        validate(validationRow.length, ({ value, valueOf }) => {
          if (VALIDATION_ARGS_KEY[valueOf(validationRow.validationType)] !== 'length') {
            return null;
          }
          const raw = value().trim();
          return raw && Number.isInteger(Number(raw)) && Number(raw) > 0
            ? null
            : { kind: 'invalidLength', message: 'Informe um número inteiro positivo' };
        });
        validate(validationRow.value, ({ value, valueOf }) => {
          if (VALIDATION_ARGS_KEY[valueOf(validationRow.validationType)] !== 'value') {
            return null;
          }
          const raw = value().trim();
          return raw && !Number.isNaN(Number(raw))
            ? null
            : { kind: 'invalidValue', message: 'Informe um número válido' };
        });
        validate(validationRow.pattern, ({ value, valueOf }) => {
          if (VALIDATION_ARGS_KEY[valueOf(validationRow.validationType)] !== 'pattern') {
            return null;
          }
          return value().trim() ? null : { kind: 'required', message: 'Padrão é obrigatório' };
        });
        validate(validationRow.date, ({ value, valueOf }) => {
          if (VALIDATION_ARGS_KEY[valueOf(validationRow.validationType)] !== 'date') {
            return null;
          }
          return value().trim() ? null : { kind: 'required', message: 'Data é obrigatória' };
        });
      });
    },
    {
      submission: {
        action: async (field) => {
          this.submitErrorMessage.set(null);

          const value = field().value();
          const payload: CreateAnamnesisFieldPayload = {
            anamnesisFormId: this.anamnesisFormId(),
            anamnesisSectionId: value.anamnesisSectionId || null,
            fieldType: value.fieldType,
            fieldArgs: CHOICE_FIELD_TYPES.has(value.fieldType)
              ? {
                  options: value.options.map((option) => ({
                    value: option.value.trim(),
                    label: option.label.trim(),
                  })),
                }
              : null,
            label: value.label.trim(),
            extraLabels: value.description.trim()
              ? { description: value.description.trim() }
              : null,
            active: value.active,
            displayOrder: Number(value.displayOrder) || 0,
            validations: value.validations.map(
              (validationRow): AnamnesisFieldValidationPayload => ({
                validationType: validationRow.validationType,
                validationArgs: buildValidationArgs(validationRow),
                active: validationRow.active,
              }),
            ),
          };

          const result = await this.save(payload);

          if (!result.ok) {
            this.submitErrorMessage.set(result.message);
            return;
          }

          this.toastService.success(
            this.isEditing() ? 'Campo atualizado com sucesso.' : 'Campo criado com sucesso.',
          );
          this.saved.emit(result.anamnesisField);
        },
      },
    },
  );

  protected addOption() {
    this.model.update((value) => ({
      ...value,
      options: [...value.options, { value: '', label: '' }],
    }));
  }

  protected removeOption(index: number) {
    this.model.update((value) => ({
      ...value,
      options: value.options.filter((_, i) => i !== index),
    }));
  }

  protected addValidation() {
    this.model.update((value) => ({
      ...value,
      validations: [
        ...value.validations,
        toValidationRow(
          this.availableValidationTypes()[0] ?? AnamnesisFieldValidationType.REQUIRED,
          undefined,
          true,
        ),
      ],
    }));
  }

  protected removeValidation(index: number) {
    this.model.update((value) => ({
      ...value,
      validations: value.validations.filter((_, i) => i !== index),
    }));
  }

  private save(payload: CreateAnamnesisFieldPayload): Promise<SaveResult> {
    const anamnesisField = this.anamnesisField();
    const request$: Observable<SaveResult> = anamnesisField
      ? this.anamnesisFieldService
          .update(anamnesisField.id, {
            anamnesisSectionId: payload.anamnesisSectionId,
            fieldType: payload.fieldType,
            fieldArgs: payload.fieldArgs,
            label: payload.label,
            extraLabels: payload.extraLabels,
            active: payload.active,
            displayOrder: payload.displayOrder,
            validations: payload.validations,
          })
          .pipe(
            map((): SaveResult => ({
              ok: true,
              anamnesisField: {
                ...anamnesisField,
                anamnesisSectionId: payload.anamnesisSectionId ?? undefined,
                fieldType: payload.fieldType,
                fieldArgs: payload.fieldArgs ?? undefined,
                label: payload.label,
                extraLabels: payload.extraLabels ?? undefined,
                active: payload.active,
                displayOrder: payload.displayOrder,
                validations: mergeValidations(payload.validations, anamnesisField.validations),
              },
            })),
          )
      : this.anamnesisFieldService
          .create(payload)
          .pipe(map((createdField) => ({ ok: true, anamnesisField: createdField })));

    return firstValueFrom(
      request$.pipe(
        catchError((error) =>
          of<SaveResult>({
            ok: false,
            message: extractApiErrorMessage(error, DEFAULT_ERROR_MESSAGE),
          }),
        ),
      ),
    );
  }

  protected cancel() {
    this.cancelled.emit();
  }
}
