import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { httpParamsFromObject } from '../../shared/http-params-from-object';
import { ApiKeyedResponse, ApiPaginatedResponse } from '../../model/api-response';
import {
  CustomerPayload,
  ListCustomerFilter,
  ListCustomerResult,
  SyncCustomerPhonesPayload,
  UpdateCustomerPayload,
} from './customer.dto';
import { Customer, CustomerDetail, CustomerPhone } from './customer.model';

@Service()
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api}/v1/customer`;

  list(filter: ListCustomerFilter = {}) {
    const params = httpParamsFromObject({
      page: filter.page,
      limit: filter.limit,
      name: filter.name,
    });
    return this.http.get<ApiPaginatedResponse<Customer>>(this.baseUrl, { params }).pipe(
      map((response): ListCustomerResult => ({
        items: response.data.items,
        meta: response.meta,
      })),
    );
  }

  getById(customerId: string) {
    return this.http
      .get<ApiKeyedResponse<'customer', CustomerDetail>>(`${this.baseUrl}/${customerId}`)
      .pipe(map((response) => response.data.customer));
  }

  create(payload: CustomerPayload) {
    return this.http
      .post<ApiKeyedResponse<'customer', CustomerDetail>>(this.baseUrl, { customer: payload })
      .pipe(map((response) => response.data.customer));
  }

  update(customerId: string, payload: UpdateCustomerPayload) {
    return this.http.patch<void>(`${this.baseUrl}/${customerId}`, {
      customer: payload,
    });
  }

  delete(customerId: string) {
    return this.http.delete<void>(`${this.baseUrl}/${customerId}`);
  }

  syncPhones(customerId: string, phones: SyncCustomerPhonesPayload) {
    return this.http
      .put<ApiKeyedResponse<'phones', CustomerPhone[]>>(`${this.baseUrl}/${customerId}/phones`, {
        customer: { phones },
      })
      .pipe(map((response) => response.data.phones));
  }
}
