import { useTranslation } from 'react-i18next';
import Button from '@/shared/ui/button';
import { Specialization } from '@/specialists/types/specialist.types';
import { useSpecialistFiltersStore } from '@/specialists/store/useSpecialistFiltersStore';

const inputBase =
  'h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const specializationOptions = Object.values(Specialization);

const ratingSteps = [
  { value: '', labelKey: 'filters.ratingOptions.any' },
  { value: '3', labelKey: 'filters.ratingOptions.rating30' },
  { value: '3.5', labelKey: 'filters.ratingOptions.rating35' },
  { value: '4', labelKey: 'filters.ratingOptions.rating40' },
  { value: '4.5', labelKey: 'filters.ratingOptions.rating45' },
];

const SpecialistFilters = () => {
  const { t } = useTranslation('specialists');
  const filters = useSpecialistFiltersStore((state) => state.filters);
  const setFilter = useSpecialistFiltersStore((state) => state.setFilter);
  const clearFilters = useSpecialistFiltersStore((state) => state.clearFilters);

  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t('filters.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('filters.subtitle')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={clearFilters}>
          {t('filters.clear')}
        </Button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span>{t('filters.brand')}</span>
          <input
            type="text"
            value={filters.brand}
            onChange={(event) => setFilter('brand', event.target.value)}
            placeholder={t('filters.brandPlaceholder')}
            className={inputBase}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span>{t('filters.model')}</span>
          <input
            type="text"
            value={filters.model}
            onChange={(event) => setFilter('model', event.target.value)}
            placeholder={t('filters.modelPlaceholder')}
            className={inputBase}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span>{t('filters.year')}</span>
          <input
            type="number"
            min="1900"
            max="2100"
            value={filters.year}
            onChange={(event) => setFilter('year', event.target.value)}
            placeholder={t('filters.yearPlaceholder')}
            className={inputBase}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span>{t('filters.specialization')}</span>
          <select
            value={filters.specialization}
            onChange={(event) => {
              const value = event.target.value;
              setFilter('specialization', value === '' ? '' : (value as Specialization));
            }}
            className={inputBase}
          >
            <option value="">{t('filters.specializationAny')}</option>
            {specializationOptions.map((value) => (
              <option key={value} value={value}>
                {t(`specializations.${value}`)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span>{t('filters.city')}</span>
          <input
            type="text"
            value={filters.city}
            onChange={(event) => setFilter('city', event.target.value)}
            placeholder={t('filters.cityPlaceholder')}
            className={inputBase}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span>{t('filters.minRating')}</span>
          <select
            value={filters.minRating}
            onChange={(event) => setFilter('minRating', event.target.value)}
            className={inputBase}
          >
            {ratingSteps.map((step) => (
              <option key={step.value || 'any'} value={step.value}>
                {t(step.labelKey)}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
};

export default SpecialistFilters;
