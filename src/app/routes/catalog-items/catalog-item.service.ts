import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { httpParamsFromObject } from '../../shared/http-params-from-object';
import { ApiPaginatedResponse } from '../../model/api-response';
import {
  CatalogItemPayload,
  ListCatalogItemFilter,
  ListCatalogItemResult,
} from './catalog-item.dto';
import { CatalogItem } from './catalog-item.model';

interface CatalogItemResponse {
  data: { catalogItem: CatalogItem };
}

@Service()
export class CatalogItemService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api}/v1/catalog-item`;

  list(filter: ListCatalogItemFilter = {}) {
    const params = httpParamsFromObject({
      page: filter.page,
      limit: filter.limit,
      name: filter.name,
      itemType: filter.itemType,
      active: filter.active,
      hasEmployees: filter.hasEmployees,
    });
    return this.http.get<ApiPaginatedResponse<CatalogItem>>(this.baseUrl, { params }).pipe(
      map((response): ListCatalogItemResult => ({
        items: response.data.items,
        meta: response.meta,
      })),
    );
  }

  create(payload: CatalogItemPayload) {
    return this.http
      .post<CatalogItemResponse>(this.baseUrl, { catalogItem: payload })
      .pipe(map((response) => response.data.catalogItem));
  }

  update(catalogItemId: string, payload: Partial<CatalogItemPayload>) {
    return this.http.patch<void>(`${this.baseUrl}/${catalogItemId}`, { catalogItem: payload });
  }

  delete(catalogItemId: string) {
    return this.http.delete<void>(`${this.baseUrl}/${catalogItemId}`);
  }
}
