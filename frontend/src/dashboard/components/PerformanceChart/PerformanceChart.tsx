import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import type { ChartDataPoint } from '@/dashboard/types/dashboard.types';

type PerformanceChartProps = {
  series: ChartDataPoint[];
  isLoading?: boolean;
  height?: number;
};

function PerformanceChartSkeleton() {
  return (
    <CardWrapper className="p-6">
      <div className="h-6 w-32 animate-pulse rounded bg-muted" />
      <div className="mt-6 h-[200px] w-full animate-pulse rounded-lg bg-muted" />
    </CardWrapper>
  );
}

export function PerformanceChart({
  series,
  isLoading,
  height = 200,
}: PerformanceChartProps) {
  const { t } = useTranslation('dashboard');

  const { path, areaPath } = useMemo(() => {
    if (series.length === 0) return { path: '', areaPath: '' };

    const values = series.map((d) => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const padding = range * 0.1;
    const chartMin = min - padding;
    const chartMax = max + padding;
    const chartRange = chartMax - chartMin;

    const w = 100;
    const h = 100;
    const stepX = series.length > 1 ? w / (series.length - 1) : w;

    const points = series.map((d, i) => {
      const x = i * stepX;
      const y = h - ((d.value - chartMin) / chartRange) * h;
      return { x, y };
    });

    const linePath = `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`;
    const areaPathStr = `M 0,${h} L ${points.map((p) => `${p.x},${p.y}`).join(' L ')} L ${w},${h} Z`;

    return { path: linePath, areaPath: areaPathStr };
  }, [series]);

  if (isLoading) return <PerformanceChartSkeleton />;

  return (
    <CardWrapper className="p-6">
      <h3 className="mb-4 text-base font-semibold text-foreground">
        {t('chart.title')}
      </h3>

      {series.length === 0 ? (
        <div
          className="flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/20"
          style={{ height }}
        >
          <p className="text-sm text-muted-foreground">{t('chart.empty')}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-full w-full"
            style={{ height }}
          >
            <defs>
              <linearGradient
                id="chartGradient"
                x1="0"
                y1="1"
                x2="0"
                y2="0"
              >
                <stop offset="0%" stopColor="rgb(var(--chart-1))" stopOpacity="0.2" />
                <stop offset="100%" stopColor="rgb(var(--chart-1))" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path
              d={areaPath}
              fill="url(#chartGradient)"
              stroke="none"
            />
            <path
              d={path}
              fill="none"
              stroke="rgb(var(--chart-1))"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      )}
    </CardWrapper>
  );
}
