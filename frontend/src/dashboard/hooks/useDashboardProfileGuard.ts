import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { getSidebarNavItems, isDashboardPathAllowed } from '@/dashboard/config/sidebar.config';
import { profileMatches, resolveActiveProfile } from '@/dashboard/config/profileScope';
import { useAvailableProfiles } from '@/dashboard/hooks/useAvailableProfiles';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useLanguageSync } from '@/shared/hooks/useLanguageSync';
import { ROUTES, withLang } from '@/shared/constants/routes';
import { useActiveProfileStore } from '@/store/useActiveProfileStore';

/** Drop a missing seller/service card back to personal, then leave pages the new profile cannot open. */
export function useDashboardProfileGuard() {
  const { options, isLoading } = useAvailableProfiles();
  const { activeProfile, setActiveProfile } = useActiveProfileStore();
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguageSync();

  useEffect(() => {
    if (isLoading) return;
    const next = resolveActiveProfile(
      activeProfile,
      options.map((o) => o.value),
    );
    if (!profileMatches(next, activeProfile)) setActiveProfile(next);
  }, [isLoading, options, activeProfile, setActiveProfile]);

  useEffect(() => {
    if (isLoading) return;
    const nav = getSidebarNavItems(activeProfile, isAdmin);
    if (!isDashboardPathAllowed(location.pathname, nav)) {
      navigate(withLang(ROUTES.dashboard, language), { replace: true });
    }
  }, [isLoading, activeProfile, isAdmin, language, location.pathname, navigate]);
}
