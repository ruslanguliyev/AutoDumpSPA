import { useTranslation } from 'react-i18next';

import { intlLocale } from '@/lib/format';
import { localizeText } from '@/lib/localizeText';

import { buildVehicleSpecRows, type VehicleDetailCar } from './buildVehicleSpecRows';

type Props = {
  car: VehicleDetailCar;
};

export function VehicleDetailSpecs({ car }: Props) {
  const { t, i18n } = useTranslation('vehicle');
  const locale = intlLocale(i18n.language);
  // The seller's comment follows the interface language once the listing has translations.
  const original = car.sellerNote ?? car.description ?? null;
  const localized = { ...car, sellerNote: localizeText(car.translations, i18n.language, 'description', original) };
  const { rows, ownerComment } = buildVehicleSpecRows(localized, t, locale);

  if (rows.length === 0 && !ownerComment) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5 [overflow-wrap:anywhere]">
      <h2 className="text-[20px] font-semibold tracking-tight text-foreground">{t('specs.title')}</h2>

      {rows.length > 0 ? (
        <dl className="mt-4 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          {rows.map((row, index) => (
            <div
              key={row.key}
              className={`flex items-baseline justify-between gap-4 border-b border-dashed border-border py-3 ${
                index < 2 ? 'sm:border-t sm:border-dashed' : ''
              }`}
            >
              <dt className="text-[13px] font-medium text-muted-foreground">{row.label}</dt>
              <dd className="text-right text-[15px] font-semibold text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {ownerComment ? (
        <div className="mt-5 border-t border-dashed border-border pt-5">
          <h3 className="text-[15px] font-semibold text-foreground">{t('specs.ownerComment')}</h3>
          <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-muted-foreground">
            {ownerComment}
          </p>
        </div>
      ) : null}
    </section>
  );
}

export default VehicleDetailSpecs;
