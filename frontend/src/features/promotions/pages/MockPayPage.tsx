import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TriangleAlert } from 'lucide-react';

import { completeMockPayment, formatQapik } from '@/features/promotions/api/promotions.api';
import { usePromotionOrder } from '@/features/promotions/hooks/usePromotions';

/**
 * Stand-in for the acquirer's hosted page while there is no contract with one.
 *
 * It deliberately asks for nothing: no card number, no name, no code. A page that
 * looked like a real card form would teach people to type card details into whatever
 * resembles one, and this one has nothing to do with a card. The two buttons simply
 * tell the server what a bank would have told it.
 */
export function MockPayPage() {
  const { t } = useTranslation('promote');
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const order = usePromotionOrder(token);
  const [working, setWorking] = useState<'paid' | 'failed' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const finish = async (outcome: 'paid' | 'failed') => {
    setWorking(outcome);
    setError(null);
    try {
      await completeMockPayment(token, outcome);
      navigate(`/promote/order/${token}`, { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setWorking(null);
    }
  };

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

  const payable = order.data.status === 'PENDING';

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow)]">
        <p className="flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300">
          <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          {t('mock.notice')}
        </p>

        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t('mock.for')}</dt>
            <dd className="text-right font-medium text-foreground">{order.data.target.title}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t('summary.package')}</dt>
            <dd className="text-right text-foreground">
              {t(`tier.${order.data.tier}.name`)} ·{' '}
              {order.data.tier === 'BUMP'
                ? t('bumpCount', { count: order.data.bumps })
                : t('dayCount', { count: order.data.days })}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-border pt-2">
            <dt className="font-semibold text-foreground">{t('summary.total')}</dt>
            <dd className="text-right text-xl font-bold text-foreground">
              {formatQapik(order.data.amount, order.data.currency)}
            </dd>
          </div>
        </dl>

        {error ? (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {payable ? (
          <div className="mt-6 space-y-2">
            <button
              type="button"
              disabled={working !== null}
              onClick={() => void finish('paid')}
              className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60"
            >
              {working === 'paid' ? t('mock.working') : t('mock.succeed')}
            </button>
            <button
              type="button"
              disabled={working !== null}
              onClick={() => void finish('failed')}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent disabled:opacity-60"
            >
              {t('mock.decline')}
            </button>
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">
            {t(`status.${order.data.status}`)}
          </p>
        )}
      </div>
    </div>
  );
}

export default MockPayPage;
