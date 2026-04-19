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

export default function PopularServices({ popularServices, allServicesCount }) {
  const { t } = useTranslation('services');
  if (!popularServices || popularServices.length === 0) return null;

  return (
    <section className="service-detail-page__popular-services rounded-2xl border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-bold text-foreground">{t('popular.title')}</h2>
      <div>
        {popularServices.map((item) => (
          <div key={item.id} className="service-item">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="service-title-row">
                  <h3 className="service-title">{item.title}</h3>
                  {item.popular && (
                    <span className="service-badge popular">{t('popular.popularBadge')}</span>
                  )}
                </div>
                {item.category && (
                  <p className="service-description">
                    {getServiceDescription(item.code, item.category, t)}
                  </p>
                )}
                <div className="service-meta-row">
                  {item.durationMin && (
                    <span>{formatDuration(item.durationMin, t)}</span>
                  )}
                </div>
              </div>
              <div className="shrink-0 text-right">
                {item.priceFrom && (
                  <p className="service-price">
                    {t('popular.from')} {item.priceFrom}
                    {item.currency || '€'}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {allServicesCount > popularServices.length && (
        <div className="view-all-link">
          <button type="button">{t('popular.viewAll')}</button>
        </div>
      )}
    </section>
  );
}
