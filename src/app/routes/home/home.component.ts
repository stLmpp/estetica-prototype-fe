import { Component, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { AuthQuery } from '../../core/better-auth/auth.query';

@Component({
  selector: 'app-home',
  imports: [JsonPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  protected readonly authQuery = inject(AuthQuery);
}
