import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgProgressbar } from 'ngx-progressbar';
import { NgProgressRouter } from 'ngx-progressbar/router';
import { HeaderComponent } from './core/header/header.component';
import { SidebarComponent } from './core/sidebar/sidebar.component';
import { SidebarService } from './core/sidebar/sidebar.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgProgressbar, NgProgressRouter, HeaderComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly sidebarService = inject(SidebarService);
}
