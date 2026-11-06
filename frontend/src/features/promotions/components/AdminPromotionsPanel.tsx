import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { formatQapik } from '@/features/promotions/api/promotions.api';
import { PromotionBadge } from '@/features/promotions/components/PromotionBadge';
import {
  useAdminPromotions,
  useRevokePromotion,
} from '@/features/promotions/hooks/usePromotions';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';

/** Everything running or finished, and the button to withdraw a placement. */
export function AdminPromotionsPanel() {
  const { t, i18n } = useTranslation('promote');
  const [activeOnly, setActiveOnly] = useState(true);
  const promotions = useAdminPromotions(activeOnly);
  const revoke = useRevokePromotion();

  const items = promotions.data ?? [];
  const date = (value: string) => new Date(value).toLocaleDateString(i18n.language);

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">{t('admin.hint')}</p>

      <div className="flex flex-wrap gap-2">
        {[true, false].map((only) => (
          <button
            key={String(only)}
            type="button"
            aria-pressed={activeOnly === only}
            onClick={() => setActiveOnly(only)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeOnly === only
                ? 'bg-primary text-primary-foreground'
                : 'border border-border hover:bg-accent'
            }`}
          >
            {t(only ? 'admin.activeOnly' : 'admin.all')}
          </button>
        ))}
      </div>

      {promotions.isLoading ? (
        <CardWrapper className="py-16 text-center text-muted-foreground">{t('loading')}</CardWrapper>
      ) : promotions.error ? (
        <CardWrapper className="py-16 text-center text-destructive">
          {promotions.error.message}
        </CardWrapper>
      ) : items.length === 0 ? (
        <CardWrapper className="py-16 text-center text-muted-foreground">
          {t('admin.empty')}
        </CardWrapper>
      ) : (
        <ul className="space-y-2">
          {items.map((promotion) => (
            <li key={promotion.id}>
              <CardWrapper className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span className="truncate">{promotion.target.title}</span>
                    {promotion.tier === 'BUMP' ? (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        {t('tier.BUMP.name')}
                      </span>
                    ) : (
                      <PromotionBadge tier={promotion.tier} />
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {date(promotion.startsAt)} – {date(promotion.endsAt)} ·{' '}
                    {promotion.paid
                      ? `${t('admin.paid')} ${formatQapik(promotion.amount)}`
                      : t('admin.granted')}
                    {promotion.endedReason
                      ? ` · ${t(`mine.ended.${promotion.endedReason}`, {
                          defaultValue: promotion.endedReason,
                        })}`
                      : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  {promotion.target.href ? (
                    <Link
                      to={promotion.target.href}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent"
                    >
                      {t('openTarget')}
                    </Link>
                  ) : null}
                  {promotion.active ? (
                    <button
                      type="button"
                      disabled={revoke.isPending}
                      onClick={() => revoke.mutate(promotion.id)}
                      className="rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive transition hover:bg-accent disabled:opacity-50"
                    >
                      {t('admin.revoke')}
                    </button>
                  ) : null}
                </div>
              </CardWrapper>
            </li>
          ))}
        </ul>
      )}
      {revoke.error ? (
        <p role="alert" className="text-xs text-destructive">
          {revoke.error.message}
        </p>
      ) : null}
    </div>
  );
}

export default AdminPromotionsPanel;
