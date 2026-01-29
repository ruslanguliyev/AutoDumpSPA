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

export default function PopularServices({ popularServices, allServicesCount }) {
  if (!popularServices || popularServices.length === 0) return null;

  return (
    <section className="service-detail-page__popular-services rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold text-slate-900">Popular Services</h2>
      <div>
        {popularServices.map((item) => (
          <div key={item.id} className="service-item">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="service-title-row">
                  <h3 className="service-title">{item.title}</h3>
                  {item.popular && (
                    <span className="service-badge popular">POPULAR</span>
                  )}
                </div>
                {item.category && (
                  <p className="service-description">
                    {getServiceDescription(item.code, item.category)}
                  </p>
                )}
                <div className="service-meta-row">
                  {item.durationMin && (
                    <span>{formatDuration(item.durationMin)}</span>
                  )}
                </div>
              </div>
              <div className="shrink-0 text-right">
                {item.priceFrom && (
                  <p className="service-price">
                    from {item.priceFrom}
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
          <button type="button">View all services →</button>
        </div>
      )}
    </section>
  );
}
