import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import AutoCard from '@/vehicles/components/AutoCardComponent/AutoCard';
import { getPromotedVehicles } from '@/vehicles/api/vehicles.api';
import type { PromotionTier } from '@/features/promotions/api/promotions.api';

/**
 * The paid block above a catalogue, or on the home page.
 *
 * It is kept apart from the ranked results and carries its own "advert" label, so a
 * reader is never asked to work out which cars are there because somebody paid.
 * The server rotates the pool on the clock rather than shuffling it, so every paying
 * listing gets the same share of the block over a day.
 */
export function PromotedVehicles({
  tier = 'VIP',
  limit = 4,
  className = '',
}: {
  tier?: PromotionTier;
  limit?: number;
  className?: string;
}) {
  const { t } = useTranslation('promote');
  const promoted = useQuery({
    queryKey: ['promotions', 'promotedVehicles', tier, limit],
    queryFn: () => getPromotedVehicles(tier, limit),
    // Matches the server's rotation step, so the block moves on by itself.
    staleTime: 10 * 60 * 1000,
  });

  const items = promoted.data ?? [];
  if (items.length === 0) return null;

  return (
    <section className={`py-8 ${className}`}>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-xl font-bold text-foreground">{t('block.title')}</h2>
        <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {t('block.label')}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((car: { id: string }) => (
          <AutoCard key={car.id} car={car} />
        ))}
      </div>
    </section>
  );
}

export default PromotedVehicles;
