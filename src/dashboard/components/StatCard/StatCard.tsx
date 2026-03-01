import { useTranslation } from 'react-i18next';
import {
  Car,
  Eye,
  Clock,
  Heart,
  MessageCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import type { DashboardStat } from '@/dashboard/types/dashboard.types';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  car: Car,
  eye: Eye,
  clock: Clock,
  heart: Heart,
  message: MessageCircle,
  dollar: DollarSign,
};

type StatCardProps = {
  stat: DashboardStat;
  isLoading?: boolean;
};

function StatCardSkeleton() {
  return (
    <CardWrapper className="p-6">
      <div className="flex items-start justify-between">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
        <div className="h-5 w-12 animate-pulse rounded bg-muted" />
      </div>
      <div className="mt-4 h-8 w-24 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-4 w-32 animate-pulse rounded bg-muted" />
    </CardWrapper>
  );
}

export function StatCard({ stat, isLoading }: StatCardProps) {
  const { t } = useTranslation('dashboard');
  const Icon = iconMap[stat.icon] ?? Car;

  if (isLoading) return <StatCardSkeleton />;

  const valueFormatted =
    stat.id === 'revenue'
      ? new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: 'AZN',
          maximumFractionDigits: 0,
        }).format(stat.value)
      : stat.value.toLocaleString();

  const changePositive = (stat.change ?? 0) > 0;
  const changeNeutral = (stat.change ?? 0) === 0;

  return (
    <CardWrapper hover className="p-6 transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon size={20} aria-hidden />
        </div>
        {stat.change !== undefined && !changeNeutral && (
          <span
            className={`flex items-center gap-0.5 text-sm font-medium ${
              changePositive ? 'text-success' : 'text-destructive'
            }`}
          >
            {changePositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(stat.change)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-semibold tabular-nums text-foreground">
        {valueFormatted}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{t(stat.labelKey)}</p>
    </CardWrapper>
  );
}
