import { useTranslation } from 'react-i18next';

import { DashboardHeader } from '@/dashboard/components/DashboardHeader/DashboardHeader';
import { StatCard } from '@/dashboard/components/StatCard/StatCard';
import { PerformanceChart } from '@/dashboard/components/PerformanceChart/PerformanceChart';
import { RevenueWidget } from '@/dashboard/components/RevenueWidget/RevenueWidget';
import { ServiceBookingsWidget } from '@/dashboard/components/ServiceBookingsWidget/ServiceBookingsWidget';
import { ActivityFeed } from '@/dashboard/components/ActivityFeed/ActivityFeed';
import { QuickActions } from '@/dashboard/components/QuickActions/QuickActions';
import { useDashboardStats } from '@/dashboard/hooks/useDashboardStats';
import { useDashboardActivity } from '@/dashboard/hooks/useDashboardActivity';
import { useDashboardPerformanceChart } from '@/dashboard/hooks/useDashboardPerformanceChart';
import { useDashboardRevenue } from '@/dashboard/hooks/useDashboardRevenue';
import { useDashboardServiceBookings } from '@/dashboard/hooks/useDashboardServiceBookings';
import { useActiveProfile } from '@/store/useActiveProfileStore';

export function DashboardOverviewPage() {
  const { t } = useTranslation('dashboard');
  const activeProfile = useActiveProfile();

  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { items, isLoading: activityLoading } = useDashboardActivity();
  const { series, isLoading: chartLoading } = useDashboardPerformanceChart();
  const { data: revenueData, isLoading: revenueLoading } = useDashboardRevenue();
  const { data: bookingsData, isLoading: bookingsLoading } =
    useDashboardServiceBookings();

  const showRevenue = activeProfile.type === 'seller' || activeProfile.type === 'service';
  const showServiceBookings = activeProfile.type === 'service';

  return (
    <div className="space-y-8">
      <DashboardHeader
        title={t('overview.title')}
        subtitle={t('overview.subtitle')}
      />

      {/* Stats grid */}
      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} isLoading={statsLoading} />
          ))}
        </div>
      </section>

      {/* Chart + Revenue/Bookings */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PerformanceChart series={series} isLoading={chartLoading} />
        </div>
        <div className="space-y-6">
          {showRevenue && (
            <RevenueWidget data={revenueData} isLoading={revenueLoading} />
          )}
          {showServiceBookings && (
            <ServiceBookingsWidget
              data={bookingsData}
              isLoading={bookingsLoading}
            />
          )}
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
