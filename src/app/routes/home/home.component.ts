import { Component, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { AuthStore } from '../../core/auth/auth.store';

@Component({
  selector: 'app-home',
  imports: [JsonPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  protected readonly authStore = inject(AuthStore);
}
