export const SaleStatus = {
  Pending: 'Pendente',
  Paid: 'Pago',
  Cancelled: 'Cancelado',
  Refunded: 'Estornado',
} as const;

export type SaleStatus = (typeof SaleStatus)[keyof typeof SaleStatus];
