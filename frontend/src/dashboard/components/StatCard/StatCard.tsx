import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Car,
  Eye,
  FilePen,
  Heart,
  MessageCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';

import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import type { DashboardStat, DashboardStatId } from '@/dashboard/types/dashboard.types';
import { formatNumber, intlLocale } from '@/lib/format';
import { ROUTES } from '@/shared/constants/routes';

const iconMap: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  car: Car,
  eye: Eye,
  'file-pen': FilePen,
  heart: Heart,
  message: MessageCircle,
  dollar: DollarSign,
};

const STAT_HREF: Record<DashboardStatId, string> = {
  activeListings: `${ROUTES.dashboardVehicles}?status=ACTIVE`,
  drafts: `${ROUTES.dashboardVehicles}?status=DRAFT`,
  favorites: ROUTES.dashboardFavorites,
  unreadInquiries: `${ROUTES.dashboardInquiries}?status=NEW`,
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
  const { t, i18n } = useTranslation('dashboard');
  const locale = intlLocale(i18n.language);
  const Icon = iconMap[stat.icon] ?? Car;

  if (isLoading) return <StatCardSkeleton />;

  const valueFormatted = formatNumber(stat.value, locale);
  const label = t(stat.labelKey);
  const href = STAT_HREF[stat.id] ?? ROUTES.dashboard;

  const changePositive = (stat.change ?? 0) > 0;
  const changeNeutral = (stat.change ?? 0) === 0;

  return (
    <CardWrapper
      as={Link}
      to={href}
      hover
      aria-label={t('stats.cardAria', { label, count: stat.value })}
      className="group relative block min-h-11 p-6 text-inherit no-underline transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon size={20} aria-hidden />
        </div>
        <div className="flex items-center gap-2">
          {stat.change !== undefined && !changeNeutral ? (
            <span
              className={`flex items-center gap-0.5 text-sm font-medium ${
                changePositive ? 'text-success' : 'text-destructive'
              }`}
            >
              {changePositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(stat.change)}%
            </span>
          ) : null}
          <ArrowRight
            size={16}
            strokeWidth={1.5}
            aria-hidden
            className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          />
        </div>
      </div>
      <p className="mt-4 text-2xl font-semibold tabular-nums text-foreground">{valueFormatted}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </CardWrapper>
  );
}
