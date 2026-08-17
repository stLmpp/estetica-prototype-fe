import { PaginationMetadata } from '../../shared/pagination.model';
import { Customer } from './customer.model';
import { MaritalStatus } from '../../model/marital-status.enum';
import { PhoneType } from '../../model/phone-type.enum';

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

// The update endpoint doesn't accept `phones` - phones are managed
// separately via CustomerService.syncPhones (PUT .../phones).
export type UpdateCustomerPayload = Partial<Omit<CustomerPayload, 'phones'>>;

export type SyncCustomerPhonesPayload = CustomerPhonePayload[];

export interface ListCustomerFilter {
  page?: number;
  limit?: 10 | 25 | 50 | 100;
  name?: string;
}

export interface ListCustomerResult {
  items: Customer[];
  meta: PaginationMetadata;
}
