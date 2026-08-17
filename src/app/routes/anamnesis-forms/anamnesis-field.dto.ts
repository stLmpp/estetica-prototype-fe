import { PaginationMetadata } from '../../shared/pagination.model';
import { AnamnesisFieldType } from './anamnesis-field-type.enum';
import { AnamnesisFieldValidationType } from './anamnesis-field-validation-type.enum';
import {
  AnamnesisField,
  AnamnesisFieldArgs,
  AnamnesisFieldExtraLabels,
  AnamnesisFieldValidationArgs,
} from './anamnesis-field.model';

export interface AnamnesisFieldValidationPayload {
  validationType: AnamnesisFieldValidationType;
  validationArgs?: AnamnesisFieldValidationArgs | null;
  active: boolean;
}

export interface CreateAnamnesisFieldPayload {
  anamnesisFormId: string;
  anamnesisSectionId?: string | null;
  fieldType: AnamnesisFieldType;
  fieldArgs?: AnamnesisFieldArgs | null;
  label: string;
  extraLabels?: AnamnesisFieldExtraLabels | null;
  active: boolean;
  displayOrder: number;
  validations: AnamnesisFieldValidationPayload[];
}

export type UpdateAnamnesisFieldPayload = Partial<
  Omit<CreateAnamnesisFieldPayload, 'anamnesisFormId'>
>;

export interface ListAnamnesisFieldFilter {
  page?: number;
  limit?: 10 | 25 | 50 | 100;
  anamnesisFormId: string;
  anamnesisSectionId?: string;
  active?: boolean;
}

export interface ListAnamnesisFieldResult {
  items: AnamnesisField[];
  meta: PaginationMetadata;
}
