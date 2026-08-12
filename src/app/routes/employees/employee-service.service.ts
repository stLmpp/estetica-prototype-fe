import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { httpParamsFromObject } from '../../shared/http-params-from-object';
import { PaginationMetadata } from '../../shared/pagination.model';
import { EmployeeServicePayload, ListEmployeeServiceFilter, ListEmployeeServiceResult } from './employee-service.dto';
import { EmployeeService as EmployeeServiceModel } from './employee-service.model';

interface CreateEmployeeServiceResponse {
  data: { employeeService: EmployeeServiceModel };
}

interface SyncEmployeeServiceResponse {
  data: { employeeServices: EmployeeServiceModel[] };
}

interface ListEmployeeServiceResponse {
  data: { items: EmployeeServiceModel[] };
  meta: PaginationMetadata;
}

@Service()
export class EmployeeServiceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api}/v1/employee-service`;

  list(filter: ListEmployeeServiceFilter = {}) {
    const params = httpParamsFromObject({
      page: filter.page,
      limit: filter.limit,
      employeeId: filter.employeeId,
      catalogItemId: filter.catalogItemId,
    });
    return this.http.get<ListEmployeeServiceResponse>(this.baseUrl, { params }).pipe(
      map(
        (response): ListEmployeeServiceResult => ({
          items: response.data.items,
          meta: response.meta,
        }),
      ),
    );
  }

  create(payload: EmployeeServicePayload) {
    return this.http
      .post<CreateEmployeeServiceResponse>(this.baseUrl, { employeeService: payload })
      .pipe(map((response) => response.data.employeeService));
  }

  delete(employeeServiceId: string) {
    return this.http.delete<void>(`${this.baseUrl}/${employeeServiceId}`);
  }

  sync(employeeId: string, catalogItemIds: string[]) {
    return this.http
      .put<SyncEmployeeServiceResponse>(`${this.baseUrl}/employee/${employeeId}`, { catalogItemIds })
      .pipe(map((response) => response.data.employeeServices));
  }
}
