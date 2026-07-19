import { Component, inject } from '@angular/core';
import { AuthQuery } from '../../core/better-auth/auth.query';
import { OrganizationService } from '../../core/better-auth/organization.service';
import { BetterAuthOrganization } from '../../core/better-auth/better-auth.provider';

@Component({
  selector: 'app-activeOrganization',
  imports: [],
  templateUrl: './organizations.component.html',
  styleUrl: './organizations.component.css',
})
export class OrganizationsComponent {
  private readonly authQuery = inject(AuthQuery);
  private readonly organizationService = inject(OrganizationService);

  readonly organizations = this.authQuery.organizations;

  protected selectOrganization(organization: BetterAuthOrganization) {
    this.organizationService.setActive(organization).subscribe();
  }
}
