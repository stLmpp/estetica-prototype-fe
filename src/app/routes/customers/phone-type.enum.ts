export const PhoneType = {
  Mobile: 'Celular',
  Home: 'Residencial',
  Work: 'Trabalho',
} as const;

export type PhoneType = (typeof PhoneType)[keyof typeof PhoneType];
