import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { httpParamsFromObject } from '../../../../shared/http-params-from-object';
import { PaginationMetadata } from '../../../../shared/pagination.model';
import {
  CreateCustomerAnamnesisPayload,
  FinalizeCustomerAnamnesisPayload,
  ListCustomerAnamnesisFilter,
  ListCustomerAnamnesisResult,
  UpdateCustomerAnamnesisPayload,
} from './customer-anamnesis.dto';
import { CustomerAnamnesis } from './customer-anamnesis.model';

interface CustomerAnamnesisResponse {
  data: { customerAnamnesis: CustomerAnamnesis };
}

interface ListCustomerAnamnesisResponse {
  data: { items: CustomerAnamnesis[] };
  meta: PaginationMetadata;
}

@Service()
export class CustomerAnamnesisService {
  private readonly http = inject(HttpClient);

  private baseUrl(customerId: string) {
    return `${environment.api}/v1/customer/${customerId}/anamnesis`;
  }

  list(customerId: string, filter: ListCustomerAnamnesisFilter = {}) {
    const params = httpParamsFromObject({ page: filter.page, limit: filter.limit });
    return this.http.get<ListCustomerAnamnesisResponse>(this.baseUrl(customerId), { params }).pipe(
      map((response): ListCustomerAnamnesisResult => ({
        items: response.data.items,
        meta: response.meta,
      })),
    );
  }

  getById(customerId: string, anamnesisId: string) {
    return this.http
      .get<CustomerAnamnesisResponse>(`${this.baseUrl(customerId)}/${anamnesisId}`)
      .pipe(map((response) => response.data.customerAnamnesis));
  }

  create(customerId: string, payload: CreateCustomerAnamnesisPayload) {
    return this.http
      .post<CustomerAnamnesisResponse>(this.baseUrl(customerId), { customerAnamnesis: payload })
      .pipe(map((response) => response.data.customerAnamnesis));
  }

  update(customerId: string, anamnesisId: string, payload: UpdateCustomerAnamnesisPayload) {
    return this.http.patch<void>(`${this.baseUrl(customerId)}/${anamnesisId}`, {
      customerAnamnesis: payload,
    });
  }

  finalize(customerId: string, anamnesisId: string, payload: FinalizeCustomerAnamnesisPayload) {
    return this.http
      .patch<CustomerAnamnesisResponse>(`${this.baseUrl(customerId)}/${anamnesisId}/finalize`, {
        customerAnamnesis: payload,
      })
      .pipe(map((response) => response.data.customerAnamnesis));
  }

  delete(customerId: string, anamnesisId: string) {
    return this.http.delete<void>(`${this.baseUrl(customerId)}/${anamnesisId}`);
  }
}
