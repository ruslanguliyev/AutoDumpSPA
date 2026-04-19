import { LayoutDashboard, Car, Package, Wrench, Heart, Settings } from 'lucide-react';
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
  { key: 'nav.favorites', path: '/dashboard/favorites', icon: Heart },
  { key: 'nav.settings', path: '/dashboard/settings', icon: Settings },
];

export function getSidebarNavItems(profile: ActiveProfile): NavItem[] {
  return allItems;
}
