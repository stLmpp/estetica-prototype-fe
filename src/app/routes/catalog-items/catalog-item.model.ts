export const CatalogItemType = {
  Product: 'Produto',
  Service: 'Serviço',
} as const;

export type CatalogItemType = (typeof CatalogItemType)[keyof typeof CatalogItemType];

export interface CatalogItem {
  id: string;
  name: string;
  itemType: CatalogItemType;
  defaultPrice?: string;
  active: boolean;
}

export interface CatalogItemPayload {
  name: string;
  itemType: CatalogItemType;
  defaultPrice?: string;
  active: boolean;
}

export interface ListCatalogItemFilter {
  page?: number;
  limit?: 10 | 25 | 50 | 100;
  name?: string;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
}

export interface ListCatalogItemResult {
  items: CatalogItem[];
  meta: PaginationMetadata;
}
