import { useTranslation } from 'react-i18next';

export default function BrandsServiced({ brands }) {
  const { t } = useTranslation('services');
  if (!brands || brands.length === 0) return null;

  return (
    <section className="service-detail-page__brands rounded-xl border border-border bg-card p-4 sm:rounded-2xl sm:p-6">
      <h2 className="mb-3 text-base font-bold text-foreground sm:mb-4 sm:text-lg">{t('brands.title')}</h2>
      <div className="flex flex-wrap gap-3">
        {brands.map((brand) => (
          <div key={brand} className="brand-item">
            {brand}
          </div>
        ))}
      </div>
    </section>
  );
}
