export const CatalogItemType = {
  Product: 'Produto',
  Service: 'Serviço',
} as const;

export type CatalogItemType = (typeof CatalogItemType)[keyof typeof CatalogItemType];
