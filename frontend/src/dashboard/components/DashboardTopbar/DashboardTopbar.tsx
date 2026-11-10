import { useTranslation } from 'react-i18next';
import { Moon, Sun } from 'lucide-react';

import { BackToSiteLink, BrandHomeLink } from '@/dashboard/components/BackToSiteLink/BackToSiteLink';
import { ProfileSwitcher } from '@/dashboard/components/ProfileSwitcher/ProfileSwitcher';
import { useThemeStore } from '@/shared/store/theme';

export function DashboardTopbar() {
  const { t } = useTranslation('dashboard');
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <BrandHomeLink className="px-1 font-medium text-foreground md:hidden" />

      <div className="ml-auto flex items-center gap-2">
        <BackToSiteLink surface="topbar" className="max-sm:min-w-11 max-sm:px-0 max-sm:[&>span]:hidden" />
        <ProfileSwitcher />
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={theme === 'dark' ? t('topbar.lightMode') : t('topbar.darkMode')}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
