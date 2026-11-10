import { useTranslation } from 'react-i18next';

import {
  formatEngineDisplacement,
  formatHorsepower,
  formatMileage,
  formatPrice,
  formatYear,
  intlLocale,
} from '@/lib/format';
import { splitEngineSummary, translateVehicleEnum } from '@/lib/vehicleEnumLabels';

type Props = {
  title: string;
  year?: number | string | null;
  mileage?: number | null;
  fuel?: string | null;
  transmission?: string | null;
  engine?: string | null;
  engineVolume?: number | null;
  power?: number | null;
  price?: number | null;
  currency?: string;
  priceSuffix?: string;
};

export function VehicleDetailSummary({
  title,
  year,
  mileage,
  fuel,
  transmission,
  engine,
  engineVolume,
  power,
  price,
  currency = 'AZN',
  priceSuffix,
}: Props) {
  const { t, i18n } = useTranslation('vehicle');
  const locale = intlLocale(i18n.language);

  const fuelLabel = translateVehicleEnum(t, 'fuel', fuel);
  const transmissionLabel = translateVehicleEnum(t, 'transmission', transmission);
  const engineBits = [
    formatEngineDisplacement(engineVolume, locale),
    formatHorsepower(power, locale),
  ].filter(Boolean);
  const subtitle = [
    ...(engineBits.length ? engineBits : splitEngineSummary(engine)),
    transmissionLabel,
  ]
    .filter(Boolean)
    .join(' · ');

  const tiles = [
    { label: t('summary.year'), value: formatYear(year) },
    { label: t('summary.mileage'), value: mileage != null ? formatMileage(mileage, locale) : null },
    { label: t('summary.fuelType'), value: fuelLabel },
    { label: t('summary.transmission'), value: transmissionLabel },
  ].filter((tile) => tile.value != null && String(tile.value).trim() !== '' && tile.value !== '—');

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5 [overflow-wrap:anywhere]">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground md:text-[30px]">{title}</h1>
          {subtitle ? <p className="mt-1 text-[15px] text-muted-foreground">{subtitle}</p> : null}
        </div>
        <p className="shrink-0 text-[28px] font-bold leading-none text-primary-text md:text-[30px]">
          {formatPrice(price, currency, locale)}
          {priceSuffix ? (
            <span className="ml-1 text-[15px] font-medium text-muted-foreground">{priceSuffix}</span>
          ) : null}
        </p>
      </header>

      {tiles.length > 0 ? (
        <dl className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className="flex min-h-11 flex-col justify-center rounded-[var(--radius)] border border-dashed border-border-strong px-3 py-2 dark:border-border"
            >
              <dt className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                {tile.label}
              </dt>
              <dd className="mt-1 text-[15px] font-semibold text-foreground">{tile.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </article>
  );
}

export default VehicleDetailSummary;
