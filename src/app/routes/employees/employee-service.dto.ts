import { PaginationMetadata } from '../../shared/pagination.model';
import { EmployeeService } from './employee-service.model';

export interface EmployeeServicePayload {
  employeeId: string;
  catalogItemId: string;
}

export interface ListEmployeeServiceFilter {
  page?: number;
  limit?: 10 | 25 | 50 | 100;
  employeeId?: string;
  catalogItemId?: string;
}

export interface ListEmployeeServiceResult {
  items: EmployeeService[];
  meta: PaginationMetadata;
}
