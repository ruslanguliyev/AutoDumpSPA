import type { TFunction } from 'i18next';

import { formatDate, formatMileage } from '@/lib/format';
import { translateVehicleEnum } from '@/lib/vehicleEnumLabels';

export type VehicleDetailCar = {
  brand?: string | null;
  model?: string | null;
  version?: string | null;
  code?: string | null;
  bodyType?: string | null;
  year?: number | string | null;
  engine?: string | null;
  transmission?: string | null;
  drive?: string | null;
  mileage?: number | null;
  location?: string | null;
  ownersCount?: number | null;
  owners?: number | null;
  isFinanced?: boolean | null;
  isCreditAvailable?: boolean;
  postedAt?: string | null;
  views?: number | null;
  sellerNote?: string | null;
  description?: string | null;
};

const hasValue = (value: unknown) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  return true;
};

export function buildVehicleSpecRows(
  car: VehicleDetailCar,
  t: TFunction<'vehicle'>,
  locale: string,
) {
  const bodyType = car.bodyType
    ? t(`form.vehicleCategories.${car.bodyType}`, { ns: 'addItem', defaultValue: car.bodyType })
    : null;

  const owners = car.ownersCount ?? car.owners;
  const ownerComment = car.sellerNote ?? car.description;

  const rows = [
    { key: 'brand', label: t('specs.brand'), value: car.brand },
    { key: 'model', label: t('specs.model'), value: car.model },
    { key: 'version', label: t('specs.version'), value: car.version },
    { key: 'code', label: t('specs.code'), value: car.code },
    { key: 'bodyType', label: t('specs.bodyType'), value: bodyType },
    { key: 'year', label: t('specs.year'), value: car.year != null ? String(car.year) : null },
    { key: 'engine', label: t('specs.engine'), value: car.engine },
    {
      key: 'transmission',
      label: t('specs.transmission'),
      value: translateVehicleEnum(t, 'transmission', car.transmission),
    },
    { key: 'drive', label: t('specs.drive'), value: car.drive },
    {
      key: 'mileage',
      label: t('specs.mileage'),
      value: car.mileage != null ? formatMileage(car.mileage, locale) : null,
    },
    { key: 'location', label: t('specs.location'), value: car.location },
    {
      key: 'owners',
      label: t('specs.owners'),
      value: owners != null ? String(owners) : null,
    },
    { key: 'postedAt', label: t('specs.postedAt'), value: formatDate(car.postedAt, locale) },
    {
      key: 'views',
      label: t('specs.views'),
      value: car.views != null ? String(car.views) : null,
    },
  ];

  return {
    rows: rows.filter((row) => hasValue(row.value)),
    ownerComment: hasValue(ownerComment) ? String(ownerComment).trim() : null,
  };
}
