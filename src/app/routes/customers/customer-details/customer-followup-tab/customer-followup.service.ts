import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { httpParamsFromObject } from '../../../../shared/http-params-from-object';
import { ApiKeyedResponse, ApiPaginatedResponse } from '../../../../model/api-response';
import {
  CreateCustomerFollowupPayload,
  ListCustomerFollowupFilter,
  ListCustomerFollowupResult,
  UpdateCustomerFollowupPayload,
} from './customer-followup.dto';
import { CustomerFollowup, CustomerFollowupListItem } from './customer-followup.model';

@Service()
export class CustomerFollowupService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api}/v1/customer-followup`;

  list(filter: ListCustomerFollowupFilter) {
    const params = httpParamsFromObject({
      customerId: filter.customerId,
      page: filter.page,
      limit: filter.limit,
    });
    return this.http
      .get<ApiPaginatedResponse<CustomerFollowupListItem>>(this.baseUrl, { params })
      .pipe(
        map((response): ListCustomerFollowupResult => ({
          items: response.data.items,
          meta: response.meta,
        })),
      );
  }

  getById(customerFollowupId: string) {
    return this.http
      .get<ApiKeyedResponse<'customerFollowup', CustomerFollowup>>(
        `${this.baseUrl}/${customerFollowupId}`,
      )
      .pipe(map((response) => response.data.customerFollowup));
  }

  create(payload: CreateCustomerFollowupPayload) {
    return this.http
      .post<ApiKeyedResponse<'customerFollowup', CustomerFollowup>>(this.baseUrl, {
        customerFollowup: payload,
      })
      .pipe(map((response) => response.data.customerFollowup));
  }

  update(customerFollowupId: string, payload: UpdateCustomerFollowupPayload) {
    return this.http.patch<void>(`${this.baseUrl}/${customerFollowupId}`, {
      customerFollowup: payload,
    });
  }

  delete(customerFollowupId: string) {
    return this.http.delete<void>(`${this.baseUrl}/${customerFollowupId}`);
  }
}
