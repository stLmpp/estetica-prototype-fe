import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { httpParamsFromObject } from '../../shared/http-params-from-object';
import { ApiPaginatedResponse, ApiResponse } from '../../model/api-response';
import {
  AddSaleTransactionResult,
  ListSaleFilter,
  ListSaleResult,
  SalePayload,
  SaleTransactionPayload,
  UpdateSaleStatusPayload,
} from './sale.dto';
import { Sale, SaleDetail } from './sale.model';

interface SaleResponse {
  data: { sale: SaleDetail };
}

@Service()
export class SaleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api}/v1/sale`;

  list(filter: ListSaleFilter = {}) {
    const params = httpParamsFromObject({
      page: filter.page,
      limit: filter.limit,
      customerId: filter.customerId,
      employeeId: filter.employeeId,
      appointmentId: filter.appointmentId,
      status: filter.status,
      from: filter.from,
      to: filter.to,
    });
    return this.http.get<ApiPaginatedResponse<Sale>>(this.baseUrl, { params }).pipe(
      map((response): ListSaleResult => ({
        items: response.data.items,
        meta: response.meta,
      })),
    );
  }

  getById(saleId: string) {
    return this.http
      .get<SaleResponse>(`${this.baseUrl}/${saleId}`)
      .pipe(map((response) => response.data.sale));
  }

  create(payload: SalePayload) {
    return this.http
      .post<SaleResponse>(this.baseUrl, { sale: payload })
      .pipe(map((response) => response.data.sale));
  }

  addTransaction(saleId: string, payload: SaleTransactionPayload) {
    return this.http
      .post<ApiResponse<AddSaleTransactionResult>>(`${this.baseUrl}/${saleId}/transaction`, {
        transaction: payload,
      })
      .pipe(map((response) => response.data));
  }

  updateStatus(saleId: string, payload: UpdateSaleStatusPayload) {
    return this.http.patch<void>(`${this.baseUrl}/${saleId}/status`, { sale: payload });
  }

  delete(saleId: string) {
    return this.http.delete<void>(`${this.baseUrl}/${saleId}`);
  }
}
