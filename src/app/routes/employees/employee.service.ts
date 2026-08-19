import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { httpParamsFromObject } from '../../shared/http-params-from-object';
import { PaginationMetadata } from '../../shared/pagination.model';
import {
  EmployeePayload,
  ListEmployeeFilter,
  ListEmployeeResult,
  UpdateEmployeePayload,
} from './employee.dto';
import { Employee, EmployeeDetail } from './employee.model';

interface EmployeeResponse {
  data: { employee: EmployeeDetail };
}

interface ListEmployeeResponse {
  data: { items: Employee[] };
  meta: PaginationMetadata;
}

@Service()
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api}/v1/employee`;

  list(filter: ListEmployeeFilter = {}) {
    const params = httpParamsFromObject({
      page: filter.page,
      limit: filter.limit,
      name: filter.name,
      role: filter.role,
      catalogItemId: filter.catalogItemId,
    });
    return this.http.get<ListEmployeeResponse>(this.baseUrl, { params }).pipe(
      map((response): ListEmployeeResult => ({
        items: response.data.items,
        meta: response.meta,
      })),
    );
  }

  getById(employeeId: string) {
    return this.http
      .get<EmployeeResponse>(`${this.baseUrl}/${employeeId}`)
      .pipe(map((response) => response.data.employee));
  }

  create(payload: EmployeePayload) {
    return this.http
      .post<EmployeeResponse>(this.baseUrl, { employee: payload })
      .pipe(map((response) => response.data.employee));
  }

  update(employeeId: string, payload: UpdateEmployeePayload) {
    return this.http.patch<void>(`${this.baseUrl}/${employeeId}`, {
      employee: payload,
    });
  }

  delete(employeeId: string) {
    return this.http.delete<void>(`${this.baseUrl}/${employeeId}`);
  }
}
