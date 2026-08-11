import {
  defaultStatements,
  ownerAc,
  adminAc,
  memberAc,
} from 'better-auth/plugins/organization/access';
import { createAccessControl } from 'better-auth/plugins/access';

/**
 * Mirrors the backend's `organization-access-control.ts` 1:1 (same resources/actions/roles).
 * Duplicated rather than shared because the FE and API are separate repos/deployments;
 * keep the two in sync by hand when either one changes.
 */
const statement = {
  ...defaultStatements,
  catalogItem: ['get', 'create', 'update', 'delete'],
  person: ['get', 'create', 'update'],
  customer: ['get', 'create', 'update'],
} as const;

const ac = createAccessControl(statement);

const owner = ac.newRole({
  catalogItem: ['get', 'create', 'update', 'delete'],
  person: ['get', 'create', 'update'],
  customer: ['get', 'create', 'update'],
  ...ownerAc.statements,
});

const admin = ac.newRole({
  catalogItem: ['get', 'create', 'update', 'delete'],
  person: ['get', 'create', 'update'],
  customer: ['get', 'create', 'update'],
  ...adminAc.statements,
});

const member = ac.newRole({
  catalogItem: ['get'],
  person: ['get'],
  customer: ['get'],
  ...memberAc.statements,
});

export const organizationAccessControl = {
  owner,
  admin,
  member,
  ac,
};
