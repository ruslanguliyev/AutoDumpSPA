import { useTranslation } from 'react-i18next';

import { Chip } from '@/shared/ui/Chip';

export default function BrandsServiced({ brands }) {
  const { t } = useTranslation('services');
  if (!brands || brands.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5 [overflow-wrap:anywhere]">
      <h2 className="text-[20px] font-semibold tracking-tight text-foreground">{t('brands.title')}</h2>
      <ul className="mt-4 flex list-none flex-wrap gap-2">
        {brands.map((brand) => (
          <li key={brand} className="min-w-0 max-w-full">
            <Chip className="max-w-full [overflow-wrap:anywhere]">{brand}</Chip>
          </li>
        ))}
      </ul>
    </section>
  );
}
