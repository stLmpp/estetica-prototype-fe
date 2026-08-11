import { CatalogItemType } from './catalog-item-type.enum';

export interface CatalogItem {
  id: string;
  name: string;
  itemType: CatalogItemType;
  defaultPrice?: string | null;
  active: boolean;
}
