import { inject, Service } from '@angular/core';
import { AuthClient } from './better-auth.provider';
import { from, map, tap } from 'rxjs';
import { AuthStore } from './auth.store';

@Service()
export class AuthService {
  private readonly client = inject(AuthClient);
  private readonly authStore = inject(AuthStore);

  constructor() {
    this.client.useSession.subscribe((value) => {
      if (value.data) {
        this.authStore.setUserSession({
          session: value.data.session as never,
          user: value.data.user,
        });
      }
    });
  }

  getSession() {
    return from(this.client.getSession()).pipe(
      map((response) => response.data),
      tap((data) => {
        if (data) {
          this.authStore.setUserSession({ session: data.session as never, user: data.user });
        } else {
          this.authStore.reset();
        }
      }),
    );
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
    );
  }
}
