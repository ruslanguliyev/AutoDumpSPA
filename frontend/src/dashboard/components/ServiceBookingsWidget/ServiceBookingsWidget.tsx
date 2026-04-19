import { useTranslation } from 'react-i18next';

import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import type { ServiceBookingsData } from '@/dashboard/types/dashboard.types';

type ServiceBookingsWidgetProps = {
  data: ServiceBookingsData;
  isLoading?: boolean;
};

function ServiceBookingsWidgetSkeleton() {
  return (
    <CardWrapper className="p-6">
      <div className="h-5 w-36 animate-pulse rounded bg-muted" />
      <div className="mt-4 flex gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 flex-1 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </CardWrapper>
  );
}

export function ServiceBookingsWidget({ data, isLoading }: ServiceBookingsWidgetProps) {
  const { t } = useTranslation('dashboard');

  if (isLoading) return <ServiceBookingsWidgetSkeleton />;

  const items = [
    { key: 'upcoming', value: data.upcoming, labelKey: 'serviceBookings.upcoming' },
    { key: 'completed', value: data.completed, labelKey: 'serviceBookings.completed' },
    { key: 'cancelled', value: data.cancelled, labelKey: 'serviceBookings.cancelled' },
  ];

  return (
    <CardWrapper className="p-6">
      <h3 className="text-base font-semibold text-foreground">
        {t('serviceBookings.title')}
      </h3>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.key}
            className="rounded-xl border border-border bg-muted/30 p-4 text-center"
          >
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              {item.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{t(item.labelKey)}</p>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}
