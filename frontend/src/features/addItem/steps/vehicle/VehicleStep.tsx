import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
  CAR_BRANDS,
  isModelAllowedForBrand,
  isTrimAllowedForVehicle,
} from '@/features/addItem/constants/vehicleCatalog';
import { useVehicleCatalogOptions } from '@/features/addItem/hooks/useVehicleCatalogOptions';
import { useAddItemStore } from '@/features/addItem/store/useAddItemStore';
import { isValidVin } from '@/features/addItem/utils/validateDraft';
import {
  fetchGenerations,
  getGenerationPhotoUrl,
  type CarGeneration,
} from '@/lib/carGenerations';
import {
  fetchCarSpecs,
  mapDrivetrain,
  mapFuelType,
  mapTransmission,
} from '@/lib/carSpecs';
import { Combobox } from '@/shared/ui/Combobox';
import { Select } from '@/shared/ui/Select';
import { cn } from '@/shared/utils/cn';

const inputClass =
  'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const YEAR_OPTIONS = Array.from({ length: 2026 - 1990 + 1 }, (_, i) => String(2026 - i));

const TRANSMISSION_OPTIONS = [
  { value: 'Automatic' },
  { value: 'Manual' },
  { value: 'Semi-Automatic' },
] as const;

const FUEL_OPTIONS = [
  { value: 'Petrol' },
  { value: 'Diesel' },
  { value: 'Electric' },
  { value: 'Hybrid' },
  { value: 'Gas' },
] as const;

const DRIVETRAIN_OPTIONS = [
  { value: 'FWD' },
  { value: 'RWD' },
  { value: 'AWD' },
] as const;


const INTEGER_RE = /^\d*$/;
/** Litres: digits with one optional point and up to two decimals ("2", "2.", "1.6"). */
const DECIMAL_RE = /^\d*\.?\d{0,2}$/;

/**
 * Number-only text field. A keystroke or paste with anything else is refused:
 * the value stays as it was, the box shakes, turns red and says why.
 */
function NumericField({
  id,
  label,
  value,
  onChange,
  decimal = false,
  placeholder,
  disabled,
  suffix,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  decimal?: boolean;
  placeholder?: string;
  disabled?: boolean;
  suffix?: ReactNode;
}) {
  const { t } = useTranslation('addItem');
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [rejected, setRejected] = useState(false);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const reject = () => {
    setRejected(true);
    const el = inputRef.current;
    if (el) {
      // Restart the animation even when letters keep coming.
      el.classList.remove('shake-x');
      void el.offsetWidth;
      el.classList.add('shake-x');
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setRejected(false), 2500);
  };

  const errorId = `${id}-error`;

  return (
    <div>
      <label
        className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          inputMode={decimal ? 'decimal' : 'numeric'}
          autoComplete="off"
          className={cn(inputClass, 'h-11', rejected && '!border-destructive ring-2 ring-destructive/40 focus-visible:ring-destructive!')}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          aria-invalid={rejected ? true : undefined}
          aria-describedby={rejected ? errorId : undefined}
          onAnimationEnd={(event) => event.currentTarget.classList.remove('shake-x')}
          onChange={(event) => {
            const next = decimal ? event.target.value.replace(',', '.') : event.target.value;
            if ((decimal ? DECIMAL_RE : INTEGER_RE).test(next)) {
              if (rejected) setRejected(false);
              onChange(next);
            } else {
              reject();
            }
          }}
        />
        {suffix}
      </div>
      {rejected ? (
        <p id={errorId} role="alert" className="mt-1 text-xs text-destructive">
          {t('validation.digitsOnly')}
        </p>
      ) : null}
    </div>
  );
}

const VehicleStep = () => {
  const { t } = useTranslation('addItem');
  const draft = useAddItemStore((state) => state.draft);
  const setVehicleField = useAddItemStore((state) => state.setVehicleField);
  const [specsLoading, setSpecsLoading] = useState(false);
  const [specsError, setSpecsError] = useState<string | null>(null);
  const [generations, setGenerations] = useState<CarGeneration[]>([]);
  const [selectedGen, setSelectedGen] = useState<CarGeneration | null>(null);
  const [gensLoading, setGensLoading] = useState(false);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const vehicle = draft?.vehicle;
  // Primitives for effect dependencies: `vehicle` is a new object after every
  // setVehicleField, so depending on it made the reset effect re-trigger itself.
  const hasVehicle = Boolean(vehicle);
  const vBrand = vehicle?.brand ?? '';
  const vModel = vehicle?.model ?? '';
  const vYear = vehicle?.year ?? '';

  const brandOptions = useMemo(
    () => CAR_BRANDS.map((b) => ({ value: b, label: b })),
    []
  );

  const { modelOptions, trimOptions, modelDisabled, trimDisabled } =
    useVehicleCatalogOptions(vehicle);

  const setBrandAndResetDependents = (brand: string) => {
    useAddItemStore.setState((s) => {
      if (!s.draft?.vehicle) return {};
      return {
        draft: {
          ...s.draft,
          vehicle: {
            ...s.draft.vehicle,
            brand,
            model: '',
            trim: '',
          },
        },
        dirty: true,
        saveStatus: 'idle' as const,
      };
    });
  };

  const setModelAndResetTrim = (model: string) => {
    useAddItemStore.setState((s) => {
      if (!s.draft?.vehicle) return {};
      return {
        draft: {
          ...s.draft,
          vehicle: {
            ...s.draft.vehicle,
            model,
            trim: '',
          },
        },
        dirty: true,
        saveStatus: 'idle' as const,
      };
    });
  };

  useEffect(() => {
    if (!hasVehicle) return;
    setVehicleField('displacement', '');
    setVehicleField('horsepower', '');
    setVehicleField('fuel', '');
    setVehicleField('transmission', '');
    setVehicleField('drivetrain', '');
    setSpecsError(null);
    setGenerations([]);
    setSelectedGen(null);
    setImgErrors(new Set());
  }, [hasVehicle, vBrand, vModel, setVehicleField]);

  useEffect(() => {
    if (!hasVehicle) return;
    const brand = vBrand.trim();
    const model = vModel.trim();
    const year = vYear.trim();
    if (!brand || !model || !year) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setSpecsLoading(true);
      setSpecsError(null);
      try {
        const specs = await fetchCarSpecs(brand, model, year);
        if (cancelled) return;
        if (!specs) {
          setSpecsError(t('vehicleForm.specsNotFound'));
          setSpecsLoading(false);
          return;
        }

        if (specs.displacement != null) {
          setVehicleField('displacement', String(specs.displacement));
        }
        if (specs.horsepower != null) {
          setVehicleField('horsepower', String(specs.horsepower));
        }
        if (specs.fuelType) {
          setVehicleField('fuel', mapFuelType(specs.fuelType));
        }
        if (specs.transmission) {
          setVehicleField('transmission', mapTransmission(specs.transmission));
        }
        if (specs.drive) {
          setVehicleField('drivetrain', mapDrivetrain(specs.drive));
        }
      } catch {
        if (!cancelled) {
          setSpecsError(t('vehicleForm.specsNotFound'));
        }
      } finally {
        if (!cancelled) {
          setSpecsLoading(false);
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [hasVehicle, vBrand, vModel, vYear, setVehicleField, t]);

  useEffect(() => {
    if (!hasVehicle) return;
    const brand = vBrand.trim();
    const model = vModel.trim();
    setImgErrors(new Set());
    if (!brand || !model) {
      setGenerations([]);
      setSelectedGen(null);
      return;
    }

    let cancelled = false;
    setGensLoading(true);
    fetchGenerations(brand, model)
      .then((gens) => {
        if (cancelled) return;
        setGenerations(gens);
        setGensLoading(false);

        const currentYear = parseInt(vYear, 10);
        if (Number.isFinite(currentYear) && gens.length) {
          const match = gens.find(
            (g) => g.yearFrom <= currentYear && (g.yearTo === null || g.yearTo >= currentYear)
          );
          if (match) setSelectedGen(match);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGenerations([]);
          setSelectedGen(null);
          setGensLoading(false);
        }
      });

    return () => {
      cancelled = true;
      setImgErrors(new Set());
    };
  }, [hasVehicle, vBrand, vModel, vYear]);

  if (!vehicle) return null;

  const v = vehicle;

  const modelError =
    v.model && !isModelAllowedForBrand(v.brand, v.model)
      ? t('validation.invalidVehicleModel')
      : undefined;

  const trimError =
    v.trim && !isTrimAllowedForVehicle(v.brand, v.model, v.trim)
      ? t('validation.invalidVehicleTrim')
      : undefined;

  const vin = v.vin ?? '';
  const vinError = vin && !isValidVin(vin) ? t('validation.invalidVin') : undefined;
  // Ask for the year once the car itself is chosen, not on an untouched form.
  const yearMissing = Boolean(v.brand) && !v.year;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">{t('form.vehicleDetailsTitle')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('form.vehicleDetailsHint')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            htmlFor="vehicle-year"
          >
            {t('form.year')}
          </label>
          <select
            id="vehicle-year"
            className={cn(inputClass, 'h-11', !v.year && 'text-subtle-foreground', yearMissing && 'border-destructive')}
            value={v.year}
            aria-invalid={yearMissing ? true : undefined}
            aria-describedby={yearMissing ? 'vehicle-year-error' : undefined}
            onChange={(event) => setVehicleField('year', event.target.value)}
          >
            <option value="">{t('form.yearPlaceholder')}</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          {yearMissing ? (
            <p id="vehicle-year-error" className="mt-1 text-xs text-destructive">
              {t('validation.yearRequired')}
            </p>
          ) : null}
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.mileage')}
          </label>
          <input
            type="number"
            min={0}
            max={999999}
            className={inputClass}
            placeholder={t('form.mileagePlaceholder')}
            value={v.mileage}
            onChange={(event) => setVehicleField('mileage', event.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            htmlFor="vehicle-vin"
          >
            {t('form.vin')}
          </label>
          <input
            id="vehicle-vin"
            className={cn(inputClass, 'uppercase tracking-wide', vinError && 'border-destructive')}
            placeholder={t('form.vinPlaceholder')}
            value={vin}
            maxLength={17}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={vinError ? true : undefined}
            aria-describedby="vehicle-vin-hint"
            onChange={(event) =>
              setVehicleField(
                'vin',
                event.target.value.toUpperCase().replace(/\s+/g, '').slice(0, 17),
              )
            }
          />
          <div className="mt-1 flex items-start justify-between gap-3">
            <p
              id="vehicle-vin-hint"
              className={cn('text-xs', vinError ? 'text-destructive' : 'text-muted-foreground')}
            >
              {vinError ?? t('form.vinHint')}
            </p>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{vin.length}/17</span>
          </div>
        </div>
        <Select
          id="vehicle-brand"
          label={t('form.brand')}
          value={v.brand ?? ''}
          onChange={(event) => setBrandAndResetDependents(event.target.value)}
          options={brandOptions}
          placeholder={t('form.brandPlaceholder')}
        />
        <div>
          <label
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            htmlFor="vehicle-model"
          >
            {t('form.model')}
          </label>
          <Combobox
            id="vehicle-model"
            value={v.model ?? ''}
            onChange={setModelAndResetTrim}
            options={modelOptions}
            placeholder={t('form.modelPlaceholder')}
            searchPlaceholder={t('form.combobox.searchModel')}
            emptyText={t('form.combobox.emptyResults')}
            disabled={modelDisabled}
            error={modelError}
            aria-label={t('form.model')}
          />
        </div>
        {generations.length > 0 ? (
          <div className="md:col-span-2">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t('vehicleForm.generation')}
            </label>
            {gensLoading ? (
              <p className="text-xs text-muted-foreground animate-pulse">{t('vehicleForm.loadingGenerations')}</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {generations.map((gen) => {
                  const midYear = gen.yearTo
                    ? Math.floor((gen.yearFrom + gen.yearTo) / 2)
                    : gen.yearFrom + 1;
                  const isSelected = selectedGen?.generationName === gen.generationName;
                  return (
                    <button
                      key={gen.generationName}
                      type="button"
                      onClick={() => {
                        setSelectedGen(gen);
                        setVehicleField('generation', gen.generationName);
                        const curYear = parseInt(v.year, 10);
                        const inRange =
                          Number.isFinite(curYear) &&
                          curYear >= gen.yearFrom &&
                          (gen.yearTo === null || curYear <= gen.yearTo);
                        if (!inRange) setVehicleField('year', String(gen.yearFrom));
                      }}
                      className={cn(
                        'relative overflow-hidden rounded-xl border-2 transition-all',
                        isSelected ? 'border-primary shadow-md' : 'border-border hover:border-primary/50'
                      )}
                    >
                      {!imgErrors.has(gen.generationName) ? (
                        <img
                          src={getGenerationPhotoUrl(v.brand, v.model, midYear)}
                          alt={gen.generationName}
                          className="h-28 w-full object-cover"
                          onError={() =>
                            setImgErrors((prev) => new Set(prev).add(gen.generationName))
                          }
                        />
                      ) : (
                        <div className="flex h-28 w-full items-center justify-center bg-muted">
                          <span className="text-3xl opacity-30">🚗</span>
                        </div>
                      )}
                      <div className={cn('p-2 text-left', isSelected ? 'bg-primary/10' : 'bg-card')}>
                        {isSelected ? (
                          <span className="mb-1 inline-block rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                            ✓
                          </span>
                        ) : null}
                        <p className="text-xs font-semibold text-foreground leading-tight">
                          {gen.generationName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {gen.yearFrom} - {gen.yearTo ?? t('vehicleForm.present')}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}
        <NumericField
          id="vehicle-engine-volume"
          label={t('vehicleForm.engineVolume')}
          decimal
          placeholder={specsLoading ? t('vehicleForm.loading') : '2.0'}
          value={v.displacement ?? ''}
          onChange={(value) => setVehicleField('displacement', value)}
          disabled={specsLoading}
          suffix={
            specsLoading ? (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground animate-pulse">
                ⏳
              </span>
            ) : null
          }
        />
        <NumericField
          id="vehicle-power"
          label={t('vehicleForm.power')}
          placeholder={specsLoading ? t('vehicleForm.loading') : '150'}
          value={v.horsepower ?? ''}
          onChange={(value) => setVehicleField('horsepower', value)}
          disabled={specsLoading}
        />
        {specsError ? (
          <p className="md:col-span-2 text-xs text-muted-foreground">{specsError}</p>
        ) : null}
        <div className="md:col-span-2">
          <label
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            htmlFor="vehicle-trim"
          >
            {t('form.trim')}
          </label>
          <Combobox
            id="vehicle-trim"
            value={v.trim ?? ''}
            onChange={(trimVal) => setVehicleField('trim', trimVal)}
            options={trimOptions}
            placeholder={t('form.trimPlaceholder')}
            searchPlaceholder={t('form.combobox.searchTrim')}
            emptyText={t('form.combobox.emptyResults')}
            disabled={trimDisabled || trimOptions.length === 0}
            error={trimError}
            aria-label={t('form.trim')}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.transmission')}
          </label>
          <select
            className={inputClass}
            value={v.transmission ?? ''}
            onChange={(event) => setVehicleField('transmission', event.target.value)}
          >
            <option value="">{t('form.transmissionPlaceholder')}</option>
            {TRANSMISSION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t('vehicleForm.transmission.' + opt.value)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.fuel')}
          </label>
          <select
            className={inputClass}
            value={v.fuel ?? ''}
            onChange={(event) => setVehicleField('fuel', event.target.value)}
          >
            <option value="">{t('form.fuelPlaceholder')}</option>
            {FUEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t('vehicleForm.fuel.' + opt.value)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.drivetrain')}
          </label>
          <select
            className={inputClass}
            value={v.drivetrain ?? ''}
            onChange={(event) => setVehicleField('drivetrain', event.target.value)}
          >
            <option value="">{t('form.drivetrainPlaceholder')}</option>
            {DRIVETRAIN_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t('vehicleForm.drivetrain.' + opt.value)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default VehicleStep;
