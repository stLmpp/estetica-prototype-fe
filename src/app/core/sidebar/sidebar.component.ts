import { Component, inject } from '@angular/core';
import { SidebarService } from './sidebar.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideBuilding,
  LucideHouse,
  LucideLayoutDashboard,
  LucideSettings,
  LucideUser,
  LucideX,
} from '@lucide/angular';
import { IconButtonComponent } from '../../components/icon-button/icon-button.component';
import { IconComponent } from '../../components/icon/icon.component';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, IconButtonComponent, IconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  host: {
    'animate.enter': 'enter-animation',
    'animate.leave': 'leave-animation',
    class:
      'fixed top-0 left-0 z-50 h-full w-64 transform bg-neutral-50 shadow-lg transition-transform duration-300 ease-in-out dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col',
  },
})
export class SidebarComponent {
  protected readonly sidebarService = inject(SidebarService);
  protected readonly isOpen = this.sidebarService.isOpen;

  protected readonly LucideHouse = LucideHouse;
  protected readonly LucideBuilding = LucideBuilding;
  protected readonly LucideSettings = LucideSettings;
  protected readonly LucideUser = LucideUser;
  protected readonly LucideX = LucideX;
  protected readonly LucideLayoutDashboard = LucideLayoutDashboard;

  protected close() {
    this.sidebarService.close();
  }
}
