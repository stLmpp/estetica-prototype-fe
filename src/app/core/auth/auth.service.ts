import { inject, Service } from '@angular/core';
import { AuthClient } from './better-auth.provider';
import { distinctUntilChanged, filter, from, map, skip, Subject, tap } from 'rxjs';
import { AuthStateSession, AuthStore } from './auth.store';
import { refreshMap } from '../../shared/operators/refresh-map';
import { toOrgRole } from './has-permission';

@Service()
export class AuthService {
  private readonly client = inject(AuthClient);
  private readonly authStore = inject(AuthStore);
  private readonly useSession$ = new Subject<AuthStateSession | null>();
  private readonly useActiveMemberRole$ = new Subject<string | undefined>();

  constructor() {
    this.client.useSession.listen((value) => {
      if (value.isPending) {
        return;
      }
      this.useSession$.next(value.data);
    });
    this.useSession$.pipe(skip(1)).subscribe((data) => {
      const currentSession = this.authStore.session()?.session;
      if (data && data.session.id === currentSession?.id) {
        return;
      }
      this.setUserSession(data);
    });

    this.client.useActiveMemberRole.subscribe((value) => {
      if (value.isPending) {
        return;
      }
      this.useActiveMemberRole$.next(value.data?.role);
    });

    this.useActiveMemberRole$
      .pipe(
        skip(1),
        distinctUntilChanged(),
        filter((role) => {
          const currentRole = this.authStore.orgRole();
          return !!role && currentRole === role;
        }),
      )
      .subscribe((role) => {
        this.setOrgRole(role);
      });
  }

  getSession() {
    return from(this.client.getSession()).pipe(map((response) => response.data));
  }

  setUserSession(session: AuthStateSession | null) {
    if (session) {
      this.authStore.setUserSession(session);
    } else {
      this.authStore.reset();
    }
  }

  setOrgRole(role: string | undefined) {
    this.authStore.setOrgRole(toOrgRole(role) ?? null);
  }

  signOut() {
    return from(this.client.signOut()).pipe(
      tap(() => {
        this.authStore.reset();
      }),
    );
  }

  signInEmail(email: string, password: string, rememberMe: boolean) {
    return from(
      this.client.signIn.email({
        email,
        password,
        rememberMe,
      }),
    ).pipe(
      map((response) => {
        if (!response.data) {
          throw new Error('No data returned from sign in');
        }
        return response.data;
      }),
      refreshMap(() =>
        this.getSession().pipe(
          tap((session) => {
            this.setUserSession(session);
          }),
        ),
      ),
    );
  }
}
