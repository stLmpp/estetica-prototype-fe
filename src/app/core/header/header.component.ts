import {
  afterNextRender,
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
  Renderer2,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthQuery } from '../better-auth/auth.query';
import { AuthService } from '../better-auth/auth.service';
import { IconButtonComponent } from '../../components/icon-button/icon-button.component';
import { LucideLogOut, LucideMoon, LucideSun } from '@lucide/angular';
import { switchMap } from 'rxjs';
import { ButtonComponent } from '../../components/button/button.component';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { safe } from '../../shared/safe';
import { SsrCookieService } from 'ngx-cookie-service-ssr';

@Component({
  selector: 'app-header',
  imports: [IconButtonComponent, ButtonComponent, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  constructor() {
    const platformId = inject(PLATFORM_ID);
    const isBrowser = isPlatformBrowser(platformId);
    const isServer = isPlatformServer(platformId);

    if (isServer) {
      this.theme.set(this.cookieService.get('theme') === 'dark' ? 'dark' : 'light');
    }

    afterNextRender(() => {
      const isDark = document.documentElement.classList.contains('dark');
      this.theme.set(isDark ? 'dark' : 'light');
    });
    effect(() => {
      if (isBrowser) {
        safe(() => {
          localStorage.setItem('theme', this.theme());
        });
        this.cookieService.set('theme', this.theme());
      }
    });
  }

  private readonly authQuery = inject(AuthQuery);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly renderer = inject(Renderer2);
  private readonly cookieService = inject(SsrCookieService);

  protected readonly theme = signal<'dark' | 'light'>('dark');

  protected readonly user = computed(() => this.authQuery.session()?.user);
  protected readonly organization = computed(() => this.authQuery.session()?.activeOrganization);
  protected readonly isLoggedIn = this.authQuery.isLoggedIn;

  protected logout() {
    this.authService
      .signOut()
      .pipe(switchMap(() => this.router.navigate(['/login'])))
      .subscribe();
  }

  protected changeTheme() {
    this.renderer.removeClass(document.documentElement, this.theme());
    this.theme.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
    this.renderer.addClass(document.documentElement, this.theme());
  }

  protected readonly LucideLogOut = LucideLogOut;
  protected readonly LucideMoon = LucideMoon;
  protected readonly LucideSun = LucideSun;
}
