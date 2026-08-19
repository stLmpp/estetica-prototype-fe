import { Component, computed, inject } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { AuthStore } from '../auth/auth.store';
import { IconButtonComponent } from '../../components/icon-button/icon-button.component';
import { MenuItem } from './menu-item.model';
import {
  SIDEBAR_ACCOUNT_MENU_ITEMS,
  SIDEBAR_FOOTER_MENU_ITEMS,
  SIDEBAR_MAIN_MENU_ITEMS,
} from './sidebar-menu-items';
import { SidebarMenuItemComponent } from './sidebar-menu-item/sidebar-menu-item.component';
import { SidebarService } from './sidebar.service';

@Component({
  selector: 'app-sidebar',
  imports: [IconButtonComponent, SidebarMenuItemComponent],
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
  private readonly authStore = inject(AuthStore);
  protected readonly sidebarService = inject(SidebarService);
  protected readonly isOpen = this.sidebarService.isOpen;

  protected readonly LucideX = LucideX;

  protected readonly mainMenuItems = computed(() =>
    this.filterByPermission(SIDEBAR_MAIN_MENU_ITEMS),
  );
  protected readonly accountMenuItems = computed(() =>
    this.filterByPermission(SIDEBAR_ACCOUNT_MENU_ITEMS),
  );
  protected readonly footerMenuItems = computed(() =>
    this.filterByPermission(SIDEBAR_FOOTER_MENU_ITEMS),
  );

  protected close() {
    this.sidebarService.close();
  }

  private filterByPermission(items: MenuItem[]): MenuItem[] {
    return items.filter(
      (item) => !item.permission || this.authStore.hasPermission(item.permission),
    );
  }
}
