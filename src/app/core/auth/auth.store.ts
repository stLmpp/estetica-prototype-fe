import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { BetterAuthOrganization, BetterAuthSession, BetterAuthUser } from './better-auth.provider';
import { HasPermissionOptions, hasPermission, OrgRole, toAdminRole } from './has-permission';

export interface AuthStateSession {
  user: BetterAuthUser;
  session: BetterAuthSession;
  activeOrganization?: BetterAuthOrganization;
}

export interface AuthState {
  session: AuthStateSession | null;
  organizations: BetterAuthOrganization[];
  orgRole: OrgRole | null;
}

const initialAuthState: AuthState = {
  session: null,
  organizations: [],
  orgRole: null,
};

function withPreservedActiveOrganization(
  currentSession: AuthStateSession | null,
  nextSession: AuthStateSession,
): AuthStateSession {
  const sameOrganizationStillActive =
    !nextSession.activeOrganization &&
    !!currentSession?.activeOrganization &&
    currentSession.activeOrganization.id === nextSession.session.activeOrganizationId;

  if (!sameOrganizationStillActive) {
    return nextSession;
  }

  return { ...nextSession, activeOrganization: currentSession.activeOrganization };
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>(initialAuthState),
  withComputed(({ session }) => ({
    isLoggedIn: computed(() => !!session()),
  })),
  withMethods((store) => ({
    setUserSession(userSession: AuthStateSession) {
      patchState(store, (state) => ({
        session: withPreservedActiveOrganization(state.session, userSession),
      }));
    },

    setActiveOrganization(organization: BetterAuthOrganization) {
      const session = store.session();
      if (!session) {
        console.warn('Organization cannot be set before user session');
        return;
      }
      patchState(store, { session: { ...session, activeOrganization: organization } });
    },

    setOrganizations(organizations: BetterAuthOrganization[]) {
      patchState(store, { organizations });
    },

    setOrgRole(orgRole: OrgRole | null) {
      patchState(store, { orgRole });
    },

    hasPermission(options: HasPermissionOptions): boolean {
      return hasPermission(options, {
        role: toAdminRole(store.session()?.user.role),
        orgRole: store.orgRole() ?? undefined,
      });
    },

    reset() {
      patchState(store, initialAuthState);
    },
  })),
);
