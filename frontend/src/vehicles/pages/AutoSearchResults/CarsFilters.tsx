import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

import { CAR_BRANDS, getModelsForBrand } from '@/features/addItem/constants/vehicleCatalog';
import { useFilters, useFiltersStore } from '@/features/filters/store/useFiltersStore';
import type { FilterValue } from '@/features/filters/types/filters.types';
import type { AiMarkKey, AiMarks } from '@/features/ai/aiMarks';
import { getModelsForBrandFromSpecs } from '@/lib/carSpecsData';
import { formatNumber } from '@/lib/format';
import { AiSparkle } from '@/shared/ui/AiSparkle/AiSparkle';
import { Combobox } from '@/shared/ui/Combobox';
import { Chip } from '@/shared/ui/Chip';
import Input from '@/shared/ui/Input/Input';
import { labelClass } from '@/shared/ui/field';
import { makesByCategory, modelsByMake } from '@/vehicles/components/AutoSearchFilter/options';

const BRANDS = [
  ...new Set([
    ...CAR_BRANDS,
    ...makesByCategory.car.filter((brand: string) => brand !== 'All Makes'),
  ]),
]
  .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  .map((brand) => ({ value: brand, label: brand }));

const asList = (value: FilterValue): string[] => (Array.isArray(value) ? value.map(String) : []);
const asNumber = (value: FilterValue): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};
const digitsOnly = (text: string) => text.replace(/[^\d]/g, '');
const toNumberOrNull = (text: string) => {
  const digits = digitsOnly(text);
  return digits === '' ? null : Number(digits);
};

const numberLocale = (language: string) => {
  if (language.startsWith('en')) return 'en-US';
  if (language.startsWith('az')) return 'az-AZ';
  return 'ru-RU';
};

type RangePairProps = {
  legend: string;
  unit?: string;
  from: number | null;
  to: number | null;
  onFrom: (value: number | null) => void;
  onTo: (value: number | null) => void;
  size: 'md' | 'drawer';
  min?: number;
  invalidMessage: string;
  grouped?: boolean;
  marked?: boolean;
};

function RangePair({
  legend,
  unit,
  from,
  to,
  onFrom,
  onTo,
  size,
  min,
  invalidMessage,
  grouped = true,
  marked = false,
}: RangePairProps) {
  const { t, i18n } = useTranslation('vehicle');
  const locale = numberLocale(i18n.language);
  const [fromFocused, setFromFocused] = useState(false);
  const [toFocused, setToFocused] = useState(false);
  const invalid = from != null && to != null && from > to;

  const display = (value: number | null, focused: boolean) => {
    if (value == null) return '';
    if (focused || !grouped) return String(value);
    return formatNumber(value, locale);
  };

  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className={`${labelClass} mb-1.5 flex items-center gap-1.5`}>
        {legend}
        {marked ? <AiSparkle size={12} className="text-ai-text-icon" /> : null}
      </legend>
      <div className="flex min-w-0 items-center gap-2">
        <Input
          size={size}
          inputMode="numeric"
          min={min}
          label={t('index.filters.from')}
          labelHidden
          placeholder={t('index.filters.from')}
          value={display(from, fromFocused)}
          aria-invalid={invalid || undefined}
          wrapperClassName="min-w-0 flex-1"
          className={marked && from != null ? '!border-ai-border' : ''}
          onFocus={() => setFromFocused(true)}
          onBlur={() => setFromFocused(false)}
          onChange={(event) => onFrom(toNumberOrNull(event.target.value))}
        />
        <span className="shrink-0 text-muted-foreground" aria-hidden>
          —
        </span>
        <Input
          size={size}
          inputMode="numeric"
          min={min}
          label={t('index.filters.to')}
          labelHidden
          placeholder={t('index.filters.to')}
          value={display(to, toFocused)}
          aria-invalid={invalid || undefined}
          wrapperClassName="min-w-0 flex-1"
          className={marked && to != null ? '!border-ai-border' : ''}
          onFocus={() => setToFocused(true)}
          onBlur={() => setToFocused(false)}
          onChange={(event) => onTo(toNumberOrNull(event.target.value))}
        />
        {unit ? (
          <span className="shrink-0 text-[13px] text-muted-foreground">{unit}</span>
        ) : null}
      </div>
      {invalid ? (
        <p role="alert" className="mt-1 text-[13px] text-destructive">
          {invalidMessage}
        </p>
      ) : null}
    </fieldset>
  );
}

type CarsFiltersProps = {
  size?: 'md' | 'drawer';
  clientRangeFiltersSupported?: boolean;
  aiMarks?: AiMarks;
  onAiEdit?: (key: AiMarkKey) => void;
};

function Mark({ on }: { on?: boolean }) {
  if (!on) return null;
  return <AiSparkle size={12} className="text-ai-text-icon" />;
}

export default function CarsFilters({
  size = 'md',
  clientRangeFiltersSupported = true,
  aiMarks,
  onAiEdit,
}: CarsFiltersProps) {
  const { t } = useTranslation('vehicle');
  const filters = useFilters('cars');
  const setFilter = useFiltersStore((state) => state.setFilter);
  const setFilters = useFiltersStore((state) => state.setFilters);
  const toggleFilterValue = useFiltersStore((state) => state.toggleFilterValue);

  const brand = String(filters.brand ?? '').trim();
  const modelOptions = useMemo(() => {
    if (!brand) return [];
    const merged = [
      ...new Set([
        ...getModelsForBrandFromSpecs(brand),
        ...(modelsByMake[brand] ?? []),
        ...getModelsForBrand(brand).filter((value) => value !== '__other__'),
      ]),
    ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    return merged.map((model) => ({ value: model, label: model }));
  }, [brand]);

  const brandOptions = useMemo(
    () => [{ value: '', label: t('index.filters.anyBrand') }, ...BRANDS],
    [t],
  );

  const transmission = asList(filters.transmission);
  const fuel = asList(filters.fuel);
  const condition = String(filters.condition ?? 'all') || 'all';

  const transmissions = [
    { value: 'Automatic', label: t('enums.transmission.Automatic') },
    { value: 'Manual', label: t('enums.transmission.Manual') },
  ];
  const fuels = [
    { value: 'Petrol', label: t('enums.fuel.Petrol') },
    { value: 'Diesel', label: t('enums.fuel.Diesel') },
    { value: 'Hybrid', label: t('enums.fuel.Hybrid') },
    { value: 'Electric', label: t('enums.fuel.Electric') },
  ];
  const conditions = [
    { value: 'all', label: t('filter.conditionAll') },
    { value: 'new', label: t('filter.conditionNew') },
    { value: 'used', label: t('filter.conditionUsed') },
  ];

  const advancedCount = fuel.length + transmission.length;
  const markedAdvanced = Boolean(aiMarks?.fuel || aiMarks?.transmission);
  const [advancedOpen, setAdvancedOpen] = useState(advancedCount > 0 || markedAdvanced);
  const [bodyTechOpen, setBodyTechOpen] = useState(true);

  useEffect(() => {
    if (advancedCount > 0 || markedAdvanced) setAdvancedOpen(true);
  }, [advancedCount, markedAdvanced]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className={`${labelClass} mb-1.5 flex items-center gap-1.5`}>
          {t('index.filters.brand')}
          <Mark on={aiMarks?.brand} />
        </span>
        <Combobox
          value={brand}
          onChange={(value) => {
            setFilters('cars', { brand: value, model: '' });
            onAiEdit?.('brand');
            onAiEdit?.('model');
          }}
          options={brandOptions}
          placeholder={t('index.filters.anyBrand')}
          searchPlaceholder={t('index.filters.searchBrand')}
          emptyText={t('index.filters.noMatches')}
          aria-label={t('index.filters.brand')}
          triggerClassName={aiMarks?.brand ? 'border-ai-border' : undefined}
        />
      </div>
      <div>
        <span className={`${labelClass} mb-1.5 flex items-center gap-1.5`}>
          {t('index.filters.model')}
          <Mark on={aiMarks?.model} />
        </span>
        <Combobox
          value={String(filters.model ?? '')}
          onChange={(value) => {
            setFilter('cars', 'model', value);
            onAiEdit?.('model');
          }}
          options={[{ value: '', label: t('filter.allModels') }, ...modelOptions]}
          placeholder={brand ? t('filter.allModels') : t('filter.selectMakeFirst')}
          searchPlaceholder={t('index.filters.searchModel')}
          emptyText={t('index.filters.noMatches')}
          disabled={!brand}
          aria-label={t('index.filters.model')}
          triggerClassName={aiMarks?.model ? 'border-ai-border' : undefined}
        />
      </div>

      {clientRangeFiltersSupported ? (
        <>
          <RangePair
            legend={t('filter.price')}
            unit="AZN"
            from={asNumber(filters.priceFrom)}
            to={asNumber(filters.priceTo)}
            onFrom={(value) => {
              setFilter('cars', 'priceFrom', value);
              onAiEdit?.('price');
            }}
            onTo={(value) => {
              setFilter('cars', 'priceTo', value);
              onAiEdit?.('price');
            }}
            size={size}
            min={0}
            marked={aiMarks?.price}
            invalidMessage={t('index.filters.rangeInvalid')}
          />
          <RangePair
            legend={t('index.filters.year')}
            from={asNumber(filters.yearFrom)}
            to={asNumber(filters.yearTo)}
            onFrom={(value) => {
              setFilter('cars', 'yearFrom', value);
              onAiEdit?.('year');
            }}
            onTo={(value) => {
              setFilter('cars', 'yearTo', value);
              onAiEdit?.('year');
            }}
            size={size}
            min={1900}
            grouped={false}
            marked={aiMarks?.year}
            invalidMessage={t('index.filters.rangeInvalid')}
          />
        </>
      ) : null}

      <Input
        size={size}
        label={
          <span className="inline-flex items-center gap-1.5">
            {t('index.filters.city')}
            <Mark on={aiMarks?.city} />
          </span>
        }
        placeholder={t('filter.cityPlaceholder')}
        value={String(filters.city ?? '')}
        className={aiMarks?.city && String(filters.city ?? '').trim() ? '!border-ai-border' : ''}
        onChange={(event) => {
          setFilter('cars', 'city', event.target.value);
          onAiEdit?.('city');
        }}
      />

      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className={`${labelClass} mb-2 flex items-center gap-1.5`}>
          {t('filter.condition')}
          <Mark on={aiMarks?.condition} />
        </legend>
        <div className="flex flex-wrap gap-2">
          {conditions.map((option) => (
            <Chip
              key={option.value}
              selected={condition === option.value}
              onClick={() => {
                setFilter('cars', 'condition', option.value);
                onAiEdit?.('condition');
              }}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <button
        type="button"
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-[var(--radius)] border border-border-strong bg-transparent px-3 text-left text-[15px] font-semibold text-foreground transition hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-border"
        aria-expanded={advancedOpen}
        aria-controls="cars-advanced-filters"
        onClick={() => setAdvancedOpen((open) => !open)}
      >
        <span className="flex items-center gap-2">
          {t('index.filters.advanced')}
          {advancedCount > 0 ? (
            <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[12px] font-semibold text-primary-foreground">
              {advancedCount}
            </span>
          ) : null}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={`shrink-0 transition-transform ${advancedOpen ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      <div
        id="cars-advanced-filters"
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          advancedOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
        inert={advancedOpen ? undefined : true}
        aria-hidden={!advancedOpen}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex flex-col gap-3 pt-1">
            <div className="rounded-xl border border-border">
              <button
                type="button"
                className="flex min-h-11 w-full items-center justify-between gap-2 px-3 text-left text-[14px] font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-expanded={bodyTechOpen}
                onClick={() => setBodyTechOpen((open) => !open)}
              >
                {t('index.filters.groupBodyTech')}
                <ChevronDown
                  size={16}
                  strokeWidth={1.5}
                  className={`shrink-0 transition-transform ${bodyTechOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                  bodyTechOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="flex flex-col gap-4 px-3 pb-3">
                    <fieldset className="m-0 min-w-0 border-0 p-0">
                      <legend className={`${labelClass} mb-2 flex items-center gap-1.5`}>
                        {t('index.filters.fuel')}
                        <Mark on={aiMarks?.fuel} />
                      </legend>
                      <div className="flex flex-wrap gap-2">
                        {fuels.map((option) => (
                          <Chip
                            key={option.value}
                            selected={fuel.includes(option.value)}
                            onClick={() => {
                              toggleFilterValue('cars', 'fuel', option.value);
                              onAiEdit?.('fuel');
                            }}
                          >
                            {option.label}
                          </Chip>
                        ))}
                      </div>
                    </fieldset>
                    <fieldset className="m-0 min-w-0 border-0 p-0">
                      <legend className={`${labelClass} mb-2 flex items-center gap-1.5`}>
                        {t('index.filters.transmission')}
                        <Mark on={aiMarks?.transmission} />
                      </legend>
                      <div className="flex flex-wrap gap-2">
                        {transmissions.map((option) => (
                          <Chip
                            key={option.value}
                            selected={transmission.includes(option.value)}
                            onClick={() => {
                              toggleFilterValue('cars', 'transmission', option.value);
                              onAiEdit?.('transmission');
                            }}
                          >
                            {option.label}
                          </Chip>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {aiMarks && Object.values(aiMarks).some(Boolean) ? (
        <p className="flex items-start gap-1.5 text-[12px] leading-relaxed text-muted-foreground">
          <AiSparkle size={12} className="mt-0.5 shrink-0 text-ai-text-icon" />
          {t('searchAi.panelNote')}
        </p>
      ) : null}
    </div>
  );
}
