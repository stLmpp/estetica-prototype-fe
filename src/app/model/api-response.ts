import { PaginationMetadata } from '../shared/pagination.model';

export interface ApiResponse<T> {
  data: T;
}

export interface ApiPaginatedResponse<T> {
  data: { items: T[] };
  meta: PaginationMetadata;
}

export interface ApiKeyedResponse<K extends string, T> {
  data: Record<K, T>;
}
