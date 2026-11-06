import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CircleAlert, CircleCheck, Loader } from 'lucide-react';

import { formatQapik } from '@/features/promotions/api/promotions.api';
import { promotePath } from '@/features/promotions/pages/PromotePage';
import { usePromotionOrder } from '@/features/promotions/hooks/usePromotions';

/**
 * What happened to an order, addressed by its token so a visitor who never signed in
 * can still come back to it. While the payment is outstanding the page keeps asking:
 * the placement is granted by the provider calling our server, not by this page.
 */
export function PromotionStatusPage() {
  const { t } = useTranslation('promote');
  const { token = '' } = useParams();
  const order = usePromotionOrder(token);

  if (order.isLoading) {
    return <p className="py-20 text-center text-muted-foreground">{t('loading')}</p>;
  }
  if (order.error || !order.data) {
    return (
      <p role="alert" className="py-20 text-center text-destructive">
        {order.error?.message ?? t('notFound')}
      </p>
    );
  }

  const { status, target, tier, days, bumps, amount, currency, payUrl } = order.data;
  const paid = status === 'PAID';
  const pending = status === 'PENDING';
  const Icon = paid ? CircleCheck : pending ? Loader : CircleAlert;
  const tone = paid ? 'text-emerald-600' : pending ? 'text-muted-foreground' : 'text-destructive';

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-[var(--shadow)]">
        <Icon
          size={44}
          className={`mx-auto ${tone} ${pending ? 'animate-spin' : ''}`}
          aria-hidden="true"
        />
        <h1 className="mt-4 text-xl font-bold text-foreground">{t(`status.${status}`)}</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          {t('statusDetail', {
            tier: t(`tier.${tier}.name`),
            what:
              tier === 'BUMP' ? t('bumpCount', { count: bumps }) : t('dayCount', { count: days }),
            title: target.title,
            price: formatQapik(amount, currency),
          })}
        </p>

        {paid ? <p className="mt-3 text-sm text-foreground">{t('paidHint')}</p> : null}

        <div className="mt-6 space-y-2">
          {pending && payUrl ? (
            <a
              href={payUrl}
              className="block w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground hover:opacity-90"
            >
              {t('resumePayment')}
            </a>
          ) : null}
          {!paid && !pending ? (
            <Link
              to={promotePath(target.targetType, target.targetId)}
              className="block w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground hover:opacity-90"
            >
              {t('tryAgain')}
            </Link>
          ) : null}
          {target.href ? (
            <Link
              to={target.href}
              className="block w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent"
            >
              {t('openTarget')}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default PromotionStatusPage;
