import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { httpParamsFromObject } from '../../shared/http-params-from-object';
import { ApiKeyedResponse } from '../../model/api-response';
import {
  CreateAnamnesisFieldPayload,
  ListAnamnesisFieldFilter,
  UpdateAnamnesisFieldPayload,
} from './anamnesis-field.dto';
import { AnamnesisField } from './anamnesis-field.model';

@Service()
export class AnamnesisFieldService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api}/v1/anamnesis-field`;

  list(filter: ListAnamnesisFieldFilter) {
    const params = httpParamsFromObject({
      anamnesisFormId: filter.anamnesisFormId,
      anamnesisSectionId: filter.anamnesisSectionId,
      active: filter.active,
    });
    return this.http
      .get<ApiKeyedResponse<'anamnesisFields', AnamnesisField[]>>(this.baseUrl, { params })
      .pipe(map((response) => response.data.anamnesisFields));
  }

  getById(anamnesisFieldId: string) {
    return this.http
      .get<ApiKeyedResponse<'anamnesisField', AnamnesisField>>(
        `${this.baseUrl}/${anamnesisFieldId}`,
      )
      .pipe(map((response) => response.data.anamnesisField));
  }

  create(payload: CreateAnamnesisFieldPayload) {
    return this.http
      .post<ApiKeyedResponse<'anamnesisField', AnamnesisField>>(this.baseUrl, {
        anamnesisField: payload,
      })
      .pipe(map((response) => response.data.anamnesisField));
  }

  update(anamnesisFieldId: string, payload: UpdateAnamnesisFieldPayload) {
    return this.http.patch<void>(`${this.baseUrl}/${anamnesisFieldId}`, {
      anamnesisField: payload,
    });
  }

  delete(anamnesisFieldId: string) {
    return this.http.delete<void>(`${this.baseUrl}/${anamnesisFieldId}`);
  }
}
