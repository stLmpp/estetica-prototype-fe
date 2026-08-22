import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { httpParamsFromObject } from '../../shared/http-params-from-object';
import { ApiPaginatedResponse } from '../../model/api-response';
import {
  AnamnesisFormPayload,
  ListAnamnesisFormFilter,
  ListAnamnesisFormResult,
} from './anamnesis-form.dto';
import { AnamnesisForm } from './anamnesis-form.model';

interface AnamnesisFormResponse {
  data: { anamnesisForm: AnamnesisForm };
}

@Service()
export class AnamnesisFormService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api}/v1/anamnesis-form`;

  list(filter: ListAnamnesisFormFilter = {}) {
    const params = httpParamsFromObject({
      page: filter.page,
      limit: filter.limit,
      name: filter.name,
      active: filter.active,
    });
    return this.http.get<ApiPaginatedResponse<AnamnesisForm>>(this.baseUrl, { params }).pipe(
      map((response): ListAnamnesisFormResult => ({
        items: response.data.items,
        meta: response.meta,
      })),
    );
  }

  getById(anamnesisFormId: string) {
    return this.http
      .get<AnamnesisFormResponse>(`${this.baseUrl}/${anamnesisFormId}`)
      .pipe(map((response) => response.data.anamnesisForm));
  }

  create(payload: AnamnesisFormPayload) {
    return this.http
      .post<AnamnesisFormResponse>(this.baseUrl, { anamnesisForm: payload })
      .pipe(map((response) => response.data.anamnesisForm));
  }

  update(anamnesisFormId: string, payload: Partial<AnamnesisFormPayload>) {
    return this.http.patch<void>(`${this.baseUrl}/${anamnesisFormId}`, { anamnesisForm: payload });
  }

  delete(anamnesisFormId: string) {
    return this.http.delete<void>(`${this.baseUrl}/${anamnesisFormId}`);
  }
}
