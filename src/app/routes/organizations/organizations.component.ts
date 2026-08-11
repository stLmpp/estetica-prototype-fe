import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuthStore } from '../../core/auth/auth.store';
import { OrganizationService } from '../../core/auth/organization.service';
import { BetterAuthOrganization } from '../../core/auth/better-auth.provider';
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
  private readonly authStore = inject(AuthStore);
  private readonly organizationService = inject(OrganizationService);
  private readonly router = inject(Router);

  readonly organizations = this.authStore.organizations;
  readonly activeOrganization = computed(() => this.authStore.session()?.activeOrganization);

  protected selectOrganization(organization: BetterAuthOrganization) {
    const setActive$: Observable<unknown> =
      organization.id === this.activeOrganization()?.id
        ? of(null)
        : this.organizationService.setActive(organization);

    setActive$.pipe(switchMap(() => this.router.navigate(['/']))).subscribe();
  }
}
