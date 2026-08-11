import { MaritalStatus } from './marital-status.enum';
import { PhoneType } from './phone-type.enum';

export interface Customer {
  id: string;
  name: string;
}

export interface CustomerPhone {
  id: string;
  type: PhoneType;
  number: string;
}

export interface CustomerDetail {
  id: string;
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
  phones?: CustomerPhone[];
}
