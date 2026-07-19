import { Component, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { ButtonComponent } from '../../components/button/button.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { AuthService } from '../../core/better-auth/auth.service';
import { AuthQuery } from '../../core/better-auth/auth.query';

@Component({
  selector: 'app-home',
  imports: [JsonPipe, ButtonComponent, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly authQuery = inject(AuthQuery);

  protected logout() {
    this.authService
      .signOut()
      .pipe(switchMap(() => this.router.navigate(['/login'])))
      .subscribe();
  }
}
