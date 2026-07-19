export const AuthOrgRole = {
  Owner: 'owner',
  Admin: 'admin',
  User: 'user',
} as const;

export type AuthOrgRole = (typeof AuthOrgRole)[keyof typeof AuthOrgRole];
