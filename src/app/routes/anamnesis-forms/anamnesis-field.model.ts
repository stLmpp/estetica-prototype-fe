import { AnamnesisFieldType } from './anamnesis-field-type.enum';
import { AnamnesisFieldValidationType } from './anamnesis-field-validation-type.enum';

export interface AnamnesisFieldOption {
  value: string;
  label: string;
}

export interface AnamnesisFieldArgs {
  options: AnamnesisFieldOption[];
}

export interface AnamnesisFieldExtraLabels {
  description?: string;
}

export interface AnamnesisFieldValidationArgsLength {
  length: number;
}

export interface AnamnesisFieldValidationArgsValue {
  value: number;
}

export interface AnamnesisFieldValidationArgsPattern {
  pattern: string;
}

export type AnamnesisFieldValidationArgs =
  | AnamnesisFieldValidationArgsLength
  | AnamnesisFieldValidationArgsValue
  | AnamnesisFieldValidationArgsPattern;

export interface AnamnesisFieldValidationBase {
  id: string;
  active: boolean;
}

export type AnamnesisFieldValidation = AnamnesisFieldValidationBase &
  (
    | {
        validationType: AnamnesisFieldValidationType.REQUIRED;
        validationArgs: undefined;
      }
    | {
        validationType:
          AnamnesisFieldValidationType.MAX_LENGTH | AnamnesisFieldValidationType.MIN_LENGTH;
        validationArgs: AnamnesisFieldValidationArgsLength;
      }
    | {
        validationType:
          AnamnesisFieldValidationType.MIN_VALUE | AnamnesisFieldValidationType.MAX_VALUE;
        validationArgs: AnamnesisFieldValidationArgsValue;
      }
    | {
        validationType: AnamnesisFieldValidationType.PATTERN;
        validationArgs: AnamnesisFieldValidationArgsPattern;
      }
  );

/**
 * `Extract<AnamnesisFieldValidation, { validationType: T }>` doesn't work here: the
 * MIN_LENGTH/MAX_LENGTH (and MIN_VALUE/MAX_VALUE) variants share one member whose
 * `validationType` is itself a union of two types, which `Extract` only matches when
 * `T` covers the whole union, not a single one of the two literals.
 */
export type AnamnesisFieldValidationOfType<T extends AnamnesisFieldValidationType> =
  AnamnesisFieldValidation extends infer Validation
    ? Validation extends { validationType: infer ValidationType }
      ? T extends ValidationType
        ? Validation
        : never
      : never
    : never;

export interface AnamnesisField {
  id: string;
  anamnesisFormId: string;
  anamnesisSectionId?: string;
  fieldType: AnamnesisFieldType;
  fieldArgs?: AnamnesisFieldArgs;
  label: string;
  extraLabels?: AnamnesisFieldExtraLabels;
  active: boolean;
  displayOrder: number;
  validations?: AnamnesisFieldValidation[];
}
