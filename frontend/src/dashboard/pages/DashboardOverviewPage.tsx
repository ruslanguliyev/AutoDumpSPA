import { useTranslation } from 'react-i18next';

import { DashboardHeader } from '@/dashboard/components/DashboardHeader/DashboardHeader';
import { StatCard } from '@/dashboard/components/StatCard/StatCard';
import { ActivityFeed } from '@/dashboard/components/ActivityFeed/ActivityFeed';
import { QuickActions } from '@/dashboard/components/QuickActions/QuickActions';
import { useDashboardStats } from '@/dashboard/hooks/useDashboardStats';
import { useDashboardActivity } from '@/dashboard/hooks/useDashboardActivity';

export function DashboardOverviewPage() {
  const { t } = useTranslation('dashboard');

  const { stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { items, isLoading: activityLoading } = useDashboardActivity();

  return (
    <div className="space-y-8">
      <DashboardHeader
        title={t('overview.title')}
        subtitle={t('overview.subtitle')}
      />

      {/* Stats grid */}
      <section>
        {statsError ? (
          <p className="mb-4 text-sm text-destructive">{t('overview.statsError')}</p>
        ) : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} isLoading={statsLoading} />
          ))}
        </div>
      </section>

      {/* Activity + Quick Actions */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed items={items} isLoading={activityLoading} />
        </div>
        <div>
          <QuickActions />
        </div>
      </section>
    </div>
  );
}
