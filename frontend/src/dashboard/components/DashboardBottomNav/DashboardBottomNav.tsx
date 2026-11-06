import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Car, Package, Wrench, Heart, Settings } from 'lucide-react';

import { useActiveProfile } from '@/store/useActiveProfileStore';
import { getSidebarNavItems } from '@/dashboard/config/sidebar.config';
import { InquiriesBadge } from '@/dashboard/components/InquiriesBadge';
import { RentalsBadge } from '@/dashboard/components/RentalsBadge';
import { AppointmentsBadge } from '@/dashboard/components/AppointmentsBadge';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export function DashboardBottomNav() {
  const { t } = useTranslation('dashboard');
  const activeProfile = useActiveProfile();
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');
  const items = getSidebarNavItems(activeProfile, isAdmin);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-1 overflow-x-auto border-t border-border bg-background/95 py-2 backdrop-blur md:hidden"
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
              `flex shrink-0 flex-col items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <Icon size={20} aria-hidden />
            <span className="flex items-center gap-1">
              {t(item.key)}
              {item.key === 'nav.inquiries' && <InquiriesBadge />}
              {item.key === 'nav.rentals' && <RentalsBadge />}
              {item.key === 'nav.appointments' && <AppointmentsBadge />}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
