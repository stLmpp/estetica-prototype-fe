import { PaginationMetadata } from '../../shared/pagination.model';
import { CatalogItemType } from './catalog-item-type.enum';
import { CatalogItem } from './catalog-item.model';

export interface CatalogItemPayload {
  name: string;
  itemType: CatalogItemType;
  defaultPrice?: string | null;
  defaultDuration?: string | null;
  active: boolean;
}

export interface ListCatalogItemFilter {
  page?: number;
  limit?: 10 | 25 | 50 | 100;
  name?: string;
  itemType?: CatalogItemType;
  active?: boolean;
  hasEmployees?: boolean;
}

export interface ListCatalogItemResult {
  items: CatalogItem[];
  meta: PaginationMetadata;
}
