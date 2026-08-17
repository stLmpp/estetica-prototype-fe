import { AnamnesisFieldOption } from '../../../anamnesis-forms/anamnesis-field.model';
import { AnamnesisFieldType } from '../../../anamnesis-forms/anamnesis-field-type.enum';

export const CustomerAnamnesisStatus = {
  DRAFT: 'Rascunho',
  FINALIZED: 'Finalizado',
} as const;

export type CustomerAnamnesisStatus =
  (typeof CustomerAnamnesisStatus)[keyof typeof CustomerAnamnesisStatus];

export interface CustomerAnamnesisFieldExtraValues {
  values: string[];
}

export interface CustomerAnamnesisField {
  id: string;
  anamnesisFieldId: string;
  value: string;
  extraValues?: CustomerAnamnesisFieldExtraValues;
  anamnesisFieldLabel: string;
  anamnesisFieldType: AnamnesisFieldType;
  anamnesisFieldOptions?: AnamnesisFieldOption[];
  anamnesisFieldDisplayOrder: number;
  anamnesisSectionLabel?: string;
  anamnesisSectionDisplayOrder?: number;
}

export interface CustomerAnamnesis {
  id: string;
  customerId: string;
  anamnesisFormId: string;
  appointmentId?: string;
  date: string;
  status: CustomerAnamnesisStatus;
  signedByName?: string;
  signedAt?: string;
  answers?: CustomerAnamnesisField[];
}
