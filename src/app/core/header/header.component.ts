import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthQuery } from '../better-auth/auth.query';
import { AuthService } from '../better-auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private readonly authQuery = inject(AuthQuery);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = computed(() => this.authQuery.session()?.user);
  protected readonly organization = computed(() => this.authQuery.session()?.activeOrganization);
  protected readonly isLoggedIn = this.authQuery.isLoggedIn;

  protected logout() {
    this.authService.signOut().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
    });
  }
}
