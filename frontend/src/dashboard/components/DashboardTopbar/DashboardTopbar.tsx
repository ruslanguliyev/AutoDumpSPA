import { useTranslation } from 'react-i18next';
import { Moon, Sun } from 'lucide-react';

import { ProfileSwitcher } from '@/dashboard/components/ProfileSwitcher/ProfileSwitcher';
import { useThemeStore } from '@/shared/store/theme';

export function DashboardTopbar() {
  const { t } = useTranslation('dashboard');
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <span className="text-sm font-medium text-muted-foreground lg:hidden">AutoDump</span>

      <div className="flex items-center gap-2">
        <ProfileSwitcher />
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={theme === 'dark' ? t('topbar.lightMode') : t('topbar.darkMode')}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
