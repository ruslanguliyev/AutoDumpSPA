import { useTranslation } from 'react-i18next';

import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import type { RevenueData } from '@/dashboard/types/dashboard.types';

type RevenueWidgetProps = {
  data: RevenueData;
  isLoading?: boolean;
};

function RevenueWidgetSkeleton() {
  return (
    <CardWrapper className="p-6">
      <div className="h-5 w-24 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-10 w-32 animate-pulse rounded bg-muted" />
      <div className="mt-4 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 w-full animate-pulse rounded bg-muted" />
        ))}
      </div>
    </CardWrapper>
  );
}

export function RevenueWidget({ data, isLoading }: RevenueWidgetProps) {
  const { t } = useTranslation('dashboard');

  if (isLoading) return <RevenueWidgetSkeleton />;

  const formatted = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'AZN',
    maximumFractionDigits: 0,
  }).format(data.total);

  return (
    <CardWrapper className="p-6">
      <h3 className="text-base font-semibold text-foreground">
        {t('revenue.title')}
      </h3>
      <p className="mt-4 text-2xl font-semibold tabular-nums text-foreground">
        {formatted}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('revenue.period', { period: data.period })}
      </p>

      {data.breakdown && data.breakdown.length > 0 && (
        <div className="mt-6 space-y-3 border-t border-border pt-4">
          {data.breakdown.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium tabular-nums text-foreground">
                {new Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: 'AZN',
                  maximumFractionDigits: 0,
                }).format(item.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </CardWrapper>
  );
}
