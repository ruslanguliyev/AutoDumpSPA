import { useTranslation } from 'react-i18next';

export default function BrandsServiced({ brands }) {
  const { t } = useTranslation('services');
  if (!brands || brands.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5">
      <h2 className="mb-3 text-[17px] font-semibold text-foreground">{t('brands.title')}</h2>
      <div className="flex flex-wrap gap-2">
        {brands.map((brand) => (
          <span
            key={brand}
            className="rounded-[var(--radius)] border border-border bg-card-muted px-3 py-1.5 text-[13px] font-semibold text-foreground"
          >
            {brand}
          </span>
        ))}
      </div>
    </section>
  );
}
