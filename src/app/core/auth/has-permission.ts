import { type RequireExactlyOne } from 'type-fest';
import { adminAccessControl } from './admin-access-control';
import { organizationAccessControl } from './organization-access-control';

/**
 * Like better-auth's `RoleStatements`, but resolves each resource to a plain mutable array
 * instead of `T[number][] | ReadonlyArray<T[number]>` — mirrors the backend's
 * `has-permission.decorator.ts` so a typo'd resource/action fails at compile time here too.
 */
type PermissionCheck<TStatements extends Record<string, readonly string[]>> = {
  [K in keyof TStatements]?: TStatements[K][number][];
};

export type AdminPermissionCheck = PermissionCheck<typeof adminAccessControl.ac.statements>;
export type OrgPermissionCheck = PermissionCheck<typeof organizationAccessControl.ac.statements>;

export type AdminRole = keyof Omit<typeof adminAccessControl, 'ac'>;
export type OrgRole = keyof Omit<typeof organizationAccessControl, 'ac'>;

export interface BaseHasPermission {
  permissions?: AdminPermissionCheck;
  orgPermissions?: OrgPermissionCheck;
  roles?: AdminRole[];
  orgRoles?: OrgRole[];
  withoutImplicitAdminAccess?: boolean;
}

export type HasPermissionOptions = RequireExactlyOne<
  BaseHasPermission & {
    or?: RequireExactlyOne<BaseHasPermission>[];
    and?: RequireExactlyOne<BaseHasPermission>[];
  }
>;

export interface PermissionContext {
  role: AdminRole | undefined;
  orgRole: OrgRole | undefined;
}

function isKnownRole<T extends Record<string, unknown>>(
  registry: T,
  role: string | null | undefined,
): role is Extract<keyof T, string> {
  return !!role && role !== 'ac' && role in registry;
}

export function toAdminRole(role: string | null | undefined): AdminRole | undefined {
  return isKnownRole(adminAccessControl, role) ? (role as AdminRole) : undefined;
}

export function toOrgRole(role: string | null | undefined): OrgRole | undefined {
  return isKnownRole(organizationAccessControl, role) ? (role as OrgRole) : undefined;
}

function checkBase(options: BaseHasPermission, context: PermissionContext): boolean {
  if (options.roles) {
    return !!context.role && options.roles.includes(context.role);
  }

  if (options.orgRoles) {
    return !!context.orgRole && options.orgRoles.includes(context.orgRole);
  }

  if (options.permissions) {
    return !!context.role && adminAccessControl[context.role].authorize(options.permissions).success;
  }

  if (options.orgPermissions) {
    return (
      !!context.orgRole &&
      organizationAccessControl[context.orgRole].authorize(options.orgPermissions).success
    );
  }

  return false;
}

export function hasPermission(options: HasPermissionOptions, context: PermissionContext): boolean {
  if (!options.withoutImplicitAdminAccess && context.role === 'admin') {
    return true;
  }

  if (options.or) {
    return options.or.some((check) => checkBase(check, context));
  }

  if (options.and) {
    return options.and.every((check) => checkBase(check, context));
  }

  return checkBase(options, context);
}
