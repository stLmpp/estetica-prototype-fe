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
  customer: ['get', 'create', 'update', 'delete'],
  employee: ['get', 'create', 'update', 'delete'],
  employeeService: ['get', 'create', 'delete'],
  appointment: ['get', 'create', 'update', 'updateStatus', 'delete'],
  sale: ['get', 'create', 'addTransaction', 'updateStatus', 'delete'],
  anamnesisField: ['get', 'create', 'update', 'delete'],
  customerAnamnesis: ['get', 'create', 'update', 'finalize', 'delete'],
} as const;

const ac = createAccessControl(statement);

const owner = ac.newRole({
  catalogItem: ['get', 'create', 'update', 'delete'],
  person: ['get', 'create', 'update'],
  customer: ['get', 'create', 'update', 'delete'],
  employee: ['get', 'create', 'update', 'delete'],
  employeeService: ['get', 'create', 'delete'],
  appointment: ['get', 'create', 'update', 'updateStatus', 'delete'],
  sale: ['get', 'create', 'addTransaction', 'updateStatus', 'delete'],
  anamnesisField: ['get', 'create', 'update', 'delete'],
  customerAnamnesis: ['get', 'create', 'update', 'finalize', 'delete'],
  ...ownerAc.statements,
});

const admin = ac.newRole({
  catalogItem: ['get', 'create', 'update', 'delete'],
  person: ['get', 'create', 'update'],
  customer: ['get', 'create', 'update', 'delete'],
  employee: ['get'],
  employeeService: ['get', 'create', 'delete'],
  appointment: ['get', 'create', 'update', 'updateStatus', 'delete'],
  sale: ['get', 'create', 'addTransaction', 'updateStatus', 'delete'],
  anamnesisField: ['get', 'create', 'update', 'delete'],
  customerAnamnesis: ['get', 'create', 'update', 'finalize', 'delete'],
  ...adminAc.statements,
});

const member = ac.newRole({
  catalogItem: ['get'],
  person: ['get'],
  customer: ['get'],
  employee: ['get'],
  employeeService: ['get'],
  appointment: ['get', 'create', 'update', 'updateStatus'],
  sale: ['get'],
  anamnesisField: ['get'],
  customerAnamnesis: ['get', 'create', 'update', 'finalize'],
  ...memberAc.statements,
});

export const organizationAccessControl = {
  owner,
  admin,
  member,
  ac,
};
