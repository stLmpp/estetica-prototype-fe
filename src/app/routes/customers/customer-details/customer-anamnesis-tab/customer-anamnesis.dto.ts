import { PaginationMetadata } from '../../../../shared/pagination.model';
import { CustomerAnamnesis, CustomerAnamnesisFieldExtraValues } from './customer-anamnesis.model';

export interface CustomerAnamnesisAnswerPayload {
  anamnesisFieldId: string;
  value: string;
  extraValues?: CustomerAnamnesisFieldExtraValues | null;
}

export interface CreateCustomerAnamnesisPayload {
  anamnesisFormId: string;
  appointmentId?: string | null;
  date?: string;
  answers: CustomerAnamnesisAnswerPayload[];
}

export interface UpdateCustomerAnamnesisPayload {
  date?: string;
  answers?: CustomerAnamnesisAnswerPayload[];
}

export interface FinalizeCustomerAnamnesisPayload {
  signedByName: string;
}

export interface ListCustomerAnamnesisFilter {
  page?: number;
  limit?: 10 | 25 | 50 | 100;
}

export interface ListCustomerAnamnesisResult {
  items: CustomerAnamnesis[];
  meta: PaginationMetadata;
}
