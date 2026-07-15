import { Component, inject, model } from '@angular/core';
import { AuthService } from 'ngx-better-auth';
import { JsonPipe } from '@angular/common';
import { ButtonComponent } from '../../components/button/button.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [JsonPipe, ButtonComponent, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  readonly authService = inject(AuthService);

  username = model('');
  password = model('');

  protected login() {
    this.authService
      .signInEmail({
        email: this.username(),
        password: this.password(),
        rememberMe: true,
      })
      .subscribe();
  }

  protected logout() {
    this.authService.signOut().subscribe();
  }
}
