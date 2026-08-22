import { PaginationMetadata } from '../../../../shared/pagination.model';
import { CustomerFollowupListItem } from './customer-followup.model';

export interface CustomerFollowupItemPayload {
  description: string;
  catalogItemId?: string;
  quantity?: number;
  priceApplied: string;
}

export interface CreateCustomerFollowupPayload {
  customerId: string;
  text: string;
  date?: string;
  appointmentId?: string;
  saleId?: string;
  items?: CustomerFollowupItemPayload[];
}

export interface UpdateCustomerFollowupPayload {
  text?: string;
  date?: string;
  appointmentId?: string | null;
  saleId?: string | null;
  items?: CustomerFollowupItemPayload[];
}

export interface ListCustomerFollowupFilter {
  customerId: string;
  page?: number;
  limit?: 10 | 25 | 50 | 100;
}

export interface ListCustomerFollowupResult {
  items: CustomerFollowupListItem[];
  meta: PaginationMetadata;
}
