import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  CAR_BRANDS,
  isModelAllowedForBrand,
  isTrimAllowedForVehicle,
} from '@/features/addItem/constants/vehicleCatalog';
import { useVehicleCatalogOptions } from '@/features/addItem/hooks/useVehicleCatalogOptions';
import { useAddItemStore } from '@/features/addItem/store/useAddItemStore';
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
import { FormNativeSelect } from '@/shared/ui/FormNativeSelect';
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

  if (!draft?.vehicle) return null;

  const v = draft.vehicle;

  const modelError =
    v.model && !isModelAllowedForBrand(v.brand, v.model)
      ? t('validation.invalidVehicleModel')
      : undefined;

  const trimError =
    v.trim && !isTrimAllowedForVehicle(v.brand, v.model, v.trim)
      ? t('validation.invalidVehicleTrim')
      : undefined;

  useEffect(() => {
    setVehicleField('displacement', '');
    setVehicleField('horsepower', '');
    setVehicleField('fuel', '');
    setVehicleField('transmission', '');
    setVehicleField('drivetrain', '');
    setSpecsError(null);
    setGenerations([]);
    setSelectedGen(null);
    setImgErrors(new Set());
  }, [v.brand, v.model, setVehicleField]);

  useEffect(() => {
    const brand = v.brand?.trim();
    const model = v.model?.trim();
    const year = v.year?.trim();
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
  }, [v.brand, v.model, v.year, setVehicleField]);

  useEffect(() => {
    const brand = v.brand?.trim();
    const model = v.model?.trim();
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

        const currentYear = parseInt(v.year, 10);
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
  }, [v.brand, v.model, v.year]);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow)]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">{t('form.vehicleDetailsTitle')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('form.vehicleDetailsHint')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.vin')}
          </label>
          <input
            className={inputClass}
            placeholder={t('form.vinPlaceholder')}
            value={v.vin}
            onChange={(event) => setVehicleField('vin', event.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.year')}
          </label>
          <select
            className={inputClass}
            value={v.year}
            onChange={(event) => setVehicleField('year', event.target.value)}
          >
            <option value="">{t('form.yearPlaceholder')}</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            htmlFor="vehicle-brand"
          >
            {t('form.brand')}
          </label>
          <FormNativeSelect
            id="vehicle-brand"
            value={v.brand ?? ''}
            onChange={(brand) => setBrandAndResetDependents(brand)}
            options={brandOptions}
            placeholder={t('form.brandPlaceholder')}
            aria-label={t('form.brand')}
          />
        </div>
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
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('vehicleForm.engineVolume')}
          </label>
          <div className="relative">
            <input
              className={inputClass}
              placeholder={specsLoading ? t('vehicleForm.loading') : '2.0'}
              value={v.displacement ?? ''}
              onChange={(event) => setVehicleField('displacement', event.target.value)}
              disabled={specsLoading}
            />
            {specsLoading ? (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground animate-pulse">
                ⏳
              </span>
            ) : null}
          </div>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('vehicleForm.power')}
          </label>
          <input
            className={inputClass}
            placeholder={specsLoading ? t('vehicleForm.loading') : '150'}
            value={v.horsepower ?? ''}
            onChange={(event) => setVehicleField('horsepower', event.target.value)}
            disabled={specsLoading}
          />
        </div>
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
