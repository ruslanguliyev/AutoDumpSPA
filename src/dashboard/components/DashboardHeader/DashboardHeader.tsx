import { useTranslation } from 'react-i18next';

import { ProfileSwitcher } from '@/dashboard/components/ProfileSwitcher/ProfileSwitcher';

type DashboardHeaderProps = {
  title?: string;
  subtitle?: string;
};

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { t } = useTranslation('dashboard');

  return (
    <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {title ?? t('header.title')}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <ProfileSwitcher />
      </div>
    </header>
  );
}
