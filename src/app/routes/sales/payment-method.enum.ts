export const PaymentMethod = {
  Cash: 'Dinheiro',
  CreditCard: 'Cartão de Crédito',
  DebitCard: 'Cartão de Débito',
  Pix: 'Pix',
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];
