export const SaleTransactionType = {
  Payment: 'Pagamento',
  Refund: 'Estorno',
} as const;

export type SaleTransactionType = (typeof SaleTransactionType)[keyof typeof SaleTransactionType];
