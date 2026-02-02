import { Clock } from 'lucide-react';

const formatDuration = (minutes) => {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${hours}.${mins} hour${hours > 1 ? 's' : ''}`;
};

const getServiceDescription = (code, category) => {
  if (code === 'oil_change') {
    return 'Includes oil filter replacement, fluid top-off, and 25-point inspection.';
  }
  if (code === 'brake_pads') {
    return 'Front or rear axle brake pads replacement with sensor check.';
  }
  if (code === 'diagnostics') {
    return 'Full system scan for error codes and performance issues.';
  }
  return category;
};

export default function FullPriceList({ services }) {
  if (!services || services.length === 0) return null;

  return (
    <section className="price-list rounded-xl border border-border bg-card p-4 sm:rounded-2xl sm:p-6">
      <h2 className="mb-3 text-base font-bold text-foreground sm:mb-4 sm:text-lg">Services & Prices</h2>
      <div className="price-list__container">
        {services.map((item) => (
          <div key={item.id} className="price-list__item">
            <div className="price-list__content">
              <div className="price-list__header">
                <h3 className="price-list__name">{item.title}</h3>
                {item.popular && (
                  <span className="price-list__badge price-list__badge--popular">POPULAR</span>
                )}
                {item.code === 'diagnostics' && !item.popular && (
                  <span className="price-list__badge price-list__badge--hot">HOT</span>
                )}
              </div>
              {item.category && (
                <p className="price-list__description">
                  {getServiceDescription(item.code, item.category)}
                </p>
              )}
              {item.durationMin && (
                <div className="price-list__duration-row">
                  <Clock size={16} className="price-list__clock-icon" />
                  <span className="price-list__duration">{formatDuration(item.durationMin)}</span>
                </div>
              )}
            </div>
            <div className="price-list__price">
              {item.priceFrom ? (
                <>
                  from {item.priceFrom}
                  {item.currency || '€'}
                </>
              ) : (
                '—'
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
