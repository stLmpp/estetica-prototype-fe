import {
  LucideBuilding,
  LucideHouse,
  LucideLayoutDashboard,
  LucidePackage,
  LucideSettings,
  LucideUser,
  LucideUsers,
} from '@lucide/angular';
import { MenuItem } from './menu-item.model';

export const SIDEBAR_MAIN_MENU_ITEMS: MenuItem[] = [
  {
    title: 'Home',
    link: '/',
    icon: LucideHouse,
    linkActiveOptions: { exact: true },
  },
  {
    title: 'Organizations',
    link: '/organizations',
    icon: LucideBuilding,
  },
  {
    title: 'Catálogo',
    link: '/catalog-items',
    icon: LucidePackage,
    permission: { orgPermissions: { catalogItem: ['get'] } },
  },
  {
    title: 'Clientes',
    link: '/customers',
    icon: LucideUsers,
    permission: { orgPermissions: { customer: ['get'] } },
  },
];

export const SIDEBAR_ACCOUNT_MENU_ITEMS: MenuItem[] = [
  {
    title: 'Profile',
    link: '/profile',
    icon: LucideUser,
  },
  {
    title: 'Settings',
    link: '/settings',
    icon: LucideSettings,
  },
];

export const SIDEBAR_FOOTER_MENU_ITEMS: MenuItem[] = [
  {
    title: 'Design System',
    link: '/ds',
    icon: LucideLayoutDashboard,
  },
];
