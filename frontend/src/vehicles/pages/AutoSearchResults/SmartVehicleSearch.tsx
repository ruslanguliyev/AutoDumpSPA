import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useFilters, useFiltersStore } from '@/features/filters/store/useFiltersStore';
import {
  aiErrorCode,
  parseVehicleSearchQuery,
  useAiEnabled,
  type AiLanguageCode,
  type ParsedSearchFilters,
} from '@/features/ai/ai.api';
import { emptyAiMarks, type AiMarkKey, type AiMarks } from '@/features/ai/aiMarks';
import { formatNumber } from '@/lib/format';
import { translateVehicleEnum } from '@/lib/vehicleEnumLabels';
import { AiSparkle } from '@/shared/ui/AiSparkle/AiSparkle';
import Button from '@/shared/ui/button';
import { Chip } from '@/shared/ui/Chip';
import { cn } from '@/shared/utils/cn';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const text = (value: unknown) => (value == null ? '' : String(value).trim());

type SmartVehicleSearchProps = {
  resetKey: number;
  marks: AiMarks;
  onMarks: (marks: AiMarks) => void;
  active: boolean;
  onActiveChange: (active: boolean) => void;
};

export function SmartVehicleSearch({
  resetKey,
  marks,
  onMarks,
  active,
  onActiveChange,
}: SmartVehicleSearchProps) {
  const { t, i18n } = useTranslation(['vehicle', 'common']);
  const enabled = useAiEnabled();
  const filters = useFilters('cars');
  const setFilter = useFiltersStore((state) => state.setFilter);
  const setFilters = useFiltersStore((state) => state.setFilters);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [unrecognized, setUnrecognized] = useState(false);
  const [unapplied, setUnapplied] = useState<string[]>([]);
  const [understood, setUnderstood] = useState(false);
  const [errorCode, setErrorCode] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const onMarksRef = useRef(onMarks);
  onMarksRef.current = onMarks;

  useEffect(() => {
    setUnapplied([]);
    setUnderstood(false);
    setUnrecognized(false);
    onMarksRef.current(emptyAiMarks());
  }, [resetKey]);

  if (!enabled) return null;

  const language: AiLanguageCode = i18n.language.startsWith('en')
    ? 'EN'
    : i18n.language.startsWith('ru')
      ? 'RU'
      : 'AZ';
  const locale = language === 'EN' ? 'en-US' : language === 'AZ' ? 'az-AZ' : 'ru-RU';

  const examples = [t('searchAi.exampleBmw'), t('searchAi.exampleMercedes'), t('searchAi.exampleAuto')];

  const apply = (parsed: ParsedSearchFilters) => {
    const nextMarks: AiMarks = {
      brand: Boolean(parsed.brand),
      model: Boolean(parsed.model),
      price: parsed.priceFrom != null || parsed.priceTo != null,
      year: parsed.yearFrom != null || parsed.yearTo != null,
      city: Boolean(parsed.location),
      condition: Boolean(parsed.condition),
      fuel: Boolean(parsed.fuel),
      transmission: Boolean(parsed.transmission),
    };
    const any = Object.values(nextMarks).some(Boolean);
    if (!any) {
      setUnrecognized(true);
      setUnderstood(false);
      return;
    }
    setFilters('cars', {
      brand: parsed.brand ?? '',
      model: parsed.model ?? '',
      priceFrom: parsed.priceFrom ?? null,
      priceTo: parsed.priceTo ?? null,
      yearFrom: parsed.yearFrom ?? null,
      yearTo: parsed.yearTo ?? null,
      city: parsed.location ?? '',
      condition: parsed.condition ?? 'all',
      fuel: parsed.fuel ? [parsed.fuel] : [],
      transmission: parsed.transmission ? [parsed.transmission] : [],
    });
    onMarks(nextMarks);
    setUnrecognized(false);
    setUnderstood(true);
  };

  const search = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setErrorCode('');
    try {
      const result = await parseVehicleSearchQuery(trimmed.slice(0, 300), language, controller.signal);
      if (controller.signal.aborted) return;
      setUnapplied(result?.unapplied ?? []);
      apply(result?.filters ?? {});
    } catch (error) {
      if (controller.signal.aborted) return;
      setErrorCode(aiErrorCode(error));
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  const clearMark = (key: AiMarkKey) => onMarks({ ...marks, [key]: false });

  const chips: Array<{ key: string; label: string; mark: AiMarkKey; onRemove: () => void }> = [];
  if (text(filters.brand)) {
    chips.push({
      key: 'brand',
      mark: 'brand',
      label: t('searchAi.chipBrand', { value: text(filters.brand) }),
      onRemove: () => {
        setFilters('cars', { brand: '', model: '' });
        clearMark('brand');
        clearMark('model');
      },
    });
  }
  if (text(filters.model)) {
    chips.push({
      key: 'model',
      mark: 'model',
      label: t('searchAi.chipModel', { value: text(filters.model) }),
      onRemove: () => {
        setFilter('cars', 'model', '');
        clearMark('model');
      },
    });
  }
  const priceFrom = text(filters.priceFrom);
  const priceTo = text(filters.priceTo);
  if (priceFrom || priceTo) {
    const from = priceFrom ? formatNumber(Number(priceFrom), locale) : '';
    const to = priceTo ? formatNumber(Number(priceTo), locale) : '';
    const value = from && to ? `${from}–${to} AZN` : to ? t('searchAi.upTo', { value: `${to} AZN` }) : t('searchAi.from', { value: `${from} AZN` });
    chips.push({
      key: 'price',
      mark: 'price',
      label: t('searchAi.chipPrice', { value }),
      onRemove: () => {
        setFilters('cars', { priceFrom: null, priceTo: null });
        clearMark('price');
      },
    });
  }
  const yearFrom = text(filters.yearFrom);
  const yearTo = text(filters.yearTo);
  if (yearFrom || yearTo) {
    const value =
      yearFrom && yearTo
        ? `${yearFrom}–${yearTo}`
        : yearFrom
          ? t('searchAi.from', { value: yearFrom })
          : t('searchAi.upTo', { value: yearTo });
    chips.push({
      key: 'year',
      mark: 'year',
      label: t('searchAi.chipYear', { value }),
      onRemove: () => {
        setFilters('cars', { yearFrom: null, yearTo: null });
        clearMark('year');
      },
    });
  }
  const transmission = Array.isArray(filters.transmission) ? filters.transmission.map(String) : [];
  if (transmission.length) {
    chips.push({
      key: 'transmission',
      mark: 'transmission',
      label: t('searchAi.chipTransmission', {
        value: transmission.map((item) => (translateVehicleEnum(t, 'transmission', item) ?? item).toLocaleLowerCase(locale)).join(', '),
      }),
      onRemove: () => {
        setFilter('cars', 'transmission', []);
        clearMark('transmission');
      },
    });
  }
  const fuel = Array.isArray(filters.fuel) ? filters.fuel.map(String) : [];
  if (fuel.length) {
    chips.push({
      key: 'fuel',
      mark: 'fuel',
      label: t('searchAi.chipFuel', {
        value: fuel.map((item) => (translateVehicleEnum(t, 'fuel', item) ?? item).toLocaleLowerCase(locale)).join(', '),
      }),
      onRemove: () => {
        setFilter('cars', 'fuel', []);
        clearMark('fuel');
      },
    });
  }
  const city = text(filters.city);
  if (city) {
    chips.push({
      key: 'city',
      mark: 'city',
      label: t('searchAi.chipCity', { value: t(`searchAi.cities.${city}`, { defaultValue: city }) }),
      onRemove: () => {
        setFilter('cars', 'city', '');
        clearMark('city');
      },
    });
  }
  const condition = text(filters.condition);
  if (condition && condition !== 'all') {
    chips.push({
      key: 'condition',
      mark: 'condition',
      label: t('searchAi.chipCondition', {
        value: condition === 'new' ? t('filter.conditionNew') : t('filter.conditionUsed'),
      }),
      onRemove: () => {
        setFilter('cars', 'condition', 'all');
        clearMark('condition');
      },
    });
  }

  const showReading = active && understood && (chips.length > 0 || unapplied.length > 0);

  return (
    <section
      className={cn(
        'mb-6',
        active && 'rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5',
      )}
      aria-label={t('searchAi.region')}
    >
      <div
        role="radiogroup"
        aria-label={t('searchAi.modeLabel')}
        className="flex h-10 w-full overflow-hidden rounded-[var(--radius)] border border-border text-[14px] sm:w-auto sm:self-start"
      >
        <button
          type="button"
          role="radio"
          aria-checked={!active}
          className={cn('inline-flex h-10 flex-1 items-center justify-center px-4 sm:flex-none', focusRing, !active ? 'bg-card-muted font-semibold text-foreground' : 'text-muted-foreground')}
          onClick={() => onActiveChange(false)}
        >
          {t('searchAi.filters')}
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={active}
          className={cn(
            'inline-flex h-10 flex-1 items-center justify-center gap-2 border-l border-border px-4 sm:flex-none',
            focusRing,
            active ? 'bg-ai-surface font-semibold text-ai-text-soft' : 'text-muted-foreground',
          )}
          onClick={() => onActiveChange(true)}
        >
          <AiSparkle size={14} />
          {t('searchAi.smart')}
        </button>
      </div>

      {active ? (
        <div className="mt-4 flex flex-col gap-4">
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void search(query);
            }}
          >
            <div className="flex min-h-14 flex-1 items-center gap-3 rounded-xl border border-ai-border-strong bg-background px-4">
              <AiSparkle size={20} className="shrink-0 text-ai-text-icon" />
              <label className="sr-only" htmlFor="smart-vehicle-search">
                {t('searchAi.inputLabel')}
              </label>
              <input
                id="smart-vehicle-search"
                value={query}
                maxLength={300}
                onChange={(event) => setQuery(event.target.value)}
                className="h-12 min-w-0 flex-1 bg-transparent text-[16px] text-foreground outline-none placeholder:text-subtle-foreground"
                placeholder={t('searchAi.placeholder')}
              />
            </div>
            <Button type="submit" className="!h-11 w-full sm:!h-14 sm:w-auto" disabled={loading || !query.trim()} aria-busy={loading}>
              {loading ? t('searchAi.searching') : t('searchAi.find')}
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-muted-foreground">{t('searchAi.try')}</span>
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                className={cn(
                  'inline-flex h-10 items-center rounded-full border border-border bg-transparent px-3.5 text-[13px] text-foreground',
                  focusRing,
                )}
                onClick={() => void search(example)}
              >
                {example}
              </button>
            ))}
          </div>

          <div aria-live="polite" className="flex flex-col gap-2.5">
            {errorCode ? (
              <p className="text-[14px] text-destructive">
                {errorCode === 'RATE_LIMITED'
                  ? t('searchAi.errorRate')
                  : errorCode === 'UNAVAILABLE'
                    ? t('searchAi.errorUnavailable')
                    : t('searchAi.errorGeneric')}
              </p>
            ) : null}
            {unrecognized ? <p className="text-[14px] text-foreground">{t('searchAi.unrecognized')}</p> : null}
            {showReading ? (
              <>
                <div className="flex items-center gap-2 border-t border-border pt-4 text-[13px] font-semibold text-ai-text">
                  <AiSparkle size={13} />
                  {t('searchAi.understood')}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {chips.map((chip) => (
                    <Chip key={chip.key} tone="ai" onRemove={chip.onRemove} removeLabel={t('searchAi.remove')}>
                      {chip.label}
                    </Chip>
                  ))}
                  {unapplied.map((item, index) => (
                    <Chip key={`${item}-${index}`} tone="dashed">
                      {t('searchAi.unapplied', { value: item })}
                    </Chip>
                  ))}
                  <button
                    type="button"
                    className={cn('text-[13px] text-primary-text', focusRing)}
                    onClick={() => {
                      setFilters('cars', {
                        brand: '',
                        model: '',
                        priceFrom: null,
                        priceTo: null,
                        yearFrom: null,
                        yearTo: null,
                        city: '',
                        condition: 'all',
                        fuel: [],
                        transmission: [],
                      });
                      setUnapplied([]);
                      setUnderstood(false);
                      onMarks(emptyAiMarks());
                    }}
                  >
                    {t('searchAi.reset')}
                  </button>
                </div>
                {unapplied.length > 0 ? (
                  <p className="text-[12px] text-muted-foreground">{t('searchAi.unappliedHint')}</p>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
