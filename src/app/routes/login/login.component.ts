import { Component, inject, model, signal } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { AuthService } from '../../core/better-auth/auth.service';
import { OrganizationService } from '../../core/better-auth/organization.service';

@Component({
  selector: 'app-login',
  imports: [ButtonComponent, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly organizationService = inject(OrganizationService);
  private readonly router = inject(Router);

  readonly username = model('');
  readonly password = model('');

  protected login() {
    this.authService
      .signInEmail(this.username(), this.password(), true)
      .pipe(
        switchMap((data) => {
          return this.organizationService
            .list()
            .pipe(map((organizations) => [data, organizations] as const));
        }),
        switchMap(([data, organizations]) => {
          if (!organizations.length || organizations.length > 1) {
            return this.router.navigate(['/organizations']);
          }
          // TODO resolve this, when a organization is set, we do not need to check if there's a active organization
          return this.organizationService
            .setActive(organizations[0]!)
            .pipe(switchMap(() => this.router.navigate(['/'])));
        }),
      )
      .subscribe();
  }
}
