import { LucideIconInput } from '@lucide/angular';
import { RouterLinkActive } from '@angular/router';
import { HasPermissionOptions } from '../auth/has-permission';

export interface MenuItem {
  title: string;
  link: string;
  icon: LucideIconInput;
  linkActiveOptions?: RouterLinkActive['routerLinkActiveOptions'];
  /** Omit to show the item to every authenticated user. */
  permission?: HasPermissionOptions;
}
