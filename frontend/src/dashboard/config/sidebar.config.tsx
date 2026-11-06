import { LayoutDashboard, Car, Package, Wrench, Heart, MessageSquare, Settings, ShieldCheck, CalendarDays, CalendarCheck, BadgeCheck } from 'lucide-react';
import type { ComponentType } from 'react';
import type { ActiveProfile } from '@/dashboard/types/dashboard.types';

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
  { key: 'nav.favorites', path: '/dashboard/favorites', icon: Heart },
  { key: 'nav.settings', path: '/dashboard/settings', icon: Settings },
];

const adminItems: NavItem[] = [
  { key: 'nav.moderation', path: '/dashboard/moderation', icon: ShieldCheck },
];

export function getSidebarNavItems(_profile: ActiveProfile, isAdmin = false): NavItem[] {
  if (!isAdmin) return allItems;
  // Moderation goes right before Settings.
  const settings = allItems[allItems.length - 1];
  return [...allItems.slice(0, -1), ...adminItems, settings];
}
