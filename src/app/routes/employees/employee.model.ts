import { MaritalStatus } from '../../model/marital-status.enum';
import { PhoneType } from '../../model/phone-type.enum';
import { WeeklyWorkingHours } from '../../model/working-hours.model';

export interface Employee {
  id: string;
  name: string;
  role: string;
  workingHours?: WeeklyWorkingHours | null;
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
  workingHours?: WeeklyWorkingHours | null;
}
