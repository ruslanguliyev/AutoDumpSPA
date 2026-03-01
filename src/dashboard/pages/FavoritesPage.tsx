import { useTranslation } from 'react-i18next';

import { DashboardHeader } from '@/dashboard/components/DashboardHeader/DashboardHeader';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';

export function FavoritesPage() {
  const { t } = useTranslation('dashboard');

  return (
    <div className="space-y-8">
      <DashboardHeader
        title={t('favorites.title')}
        subtitle={t('favorites.subtitle')}
      />

      <CardWrapper className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">{t('favorites.empty')}</p>
      </CardWrapper>
    </div>
  );
}
