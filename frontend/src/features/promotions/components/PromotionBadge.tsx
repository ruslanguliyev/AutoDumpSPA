import { Crown, Gem } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { PromotionTier } from '@/features/promotions/api/promotions.api';

const STYLES: Record<string, string> = {
  VIP: 'bg-rose-600 text-white',
  PREMIUM: 'bg-amber-500 text-white',
};

/**
 * The mark on a promoted card.
 *
 * Paid placement is always labelled. A reader who cannot tell an advertisement from a
 * result has been misled, and the label costs us nothing.
 */
export function PromotionBadge({
  tier,
  className = '',
}: {
  tier: PromotionTier | null | undefined;
  className?: string;
}) {
  const { t } = useTranslation('promote');
  if (tier !== 'VIP' && tier !== 'PREMIUM') return null;
  const Icon = tier === 'PREMIUM' ? Crown : Gem;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none ${STYLES[tier]} ${className}`}
      title={t('badge.explain')}
    >
      <Icon size={12} aria-hidden="true" />
      {t(`tier.${tier}.name`)}
      <span className="sr-only"> · {t('badge.explain')}</span>
    </span>
  );
}

export default PromotionBadge;
