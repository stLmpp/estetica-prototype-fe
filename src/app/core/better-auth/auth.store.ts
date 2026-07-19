import { Service } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from 'better-auth/client';
import { BetterAuthOrganization, BetterAuthSession } from './better-auth.provider';

export interface AuthStateSession {
  user: User;
  session: BetterAuthSession;
  activeOrganization?: BetterAuthOrganization;
}

export interface AuthState {
  session?: AuthStateSession;
  organizations: BetterAuthOrganization[];
}

@Service()
export class AuthStore {
  static readonly defaultState: AuthState = {
    organizations: [],
  };

  readonly #state$ = new BehaviorSubject<AuthState>(AuthStore.defaultState);

  readonly state$ = this.#state$.asObservable();

  private update(updater: (state: AuthState) => Partial<AuthState>) {
    const state = this.#state$.value;
    this.#state$.next({
      ...state,
      ...updater(state),
    });
  }

  setUserSession(userSession: Pick<AuthStateSession, 'user' | 'session'>) {
    this.update((state) => {
      const partialState: Partial<AuthState> = {
        session: userSession,
      };
      if (
        state.session?.activeOrganization &&
        userSession.session.session &&
        state.session?.activeOrganization?.id === userSession.session.session?.activeOrganizationId
      ) {
        partialState.session!.activeOrganization = state.session.activeOrganization;
      }
      return partialState;
    });
  }

  setActiveOrganization(organization: BetterAuthOrganization) {
    this.update((state) => {
      if (!state.session) {
        console.warn('Organization cannot be set before user session');
        return {};
      }
      return {
        session: { ...state.session, activeOrganization: organization },
      };
    });
  }

  setOrganizations(organizations: BetterAuthOrganization[]) {
    this.update(() => ({ organizations }));
  }

  reset() {
    this.#state$.next(AuthStore.defaultState);
  }
}
