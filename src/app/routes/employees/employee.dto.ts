import { PaginationMetadata } from '../../shared/pagination.model';
import { MaritalStatus } from '../../model/marital-status.enum';
import { PhoneType } from '../../model/phone-type.enum';
import { Employee } from './employee.model';

export interface EmployeePhonePayload {
  type: PhoneType;
  number: string;
}

export interface EmployeePayload {
  name: string;
  role: string;
  birthDate?: string;
  address?: string;
  zipCode?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  maritalStatus?: MaritalStatus;
  email?: string;
  phones?: EmployeePhonePayload[];
}

export type UpdateEmployeePayload = Partial<Omit<EmployeePayload, 'phones'>>;

export interface ListEmployeeFilter {
  page?: number;
  limit?: 10 | 25 | 50 | 100;
  name?: string;
  role?: string;
  catalogItemId?: string;
}

export interface ListEmployeeResult {
  items: Employee[];
  meta: PaginationMetadata;
}
