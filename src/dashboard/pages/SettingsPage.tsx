import { useTranslation } from 'react-i18next';

import { DashboardHeader } from '@/dashboard/components/DashboardHeader/DashboardHeader';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';

export function SettingsPage() {
  const { t } = useTranslation('dashboard');

  return (
    <div className="space-y-8">
      <DashboardHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
      />

      <CardWrapper className="p-6">
        <p className="text-sm text-muted-foreground">{t('settings.content')}</p>
      </CardWrapper>
    </div>
  );
}
