import { PaginationMetadata } from '../../shared/pagination.model';
import { AnamnesisForm } from './anamnesis-form.model';

export interface AnamnesisFormPayload {
  name: string;
  description?: string | null;
  active: boolean;
  displayOrder: number;
}

export interface ListAnamnesisFormFilter {
  page?: number;
  limit?: 10 | 25 | 50 | 100;
  name?: string;
  active?: boolean;
}

export interface ListAnamnesisFormResult {
  items: AnamnesisForm[];
  meta: PaginationMetadata;
}
