import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, Phone, TrendingUp } from 'lucide-react';

import { DashboardHeader } from '@/dashboard/components/DashboardHeader/DashboardHeader';
import { formatQapik } from '@/features/promotions/api/promotions.api';
import type { Promotion } from '@/features/promotions/api/promotions.api';
import { PromotionBadge } from '@/features/promotions/components/PromotionBadge';
import { useMyPromotions } from '@/features/promotions/hooks/usePromotions';
import { promotePath } from '@/features/promotions/pages/PromotePage';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Eye;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={15} className="text-muted-foreground" aria-hidden="true" />
      <span className="text-sm font-semibold text-foreground">+{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function PromotionRow({ promotion }: { promotion: Promotion }) {
  const { t, i18n } = useTranslation('promote');
  const date = (value: string) => new Date(value).toLocaleDateString(i18n.language);
  const bumpsLeft = Math.max(0, promotion.bumpsTotal - promotion.bumpsUsed);

  return (
    <CardWrapper className="space-y-2 p-4">
      <div className="flex flex-wrap items-center gap-2">
        {promotion.target.href ? (
          <Link
            to={promotion.target.href}
            className="truncate text-sm font-semibold text-primary hover:underline"
          >
            {promotion.target.title}
          </Link>
        ) : (
          <span className="truncate text-sm font-semibold text-foreground">
            {promotion.target.title}
          </span>
        )}
        {promotion.tier === 'BUMP' ? (
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            {t('tier.BUMP.name')}
          </span>
        ) : (
          <PromotionBadge tier={promotion.tier} />
        )}
        {promotion.active ? (
          <span className="text-xs text-muted-foreground">
            {t('mine.until', { date: date(promotion.endsAt) })}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            {t(`mine.ended.${promotion.endedReason ?? 'expired'}`, {
              defaultValue: t('mine.ended.expired'),
            })}
          </span>
        )}
      </div>

      {/* The point of the whole thing: what the money actually brought in. */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
        <Stat
          icon={Eye}
          value={promotion.viewsGained}
          label={t('mine.views', { count: promotion.viewsGained })}
        />
        <Stat
          icon={Phone}
          value={promotion.contactsGained}
          label={t('mine.contacts', { count: promotion.contactsGained })}
        />
        <span className="text-xs text-muted-foreground">
          {t('mine.bumps', { used: promotion.bumpsUsed, total: promotion.bumpsTotal })}
        </span>
        {promotion.active && bumpsLeft > 0 && promotion.nextBumpAt ? (
          <span className="text-xs text-muted-foreground">
            {t('mine.nextBump', {
              time: new Date(promotion.nextBumpAt).toLocaleString(i18n.language, {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
              }),
            })}
          </span>
        ) : null}
        <span className="text-xs text-muted-foreground">
          {promotion.amount > 0 ? formatQapik(promotion.amount) : t('mine.granted')}
        </span>
      </div>

      {!promotion.active ? (
        <Link
          to={promotePath(promotion.target.targetType, promotion.target.targetId)}
          className="inline-block text-xs font-semibold text-primary hover:underline"
        >
          {t('mine.again')}
        </Link>
      ) : null}
    </CardWrapper>
  );
}

/** Everything the signed-in user has promoted, running and finished, with its results. */
export function PromotionsPage() {
  const { t } = useTranslation('promote');
  const promotions = useMyPromotions();
  const items = promotions.data ?? [];
  const running = items.filter((p) => p.active);
  const finished = items.filter((p) => !p.active);

  return (
    <div className="space-y-6">
      <DashboardHeader title={t('mine.title')} subtitle={t('mine.subtitle')} />

      {promotions.isLoading ? (
        <CardWrapper className="py-16 text-center text-muted-foreground">{t('loading')}</CardWrapper>
      ) : promotions.error ? (
        <CardWrapper className="py-16 text-center text-destructive">
          {promotions.error.message}
        </CardWrapper>
      ) : items.length === 0 ? (
        <CardWrapper className="space-y-2 py-16 text-center">
          <TrendingUp size={28} className="mx-auto text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">{t('mine.empty')}</p>
        </CardWrapper>
      ) : (
        <>
          {running.length > 0 ? (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">{t('mine.running')}</h2>
              {running.map((p) => (
                <PromotionRow key={p.id} promotion={p} />
              ))}
            </section>
          ) : null}
          {finished.length > 0 ? (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">{t('mine.finished')}</h2>
              {finished.map((p) => (
                <PromotionRow key={p.id} promotion={p} />
              ))}
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}

export default PromotionsPage;
