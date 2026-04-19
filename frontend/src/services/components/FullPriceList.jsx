import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('services');
  if (!services || services.length === 0) return null;

  return (
    <section className="price-list rounded-xl border border-border bg-card p-4 sm:rounded-2xl sm:p-6">
      <h2 className="mb-3 text-base font-bold text-foreground sm:mb-4 sm:text-lg">{t('priceList.title')}</h2>
      <div className="price-list__container">
        {services.map((item) => (
          <div key={item.id} className="price-list__item">
            <div className="price-list__content">
              <div className="price-list__header">
                <h3 className="price-list__name">{item.title}</h3>
                {item.popular && (
                  <span className="price-list__badge price-list__badge--popular">{t('priceList.popularBadge')}</span>
                )}
                {item.code === 'diagnostics' && !item.popular && (
                  <span className="price-list__badge price-list__badge--hot">{t('priceList.hotBadge')}</span>
                )}
              </div>
              {item.category && (
                <p className="price-list__description">
                  {getServiceDescription(item.code, item.category, t)}
                </p>
              )}
              {item.durationMin && (
                <div className="price-list__duration-row">
                  <Clock size={16} className="price-list__clock-icon" />
                  <span className="price-list__duration">{formatDuration(item.durationMin, t)}</span>
                </div>
              )}
            </div>
            <div className="price-list__price">
              {item.priceFrom ? (
                <>
                  {t('priceList.from')} {item.priceFrom}
                  {item.currency || '€'}
                </>
              ) : (
                t('priceList.noPrice')
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
