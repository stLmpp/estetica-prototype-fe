import { MaritalStatus } from '../../model/marital-status.enum';
import { PhoneType } from '../../model/phone-type.enum';

export interface Employee {
  id: string;
  name: string;
  role: string;
}

export interface EmployeePhone {
  id: string;
  type: PhoneType;
  number: string;
}

export interface EmployeeDetail {
  id: string;
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
  phones?: EmployeePhone[];
}
