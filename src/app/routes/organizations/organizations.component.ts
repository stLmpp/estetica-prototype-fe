import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuthQuery } from '../../core/better-auth/auth.query';
import { OrganizationService } from '../../core/better-auth/organization.service';
import { BetterAuthOrganization } from '../../core/better-auth/better-auth.provider';
import { Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-organizations',
  imports: [],
  templateUrl: './organizations.component.html',
  styleUrl: './organizations.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex min-h-screen items-center justify-center bg-neutral-50 p-4 dark:bg-neutral-900',
  },
})
export class OrganizationsComponent {
  private readonly authQuery = inject(AuthQuery);
  private readonly organizationService = inject(OrganizationService);
  private readonly router = inject(Router);

  readonly organizations = this.authQuery.organizations;
  readonly activeOrganization = computed(() => this.authQuery.session()?.activeOrganization);

  protected selectOrganization(organization: BetterAuthOrganization) {
    const setActive$: Observable<unknown> =
      organization.id === this.activeOrganization()?.id
        ? of(null)
        : this.organizationService.setActive(organization);

    setActive$.pipe(switchMap(() => this.router.navigate(['/']))).subscribe();
  }
}
