import { useTranslation } from 'react-i18next';

import { useAddItemStore } from '@/features/addItem/store/useAddItemStore';

const inputClass =
  'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const VehicleStep = () => {
  const { t } = useTranslation('addItem');
  const draft = useAddItemStore((state) => state.draft);
  const setVehicleField = useAddItemStore((state) => state.setVehicleField);

  if (!draft?.vehicle) return null;

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
            value={draft.vehicle.vin}
            onChange={(event) => setVehicleField('vin', event.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.year')}
          </label>
          <input
            className={inputClass}
            placeholder={t('form.yearPlaceholder')}
            value={draft.vehicle.year}
            onChange={(event) => setVehicleField('year', event.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.brand')}
          </label>
          <input
            className={inputClass}
            placeholder={t('form.brandPlaceholder')}
            value={draft.vehicle.brand}
            onChange={(event) => setVehicleField('brand', event.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.model')}
          </label>
          <input
            className={inputClass}
            placeholder={t('form.modelPlaceholder')}
            value={draft.vehicle.model}
            onChange={(event) => setVehicleField('model', event.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.trim')}
          </label>
          <input
            className={inputClass}
            placeholder={t('form.trimPlaceholder')}
            value={draft.vehicle.trim}
            onChange={(event) => setVehicleField('trim', event.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.mileage')}
          </label>
          <input
            className={inputClass}
            placeholder={t('form.mileagePlaceholder')}
            value={draft.vehicle.mileage}
            onChange={(event) => setVehicleField('mileage', event.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.transmission')}
          </label>
          <input
            className={inputClass}
            placeholder={t('form.transmissionPlaceholder')}
            value={draft.vehicle.transmission}
            onChange={(event) => setVehicleField('transmission', event.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.fuel')}
          </label>
          <input
            className={inputClass}
            placeholder={t('form.fuelPlaceholder')}
            value={draft.vehicle.fuel}
            onChange={(event) => setVehicleField('fuel', event.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.drivetrain')}
          </label>
          <input
            className={inputClass}
            placeholder={t('form.drivetrainPlaceholder')}
            value={draft.vehicle.drivetrain}
            onChange={(event) => setVehicleField('drivetrain', event.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default VehicleStep;
