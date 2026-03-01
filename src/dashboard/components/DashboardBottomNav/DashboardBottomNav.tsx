import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Car, Package, Wrench, Heart, Settings } from 'lucide-react';

import { useActiveProfile } from '@/store/useActiveProfileStore';
import { getSidebarNavItems } from '@/dashboard/config/sidebar.config';

export function DashboardBottomNav() {
  const { t } = useTranslation('dashboard');
  const activeProfile = useActiveProfile();
  const items = getSidebarNavItems(activeProfile);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-background/95 py-2 backdrop-blur md:hidden"
      aria-label="Mobile navigation"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <Icon size={20} aria-hidden />
            <span>{t(item.key)}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
