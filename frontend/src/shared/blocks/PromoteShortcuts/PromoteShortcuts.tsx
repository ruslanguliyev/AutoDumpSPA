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
  BUMP: 'text-promo-bump',
  VIP: 'text-promo-vip',
  PREMIUM: 'text-promo-premium',
} as const;
const TILE = {
  BUMP: 'bg-promo-bump-fill/15',
  VIP: 'bg-promo-vip-fill/15',
  PREMIUM: 'bg-promo-premium-fill/15',
} as const;

type Props = {
  targetType: PromotionTarget;
  targetId: string | undefined;
  className?: string;
};

/** Three compact promote rows — design/components.md. */
export function PromoteShortcuts({ targetType, targetId, className = '' }: Props) {
  const { t } = useTranslation('promote');
  const quote = usePromotionQuote(targetType, targetId);
  const packages = quote.data?.packages ?? [];

  if (packages.length === 0 || !targetId) return null;

  return (
    <div className={`space-y-3 ${className}`.trim()}>
      <p className="text-[13px] text-muted-foreground">{t('shortcutsCaption')}</p>
      <ul className="flex flex-col gap-2">
        {TIERS.map((tier) => {
          const from = packages
            .filter((p) => p.tier === tier)
            .reduce<number | null>((best, p) => (best === null || p.amount < best ? p.amount : best), null);
          if (from === null) return null;
          const Icon = ICON[tier];
          return (
            <li key={tier}>
              <Link
                to={`${promotePath(targetType, targetId)}?tier=${tier}`}
                className="flex min-h-11 items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2 transition hover:border-border-strong hover:bg-foreground/5"
              >
                <span
                  className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[var(--radius)] ${TILE[tier]}`}
                >
                  <Icon size={18} strokeWidth={1.5} className={ACCENT[tier]} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-[15px] font-semibold ${ACCENT[tier]}`}>{t(`tier.${tier}.name`)}</span>
                  <span className="block text-[13px] text-muted-foreground">
                    {t('fromPrice', { price: formatQapik(from, quote.data?.currency ?? 'AZN') })}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default PromoteShortcuts;
