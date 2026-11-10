import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatPrice, intlLocale } from '@/lib/format';
import { Badge } from '@/shared/ui/Badge';

const formatDuration = (minutes, t) => {
  if (!minutes) return null;
  if (minutes < 60) return t('duration.mins', { count: minutes });
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return t(hours === 1 ? 'duration.hour_one' : 'duration.hour_other', { count: hours });
  return t('duration.hoursDecimal', { hours, mins: String(mins).padStart(2, '0') });
};

const getServiceDescription = (code, category, t) => {
  if (code === 'oil_change') return t('serviceDescriptions.oil_change');
  if (code === 'brake_pads') return t('serviceDescriptions.brake_pads');
  if (code === 'diagnostics') return t('serviceDescriptions.diagnostics');
  return category;
};

export default function FullPriceList({ services }) {
  const { t, i18n } = useTranslation('services');
  const locale = intlLocale(i18n.language);
  if (!services?.length) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5 [overflow-wrap:anywhere]">
      <h2 className="mb-4 text-[17px] font-semibold text-foreground">{t('priceList.title')}</h2>
      <ul className="divide-y divide-dashed divide-border">
        {services.map((item) => (
          <li key={item.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[15px] font-semibold text-foreground">{item.title}</h3>
                {item.popular ? <Badge variant="hot">{t('priceList.popularBadge')}</Badge> : null}
                {item.code === 'diagnostics' && !item.popular ? (
                  <Badge variant="hot">{t('priceList.hotBadge')}</Badge>
                ) : null}
              </div>
              {item.category ? (
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {getServiceDescription(item.code, item.category, t)}
                </p>
              ) : null}
              {item.durationMin ? (
                <p className="mt-2 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <Clock size={14} aria-hidden="true" />
                  {formatDuration(item.durationMin, t)}
                </p>
              ) : null}
            </div>
            <p className="shrink-0 text-[15px] font-bold text-primary-text">
              {item.priceFrom != null
                ? t('priceList.fromPrice', {
                    price: formatPrice(item.priceFrom, item.currency || 'AZN', locale),
                  })
                : t('priceList.noPrice')}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
