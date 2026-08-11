import { PaginationMetadata } from '../../shared/pagination.model';
import { CatalogItemType } from './catalog-item-type.enum';
import { CatalogItem } from './catalog-item.model';

export interface CatalogItemPayload {
  name: string;
  itemType: CatalogItemType;
  defaultPrice?: string | null;
  active: boolean;
}

export interface ListCatalogItemFilter {
  page?: number;
  limit?: 10 | 25 | 50 | 100;
  name?: string;
}

export interface ListCatalogItemResult {
  items: CatalogItem[];
  meta: PaginationMetadata;
}
