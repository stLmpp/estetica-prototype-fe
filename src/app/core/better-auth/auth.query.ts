import { computed, inject, Service } from '@angular/core';
import { AuthStore } from './auth.store';
import { toSignal } from '@angular/core/rxjs-interop';

@Service()
export class AuthQuery {
  private readonly authStore = inject(AuthStore);

  readonly state$ = this.authStore.state$;

  readonly state = toSignal(this.state$, { initialValue: AuthStore.defaultState });
  readonly session = computed(() => this.state().session);

  readonly isLoggedIn = computed(() => !!this.session());

  readonly organizations = computed(() => this.state().organizations);
}
