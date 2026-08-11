export const MaritalStatus = {
  Married: 'Casado(a)',
  Single: 'Solteiro(a)',
  Divorced: 'Divorciado(a)',
  Widowed: 'Viúvo(a)',
} as const;

export type MaritalStatus = (typeof MaritalStatus)[keyof typeof MaritalStatus];
