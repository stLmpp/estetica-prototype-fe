import { PaginationMetadata } from '../../shared/pagination.model';
import { Customer } from './customer.model';
import { MaritalStatus } from './marital-status.enum';
import { PhoneType } from './phone-type.enum';

export interface CustomerPhonePayload {
  type: PhoneType;
  number: string;
}

export interface CustomerPayload {
  name: string;
  birthDate?: string;
  address?: string;
  zipCode?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  jobName?: string;
  maritalStatus?: MaritalStatus;
  email?: string;
  phones?: CustomerPhonePayload[];
}

// The update endpoint doesn't accept `phones` - a customer's phones can only
// be set at creation time.
export type UpdateCustomerPayload = Partial<Omit<CustomerPayload, 'phones'>>;

export interface ListCustomerFilter {
  page?: number;
  limit?: 10 | 25 | 50 | 100;
  name?: string;
}

export interface ListCustomerResult {
  items: Customer[];
  meta: PaginationMetadata;
}
