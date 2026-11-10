import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import clsx from 'clsx';

import { useActiveProfile } from '@/store/useActiveProfileStore';
import { useDashboardUIStore } from '@/dashboard/store/useDashboardUIStore';
import { getSidebarNavItems } from '@/dashboard/config/sidebar.config';
import { InquiriesBadge } from '@/dashboard/components/InquiriesBadge';
import { RentalsBadge } from '@/dashboard/components/RentalsBadge';
import { AppointmentsBadge } from '@/dashboard/components/AppointmentsBadge';
import { BackToSiteLink, BrandHomeLink } from '@/dashboard/components/BackToSiteLink/BackToSiteLink';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export function DashboardSidebar() {
  const { t } = useTranslation('dashboard');
  const activeProfile = useActiveProfile();
  const { sidebarCollapsed, toggleSidebar } = useDashboardUIStore();
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');
  const items = getSidebarNavItems(activeProfile, isAdmin);

  return (
    <aside
      className={clsx(
        'flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out',
        'fixed left-0 top-0 z-sidebar h-screen',
        sidebarCollapsed ? 'w-[72px]' : 'w-[260px]',
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
        {!sidebarCollapsed ? (
          <BrandHomeLink className="px-1 text-sidebar-foreground" />
        ) : null}
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={sidebarCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
        >
          {sidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3" aria-label="Dashboard navigation">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/dashboard'}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                      sidebarCollapsed && 'justify-center px-2',
                    )
                  }
                >
                  <Icon size={20} className="shrink-0" aria-hidden />
                  {!sidebarCollapsed && <span>{t(item.key)}</span>}
                  {!sidebarCollapsed && item.key === 'nav.inquiries' && <InquiriesBadge />}
                  {!sidebarCollapsed && item.key === 'nav.rentals' && <RentalsBadge />}
                  {!sidebarCollapsed && item.key === 'nav.appointments' && <AppointmentsBadge />}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <BackToSiteLink
          surface="sidebar"
          iconOnly={sidebarCollapsed}
          className={clsx('w-full', sidebarCollapsed ? 'px-0' : 'justify-start')}
        />
      </div>
    </aside>
  );
}
