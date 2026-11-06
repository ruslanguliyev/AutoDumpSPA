import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUp, Crown, Gem } from 'lucide-react';

import { formatQapik } from '@/features/promotions/api/promotions.api';
import type { PromotionTarget, PromotionTier } from '@/features/promotions/api/promotions.api';
import { usePromotionQuote } from '@/features/promotions/hooks/usePromotions';
import { promotePath } from '@/features/promotions/pages/PromotePage';

const TIERS: PromotionTier[] = ['BUMP', 'VIP', 'PREMIUM'];
const ICON = { BUMP: ArrowUp, VIP: Gem, PREMIUM: Crown } as const;
const ACCENT = {
  BUMP: 'text-emerald-600',
  VIP: 'text-rose-600',
  PREMIUM: 'text-amber-500',
} as const;

/**
 * The three shortcuts shown on a listing or profile page.
 *
 * Anyone can use them, signed in or not: a dealer paying for a customer's advert is
 * normal here, and paying grants no rights over the listing.
 */
export function PromoteInline({
  targetType,
  targetId,
  className = '',
}: {
  targetType: PromotionTarget;
  targetId: string | undefined;
  className?: string;
}) {
  const { t } = useTranslation('promote');
  const quote = usePromotionQuote(targetType, targetId);
  const packages = quote.data?.packages ?? [];
  if (packages.length === 0 || !targetId) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {TIERS.map((tier) => {
        const from = packages
          .filter((p) => p.tier === tier)
          .reduce<number | null>((best, p) => (best === null || p.amount < best ? p.amount : best), null);
        if (from === null) return null;
        const Icon = ICON[tier];
        return (
          <Link
            key={tier}
            to={`${promotePath(targetType, targetId)}?tier=${tier}`}
            className="flex min-w-[112px] flex-col gap-0.5 rounded-xl border border-border bg-card px-3 py-2 transition hover:border-primary/50 hover:bg-accent"
          >
            <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Icon size={15} className={ACCENT[tier]} aria-hidden="true" />
              {t(`tier.${tier}.name`)}
            </span>
            <span className="text-xs text-muted-foreground">
              {t('fromPrice', { price: formatQapik(from, quote.data?.currency ?? 'AZN') })}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export default PromoteInline;
