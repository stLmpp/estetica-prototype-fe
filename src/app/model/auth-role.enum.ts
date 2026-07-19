export const AuthRole = {
  Admin: 'admin',
  User: 'user',
} as const;

export type AuthRole = (typeof AuthRole)[keyof typeof AuthRole];
