import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../../../components/icon/icon.component';
import { LucideIconInput } from '@lucide/angular';

@Component({
  selector: 'app-sidebar-menu-item',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './sidebar-menu-item.component.html',
  styleUrl: './sidebar-menu-item.component.css',
})
export class SidebarMenuItemComponent {
  readonly title = input.required<string>();
  readonly link = input.required<string>();
  readonly linkActiveOptions = input<RouterLinkActive['routerLinkActiveOptions']>({ exact: false });
  readonly icon = input<LucideIconInput>();
}
