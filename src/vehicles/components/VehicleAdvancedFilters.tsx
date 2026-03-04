import { useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useFiltersStore, useFilters, useFiltersUi } from '@/features/filters/store/useFiltersStore';
import { getDefaultFilters } from '@/features/filters/store/filters.defaults';
import type { FilterOption } from '@/features/filters/types/filters.types';
import TextFilter from '@/features/filters/components/controls/TextFilter';
import SelectFilter from '@/features/filters/components/controls/SelectFilter';
import RangeFilter from '@/features/filters/components/controls/RangeFilter';
import ToggleFilter from '@/features/filters/components/controls/ToggleFilter';
import ChipsFilter from '@/features/filters/components/controls/ChipsFilter';
import { makesByCategory, modelsByMake } from '@/vehicles/components/AutoSearchFilter/options';

import '@/features/filters/styles/filters.shared.scss';
import './VehicleAdvancedFilters.scss';

const toNumberOrNull = (value: string) => {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

const getActiveCount = (
  filters: Record<string, unknown>,
  defaults: Record<string, unknown>
) =>
  Object.entries(filters).reduce((count, [key, value]) => {
    const defaultValue = defaults[key];

    if (Array.isArray(value)) {
      return count + (value.length ? 1 : 0);
    }

    if (typeof value === 'boolean') {
      return count + (value === defaultValue ? 0 : 1);
    }

    if (value === null || value === undefined || value === '') {
      return count +
        (defaultValue === null || defaultValue === undefined || defaultValue === ''
          ? 0
          : 1);
    }

    return count + (value === defaultValue ? 0 : 1);
  }, 0);

const buildSummaryItems = (
  filters: Record<string, unknown>,
  defaults: Record<string, unknown>,
  t: (key: string) => string
) => {
  const items: string[] = [];
  const push = (value: unknown) => {
    const text = String(value ?? '').trim();
    if (text) items.push(text);
  };

  if (filters.brand && filters.brand !== defaults.brand) {
    push(filters.brand);
  }

  if (filters.model && filters.model !== defaults.model) {
    push(filters.model);
  }

  if (filters.condition && filters.condition !== 'all') {
    if (filters.condition === 'new') push(t('filter.conditionNew'));
    else if (filters.condition === 'used') push(t('filter.conditionUsed'));
  }

  if (filters.city && filters.city !== defaults.city) {
    push(filters.city);
  }

  const priceFrom = filters.priceFrom as number | null | undefined;
  const priceTo = filters.priceTo as number | null | undefined;
  if (priceFrom || priceTo) {
    let label = t('filter.price');
    if (priceFrom) label += ` ≥${priceFrom}`;
    if (priceTo) label += ` ≤${priceTo}`;
    push(label);
  }

  const yearFrom = filters.yearFrom as number | null | undefined;
  const yearTo = filters.yearTo as number | null | undefined;
  if (yearFrom || yearTo) {
    let label = `${t('filter.year')}:`;
    if (yearFrom) label += ` ${yearFrom}`;
    if (yearTo) label += `–${yearTo}`;
    push(label);
  }

  if (filters.color && filters.color !== defaults.color) {
    push(filters.color);
  }

  const fuel = Array.isArray(filters.fuel) ? filters.fuel : [];
  if (fuel.length) {
    push(fuel.join(', '));
  }

  const transmission = Array.isArray(filters.transmission) ? filters.transmission : [];
  if (transmission.length) {
    push(transmission.join(', '));
  }

  if (filters.hasNoDamage) push(t('filter.noDamage'));
  if (filters.isUnpainted) push(t('filter.unpainted'));
  if (filters.isAccidentedOnly) push(t('filter.accidentOnly'));

  if (filters.status && filters.status !== 'all') {
    if (filters.status === 'available') push(t('filter.statusAvailable'));
    else if (filters.status === 'sold') push(t('filter.statusSold'));
  }

  return Array.from(new Set(items));
};

type FieldProps = {
  label?: string;
  children: ReactNode;
};

const Field = ({ label, children }: FieldProps) => (
  <div className="vehicle-advanced-filters__field">
    {label ? <span className="filter-label">{label}</span> : null}
    {children}
  </div>
);

type VehicleAdvancedFiltersProps = {
  showHeader?: boolean;
  hiddenFields?: string[];
};

const VehicleAdvancedFilters = ({
  showHeader = true,
  hiddenFields = [],
}: VehicleAdvancedFiltersProps) => {
  const { t } = useTranslation('vehicle');
  const filters = useFilters('cars');
  const ui = useFiltersUi('cars');
  const setFilter = useFiltersStore((state) => state.setFilter);
  const setFilters = useFiltersStore((state) => state.setFilters);
  const toggleFilterValue = useFiltersStore((state) => state.toggleFilterValue);
  const resetFilters = useFiltersStore((state) => state.resetFilters);
  const setCollapsed = useFiltersStore((state) => state.setCollapsed);
  const toggleCollapsed = useFiltersStore((state) => state.toggleCollapsed);

  const defaults = useMemo(() => getDefaultFilters('cars'), []);
  const activeCount = useMemo(
    () => getActiveCount(filters, defaults),
    [filters, defaults]
  );

  const summaryItems = useMemo(
    () => buildSummaryItems(filters, defaults, t),
    [filters, defaults, t]
  );

  const hiddenSet = useMemo(() => new Set(hiddenFields), [hiddenFields]);
  const isHidden = (key: string) => hiddenSet.has(key);
  const isCollapsed = showHeader ? ui.isCollapsed : false;
  const didSetMobileDefault = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || didSetMobileDefault.current) return;
    if (!window.matchMedia('(max-width: 767px)').matches) return;
    const stored = useFiltersStore.getState().ui.cars;
    if (stored?.isCollapsed !== undefined) return;
    didSetMobileDefault.current = true;
    setCollapsed('cars', true);
  }, [setCollapsed]);

  const bodyTypeOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'car', label: t('filter.car') },
      { value: 'motorcycle', label: t('filter.motorcycle') },
      { value: 'camper', label: t('filter.camper') },
      { value: 'truck', label: t('filter.truck') },
      { value: 'commercial', label: t('filter.commercial') },
    ],
    [t]
  );

  const makeOptions = useMemo<FilterOption[]>(() => {
    const vehicleType = String(filters.vehicleType || 'car');
    const makes = makesByCategory[vehicleType] ?? [];
    return makes.map((value) => ({
      value: value === 'All Makes' ? '' : value,
      label: value === 'All Makes' ? t('filter.allMakes') : value,
    }));
  }, [filters.vehicleType, t]);

  const modelOptions = useMemo<FilterOption[]>(() => {
    const brand = String(filters.brand || '').trim();
    if (!brand) return [];
    const models = modelsByMake[brand] ?? [];
    return [
      { value: '', label: t('filter.allModels') },
      ...models.map((value) => ({ value, label: value })),
    ];
  }, [filters.brand, t]);

  const conditionOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'all', label: t('filter.conditionAll') },
      { value: 'new', label: t('filter.conditionNew') },
      { value: 'used', label: t('filter.conditionUsed') },
    ],
    [t]
  );

  const fuelOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'Petrol', label: t('filter.fuelPetrol') },
      { value: 'Diesel', label: t('filter.fuelDiesel') },
      { value: 'Hybrid', label: t('filter.fuelHybrid') },
      { value: 'Electric', label: t('filter.fuelElectric') },
    ],
    [t]
  );

  const transmissionOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'Automatic', label: t('filter.transmissionAutomatic') },
      { value: 'Manual', label: t('filter.transmissionManual') },
    ],
    [t]
  );

  const currencyOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'AZN', label: 'AZN' },
      { value: 'EUR', label: 'EUR' },
      { value: 'USD', label: 'USD' },
    ],
    []
  );

  const colorOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'Black', label: t('filter.colorBlack') },
      { value: 'White', label: t('filter.colorWhite') },
      { value: 'Gray', label: t('filter.colorGray') },
      { value: 'Blue', label: t('filter.colorBlue') },
      { value: 'Red', label: t('filter.colorRed') },
    ],
    [t]
  );

  const marketRegionOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'europe', label: t('filter.regions.europe') },
      { value: 'germany', label: t('filter.regions.germany') },
      { value: 'france', label: t('filter.regions.france') },
      { value: 'italy', label: t('filter.regions.italy') },
      { value: 'spain', label: t('filter.regions.spain') },
      { value: 'uk', label: t('filter.regions.uk') },
    ],
    [t]
  );

  const statusOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'all', label: t('filter.statusAll') },
      { value: 'available', label: t('filter.statusAvailable') },
      { value: 'sold', label: t('filter.statusSold') },
    ],
    [t]
  );

  const summaryMax = 3;
  const summaryVisible = showHeader && isCollapsed && summaryItems.length > 0;
  const summaryOverflow =
    summaryItems.length > summaryMax ? summaryItems.length - summaryMax : 0;
  const summaryVisibleItems = summaryItems.slice(0, summaryMax);

  const contentWrapperClassName = [
    'overflow-hidden transition-all duration-300 ease-out',
    isCollapsed
      ? 'max-h-0 opacity-0 pointer-events-none'
      : 'max-h-[2000px] opacity-100',
  ].join(' ');

  const showBrand = !isHidden('brand');
  const showModel = !isHidden('model');
  const showCondition = !isHidden('condition');
  const showCity = !isHidden('city');
  const showPriceFrom = !isHidden('priceFrom');
  const showPriceTo = !isHidden('priceTo');
  const showCurrency = !isHidden('currency');
  const showCredit = !isHidden('isCredit');
  const showBarter = !isHidden('isBarter');
  const showVehicleType = !isHidden('vehicleType');
  const showYearFrom = !isHidden('yearFrom');
  const showYearTo = !isHidden('yearTo');
  const showColor = !isHidden('color');
  const showFuel = !isHidden('fuel');
  const showTransmission = !isHidden('transmission');
  const showEngineVolumeFrom = !isHidden('engineVolumeFrom');
  const showEngineVolumeTo = !isHidden('engineVolumeTo');
  const showPowerFrom = !isHidden('powerFrom');
  const showPowerTo = !isHidden('powerTo');
  const showMileageFrom = !isHidden('mileageFrom');
  const showMileageTo = !isHidden('mileageTo');
  const showOwners = !isHidden('ownersCount');
  const showSeats = !isHidden('seatsCount');
  const showMarketRegion = !isHidden('marketRegion');
  const showNoDamage = !isHidden('hasNoDamage');
  const showUnpainted = !isHidden('isUnpainted');
  const showAccidentOnly = !isHidden('isAccidentedOnly');
  const showStatus = !isHidden('status');

  return (
    <section className="vehicle-advanced-filters">
      {showHeader ? (
        <div className="vehicle-advanced-filters__header">
          <div className="vehicle-advanced-filters__title">
            <span>{t('filter.filters')}</span>
            {activeCount > 0 ? (
              <span className="vehicle-advanced-filters__badge">{activeCount}</span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn ghost"
              onClick={() => resetFilters('cars', defaults)}
            >
              {t('filter.reset')}
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={() => toggleCollapsed('cars')}
            >
              <span className="hidden sm:inline">
                {isCollapsed ? t('filter.show') ?? 'Show' : t('filter.hide') ?? 'Hide'}
              </span>
            </button>
          </div>
        </div>
      ) : null}

      {summaryVisible ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {summaryVisibleItems.map((item) => (
            <span
              key={item}
              className="inline-flex items-center rounded-full border border-border bg-background px-2 py-0.5 text-xs text-foreground"
            >
              {item}
            </span>
          ))}
          {summaryOverflow > 0 ? (
            <span className="inline-flex items-center rounded-full border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">
              +{summaryOverflow}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className={contentWrapperClassName}>
      {showBrand || showModel || showCondition || showCity ? (
        <div className="vehicle-advanced-filters__row">
          {showBrand ? (
            <Field label={t('filter.make')}>
              <SelectFilter
                value={filters.brand}
                onChange={(value) => setFilter('cars', 'brand', value)}
                options={makeOptions}
              />
            </Field>
          ) : null}
          {showModel ? (
            <Field label={t('filter.model')}>
              <SelectFilter
                value={filters.model ?? ''}
                onChange={(value) => setFilter('cars', 'model', value)}
                options={modelOptions}
                placeholder={
                  filters.brand ? t('filter.allModels') : t('filter.selectMakeFirst')
                }
                disabled={!filters.brand}
              />
            </Field>
          ) : null}
          {showCondition ? (
            <Field label={t('filter.condition')}>
              <ChipsFilter
                options={conditionOptions}
                selected={filters.condition}
                onToggle={(value) => setFilter('cars', 'condition', value)}
                listClassName="chips-row"
                itemClassName="chip"
                itemActiveClassName="chip-selected"
              />
            </Field>
          ) : null}
          {showCity ? (
            <Field label={t('filter.city')}>
              <TextFilter
                value={filters.city}
                onChange={(value) => setFilter('cars', 'city', value.trim())}
                placeholder={t('filter.cityPlaceholder')}
              />
            </Field>
          ) : null}
        </div>
      ) : null}

      {showPriceFrom ||
      showPriceTo ||
      showCurrency ||
      showCredit ||
      showBarter ||
      showVehicleType ? (
        <div className="vehicle-advanced-filters__row">
          {showPriceFrom ? (
            <Field label={t('filter.priceFrom')}>
              <TextFilter
                value={filters.priceFrom}
                onChange={(value) =>
                  setFilter('cars', 'priceFrom', toNumberOrNull(value))
                }
                inputType="number"
              />
            </Field>
          ) : null}
          {showPriceTo ? (
            <Field label={t('filter.priceTo')}>
              <TextFilter
                value={filters.priceTo}
                onChange={(value) =>
                  setFilter('cars', 'priceTo', toNumberOrNull(value))
                }
                inputType="number"
              />
            </Field>
          ) : null}
          {showCurrency ? (
            <Field label={t('filter.currency')}>
              <SelectFilter
                value={filters.currency}
                onChange={(value) => setFilter('cars', 'currency', value)}
                options={currencyOptions}
              />
            </Field>
          ) : null}
          {showCredit ? (
            <Field>
              <ToggleFilter
                checked={Boolean(filters.isCredit)}
                onChange={(value) => setFilter('cars', 'isCredit', value)}
                label={t('filter.credit')}
              />
            </Field>
          ) : null}
          {showBarter ? (
            <Field>
              <ToggleFilter
                checked={Boolean(filters.isBarter)}
                onChange={(value) => setFilter('cars', 'isBarter', value)}
                label={t('filter.barter')}
              />
            </Field>
          ) : null}
          {showVehicleType ? (
            <Field label={t('filter.bodyType')}>
              <SelectFilter
                value={filters.vehicleType}
                onChange={(value) =>
                  setFilters('cars', {
                    vehicleType: value,
                    brand: defaults.brand ?? '',
                    model: defaults.model ?? '',
                  })
                }
                options={bodyTypeOptions}
              />
            </Field>
          ) : null}
        </div>
      ) : null}

      {showYearFrom ||
      showYearTo ||
      showColor ||
      showFuel ||
      showTransmission ? (
        <div className="vehicle-advanced-filters__row">
          {showYearFrom ? (
            <Field label={t('filter.yearFrom')}>
              <TextFilter
                value={filters.yearFrom}
                onChange={(value) =>
                  setFilter('cars', 'yearFrom', toNumberOrNull(value))
                }
                inputType="number"
              />
            </Field>
          ) : null}
          {showYearTo ? (
            <Field label={t('filter.yearTo')}>
              <TextFilter
                value={filters.yearTo}
                onChange={(value) =>
                  setFilter('cars', 'yearTo', toNumberOrNull(value))
                }
                inputType="number"
              />
            </Field>
          ) : null}
          {showColor ? (
            <Field label={t('filter.color')}>
              <SelectFilter
                value={filters.color ?? ''}
                onChange={(value) => setFilter('cars', 'color', value || null)}
                options={colorOptions}
                placeholder={t('filter.colorAny')}
              />
            </Field>
          ) : null}
          {showFuel ? (
            <Field label={t('filter.fuel')}>
              <ChipsFilter
                options={fuelOptions}
                selected={filters.fuel}
                multiple
                onToggle={(value) => toggleFilterValue('cars', 'fuel', value)}
                listClassName="chips-row"
                itemClassName="chip"
                itemActiveClassName="chip-selected"
              />
            </Field>
          ) : null}
          {showTransmission ? (
            <Field label={t('filter.transmission')}>
              <ChipsFilter
                options={transmissionOptions}
                selected={filters.transmission}
                multiple
                onToggle={(value) =>
                  toggleFilterValue('cars', 'transmission', value)
                }
                listClassName="chips-row"
                itemClassName="chip"
                itemActiveClassName="chip-selected"
              />
            </Field>
          ) : null}
        </div>
      ) : null}

      {showEngineVolumeFrom ||
      showEngineVolumeTo ||
      showPowerFrom ||
      showPowerTo ||
      showMileageFrom ||
      showMileageTo ? (
        <div className="vehicle-advanced-filters__row vehicle-advanced-filters__row--range">
          {showEngineVolumeFrom || showEngineVolumeTo ? (
            <Field label={t('filter.engineVolume')}>
              <RangeFilter
                minValue={filters.engineVolumeFrom}
                maxValue={filters.engineVolumeTo}
                minPlaceholder={t('filter.from')}
                maxPlaceholder={t('filter.to')}
                onMinChange={(value) =>
                  setFilter('cars', 'engineVolumeFrom', toNumberOrNull(value))
                }
                onMaxChange={(value) =>
                  setFilter('cars', 'engineVolumeTo', toNumberOrNull(value))
                }
              />
            </Field>
          ) : null}
          {showPowerFrom || showPowerTo ? (
            <Field label={t('filter.power')}>
              <RangeFilter
                minValue={filters.powerFrom}
                maxValue={filters.powerTo}
                minPlaceholder={t('filter.from')}
                maxPlaceholder={t('filter.to')}
                onMinChange={(value) =>
                  setFilter('cars', 'powerFrom', toNumberOrNull(value))
                }
                onMaxChange={(value) =>
                  setFilter('cars', 'powerTo', toNumberOrNull(value))
                }
              />
            </Field>
          ) : null}
          {showMileageFrom || showMileageTo ? (
            <Field label={t('filter.mileage')}>
              <RangeFilter
                minValue={filters.mileageFrom}
                maxValue={filters.mileageTo}
                minPlaceholder={t('filter.from')}
                maxPlaceholder={t('filter.to')}
                onMinChange={(value) =>
                  setFilter('cars', 'mileageFrom', toNumberOrNull(value))
                }
                onMaxChange={(value) =>
                  setFilter('cars', 'mileageTo', toNumberOrNull(value))
                }
              />
            </Field>
          ) : null}
        </div>
      ) : null}

      {showOwners || showSeats || showMarketRegion ? (
        <div className="vehicle-advanced-filters__row">
          {showOwners ? (
            <Field label={t('filter.owners')}>
              <TextFilter
                value={filters.ownersCount}
                onChange={(value) =>
                  setFilter('cars', 'ownersCount', toNumberOrNull(value))
                }
                inputType="number"
              />
            </Field>
          ) : null}
          {showSeats ? (
            <Field label={t('filter.seats')}>
              <TextFilter
                value={filters.seatsCount}
                onChange={(value) =>
                  setFilter('cars', 'seatsCount', toNumberOrNull(value))
                }
                inputType="number"
              />
            </Field>
          ) : null}
          {showMarketRegion ? (
            <Field label={t('filter.marketRegion')}>
              <SelectFilter
                value={filters.marketRegion ?? ''}
                onChange={(value) => setFilter('cars', 'marketRegion', value || null)}
                options={marketRegionOptions}
                placeholder={t('filter.marketRegionAny')}
              />
            </Field>
          ) : null}
        </div>
      ) : null}

      {showNoDamage || showUnpainted || showAccidentOnly ? (
        <div className="vehicle-advanced-filters__row">
          {showNoDamage ? (
            <Field>
              <ToggleFilter
                checked={Boolean(filters.hasNoDamage)}
                onChange={(value) => setFilter('cars', 'hasNoDamage', value)}
                label={t('filter.noDamage')}
              />
            </Field>
          ) : null}
          {showUnpainted ? (
            <Field>
              <ToggleFilter
                checked={Boolean(filters.isUnpainted)}
                onChange={(value) => setFilter('cars', 'isUnpainted', value)}
                label={t('filter.unpainted')}
              />
            </Field>
          ) : null}
          {showAccidentOnly ? (
            <Field>
              <ToggleFilter
                checked={Boolean(filters.isAccidentedOnly)}
                onChange={(value) => setFilter('cars', 'isAccidentedOnly', value)}
                label={t('filter.accidentOnly')}
              />
            </Field>
          ) : null}
        </div>
      ) : null}

      {showStatus ? (
        <div className="vehicle-advanced-filters__row">
          <Field label={t('filter.status')}>
            <SelectFilter
              value={filters.status}
              onChange={(value) => setFilter('cars', 'status', value)}
              options={statusOptions}
            />
          </Field>
        </div>
      ) : null}
      </div>
    </section>
  );
};

export default VehicleAdvancedFilters;
