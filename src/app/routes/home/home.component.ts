import { Component, inject } from '@angular/core';
import { AuthService } from 'ngx-better-auth';
import { JsonPipe } from '@angular/common';
import { ButtonComponent } from '../../components/button/button.component';

@Component({
  selector: 'app-home',
  imports: [JsonPipe, ButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  readonly authService = inject(AuthService);

  protected login() {
    this.authService
      .signInEmail({
        email: '',
        password: '',
        rememberMe: true,
      })
      .subscribe();
  }

  protected logout() {
    this.authService.signOut().subscribe();
  }
}
