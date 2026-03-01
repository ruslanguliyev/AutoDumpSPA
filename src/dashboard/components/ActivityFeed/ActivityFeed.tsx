import { useTranslation } from 'react-i18next';
import {
  Car,
  Eye,
  Gavel,
  MessageCircle,
  CheckCircle,
  Heart,
  Calendar,
} from 'lucide-react';

import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import type { ActivityItem } from '@/dashboard/types/dashboard.types';

const iconMap: Record<ActivityItem['type'], React.ComponentType<{ size?: number; className?: string }>> = {
  listing: Car,
  view: Eye,
  bid: Gavel,
  message: MessageCircle,
  moderation: CheckCircle,
  favorite: Heart,
  booking: Calendar,
};

function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffM = Math.floor(diffMs / 60_000);
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffMs / 86_400_000);

  if (diffM < 1) return 'now';
  if (diffM < 60) return `${diffM}m`;
  if (diffH < 24) return `${diffH}h`;
  if (diffD < 7) return `${diffD}d`;
  return d.toLocaleDateString();
}

type ActivityFeedProps = {
  items: ActivityItem[];
  isLoading?: boolean;
  maxItems?: number;
};

function ActivityFeedSkeleton() {
  return (
    <CardWrapper className="p-6">
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="h-9 w-9 flex-shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}

export function ActivityFeed({ items, isLoading, maxItems = 6 }: ActivityFeedProps) {
  const { t } = useTranslation('dashboard');
  const displayItems = items.slice(0, maxItems);

  if (isLoading) return <ActivityFeedSkeleton />;

  return (
    <CardWrapper className="p-6">
      <h3 className="mb-4 text-base font-semibold text-foreground">
        {t('activity.title')}
      </h3>

      {displayItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">{t('activity.empty')}</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {displayItems.map((item) => {
            const Icon = iconMap[item.type];
            return (
              <li key={item.id} className="flex gap-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted/80 text-muted-foreground">
                  <Icon size={16} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {t(item.title)}
                    {item.subtitle && (
                      <span className="ml-1 text-muted-foreground">— {item.subtitle}</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatRelativeTime(item.timestamp)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </CardWrapper>
  );
}
