import { adminAc, defaultStatements, userAc } from 'better-auth/plugins/admin/access';
import { createAccessControl } from 'better-auth/plugins/access';

/**
 * Mirrors the backend's `admin-access-control.ts` 1:1 (same resources/actions/roles).
 * Duplicated rather than shared because the FE and API are separate repos/deployments;
 * keep the two in sync by hand when either one changes.
 */
const statement = {
  ...defaultStatements,
  config: ['get', 'publish'],
} as const;

const ac = createAccessControl(statement);

const admin = ac.newRole({
  config: ['get', 'publish'],
  ...adminAc.statements,
});

const user = ac.newRole({
  config: ['get'],
  ...userAc.statements,
});

export const adminAccessControl = {
  admin,
  user,
  ac,
};
