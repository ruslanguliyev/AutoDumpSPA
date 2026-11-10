import {
  LayoutDashboard,
  Car,
  Package,
  Wrench,
  Heart,
  MessageSquare,
  Settings,
  ShieldCheck,
  CalendarDays,
  CalendarCheck,
  BadgeCheck,
  TrendingUp,
} from 'lucide-react';
import type { ComponentType } from 'react';

import type { ActiveProfile } from '@/dashboard/types/dashboard.types';
import { stripLangPrefix } from '@/dashboard/config/profileScope';

export type NavItem = {
  key: string;
  path: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

const allItems: NavItem[] = [
  { key: 'nav.overview', path: '/dashboard', icon: LayoutDashboard },
  { key: 'nav.vehicles', path: '/dashboard/vehicles', icon: Car },
  { key: 'nav.parts', path: '/dashboard/parts', icon: Package },
  { key: 'nav.services', path: '/dashboard/services', icon: Wrench },
  { key: 'nav.inquiries', path: '/dashboard/inquiries', icon: MessageSquare },
  { key: 'nav.rentals', path: '/dashboard/rentals', icon: CalendarDays },
  { key: 'nav.appointments', path: '/dashboard/appointments', icon: CalendarCheck },
  { key: 'nav.profile', path: '/dashboard/profile', icon: BadgeCheck },
  { key: 'nav.promotions', path: '/dashboard/promotions', icon: TrendingUp },
  { key: 'nav.favorites', path: '/dashboard/favorites', icon: Heart },
  { key: 'nav.settings', path: '/dashboard/settings', icon: Settings },
];

const adminItems: NavItem[] = [{ key: 'nav.moderation', path: '/dashboard/moderation', icon: ShieldCheck }];

/** pages.md has no dashboard map; keys follow existing routes and the profile split. */
const KEYS_BY_TYPE: Record<ActiveProfile['type'], readonly string[]> = {
  user: [
    'nav.overview',
    'nav.vehicles',
    'nav.parts',
    'nav.inquiries',
    'nav.rentals',
    'nav.appointments',
    'nav.favorites',
    'nav.settings',
  ],
  seller: [
    'nav.overview',
    'nav.vehicles',
    'nav.parts',
    'nav.inquiries',
    'nav.rentals',
    'nav.promotions',
    'nav.favorites',
    'nav.settings',
  ],
  service: [
    'nav.overview',
    'nav.services',
    'nav.appointments',
    'nav.profile',
    'nav.inquiries',
    'nav.promotions',
    'nav.settings',
  ],
};

const byKey = new Map(allItems.map((item) => [item.key, item]));

export type SidebarNavContext = {
  isAdmin?: boolean;
  /** Listing promotions live on personal while «Дилер» is hidden from the switcher. */
  hasSeller?: boolean;
};

export function getSidebarNavItems(
  profile: ActiveProfile,
  { isAdmin = false, hasSeller = false }: SidebarNavContext = {},
): NavItem[] {
  const keys = [...KEYS_BY_TYPE[profile.type]];
  if (profile.type === 'user' && hasSeller && !keys.includes('nav.promotions')) {
    const rentalsAt = keys.indexOf('nav.rentals');
    const insertAt = rentalsAt >= 0 ? rentalsAt + 1 : keys.indexOf('nav.settings');
    keys.splice(insertAt >= 0 ? insertAt : keys.length, 0, 'nav.promotions');
  }

  const items = keys
    .map((key) => byKey.get(key))
    .filter((item): item is NavItem => Boolean(item));

  if (!isAdmin) return items;

  const settingsIndex = items.findIndex((item) => item.key === 'nav.settings');
  if (settingsIndex < 0) return [...items, ...adminItems];
  return [...items.slice(0, settingsIndex), ...adminItems, ...items.slice(settingsIndex)];
}

export function isDashboardPathAllowed(pathname: string, items: NavItem[]): boolean {
  const path = stripLangPrefix(pathname).split('?')[0] ?? pathname;
  if (path === '/dashboard' || path === '/dashboard/') return true;
  return items.some((item) => {
    if (item.path === '/dashboard') return false;
    return path === item.path || path.startsWith(`${item.path}/`);
  });
}
