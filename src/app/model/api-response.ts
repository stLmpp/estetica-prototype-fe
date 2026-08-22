import { PaginationMetadata } from '../shared/pagination.model';

export interface ApiResponse<T> {
  data: T;
}

export interface ApiPaginatedResponse<T> {
  data: { items: T[] };
  meta: PaginationMetadata;
}
