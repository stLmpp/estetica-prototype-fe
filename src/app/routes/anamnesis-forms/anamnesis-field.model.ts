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

export interface AnamnesisFieldValidation {
  id: string;
  validationType: AnamnesisFieldValidationType;
  validationArgs?: AnamnesisFieldValidationArgs;
  active: boolean;
}

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
