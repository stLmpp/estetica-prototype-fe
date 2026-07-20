import { inject, Service } from '@angular/core';
import { AuthClient, BetterAuthOrganization } from './better-auth.provider';
import { from, map, tap } from 'rxjs';
import { AuthStore } from './auth.store';

@Service()
export class OrganizationService {
  private readonly client = inject(AuthClient);
  private readonly authStore = inject(AuthStore);

  list() {
    return from(this.client.organization.list()).pipe(
      map((response) => response.data ?? []),
      tap((organizations) => {
        this.authStore.setOrganizations(organizations);
      }),
    );
  }

  getOrganization(organizationId: string) {
    return from(
      this.client.organization.getFullOrganization({
        query: {
          organizationId,
        },
      }),
    ).pipe(map((response) => response.data));
  }

  setActive(organization: BetterAuthOrganization) {
    return from(
      this.client.organization.setActive({
        organizationId: organization.id,
      }),
    ).pipe(
      tap(() => {
        this.authStore.setActiveOrganization(organization);
      }),
    );
  }
}
