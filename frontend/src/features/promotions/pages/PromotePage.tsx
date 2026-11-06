import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUp, Check, Crown, Gem, Info } from 'lucide-react';

import { formatQapik } from '@/features/promotions/api/promotions.api';
import type {
  PromotionPackage,
  PromotionTarget,
  PromotionTier,
} from '@/features/promotions/api/promotions.api';
import {
  useCreatePromotionOrder,
  usePromotionQuote,
} from '@/features/promotions/hooks/usePromotions';
import { resolveMediaUrl } from '@/lib/mediaUrl';

const TIERS: PromotionTier[] = ['BUMP', 'VIP', 'PREMIUM'];

const TIER_ICON = { BUMP: ArrowUp, VIP: Gem, PREMIUM: Crown } as const;
const TIER_ACCENT = {
  BUMP: 'text-emerald-600',
  VIP: 'text-rose-600',
  PREMIUM: 'text-amber-500',
} as const;

/** What each tier adds on top of the one below it; rendered as a single checklist. */
const TIER_FEATURES: Record<PromotionTier, string[]> = {
  BUMP: ['top'],
  VIP: ['top', 'vipBlock', 'dailyBump'],
  PREMIUM: ['top', 'vipBlock', 'homePage', 'thriceDaily'],
};

/** The URL says `listing`, `specialist` or `service-center`. */
const TARGET_FROM_PATH: Record<string, PromotionTarget> = {
  listing: 'LISTING',
  specialist: 'SPECIALIST',
  'service-center': 'SERVICE_CENTER',
};

export const promotePath = (targetType: PromotionTarget, targetId: string): string => {
  const segment = Object.keys(TARGET_FROM_PATH).find(
    (key) => TARGET_FROM_PATH[key] === targetType,
  );
  return `/promote/${segment ?? 'listing'}/${targetId}`;
};

/** Cheapest package of a tier, for the "from X" line on the unselected cards. */
const cheapest = (packages: PromotionPackage[], tier: PromotionTier) =>
  packages.filter((p) => p.tier === tier).reduce<PromotionPackage | null>(
    (best, p) => (best === null || p.amount < best.amount ? p : best),
    null,
  );

/**
 * One screen to buy placement.
 *
 * turbo.az asks the buyer to open three separate dialogs and hold the differences in
 * their head. Here the three tiers sit side by side with what each one includes, the
 * price per day is spelled out, and any upgrade credit is shown before paying.
 */
export function PromotePage() {
  const { t } = useTranslation('promote');
  const params = useParams();
  const targetType = TARGET_FROM_PATH[params.targetType ?? ''] ?? 'LISTING';
  const targetId = params.targetId ?? '';

  const quote = usePromotionQuote(targetType, targetId);
  const createOrder = useCreatePromotionOrder();

  // The shortcuts on a listing page name a tier; otherwise VIP is the middle choice.
  const [search] = useSearchParams();
  const asked = search.get('tier');
  const [tier, setTier] = useState<PromotionTier>(
    asked === 'BUMP' || asked === 'PREMIUM' || asked === 'VIP' ? asked : 'VIP',
  );
  const [code, setCode] = useState<string | null>(null);
  const [contact, setContact] = useState('');

  const packages = quote.data?.packages ?? [];
  const forTier = useMemo(() => packages.filter((p) => p.tier === tier), [packages, tier]);
  const selected =
    forTier.find((p) => p.code === code) ?? forTier.find((p) => p.recommended) ?? forTier[0] ?? null;
  const currency = quote.data?.currency ?? 'AZN';

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    const typed = contact.trim();
    createOrder.mutate(
      {
        targetType,
        targetId,
        packageCode: selected.code,
        // One field, so the buyer gives whichever they prefer for the receipt.
        contactEmail: typed.includes('@') ? typed : null,
        contactPhone: typed && !typed.includes('@') ? typed : null,
      },
      {
        onSuccess: (order) => {
          // The provider's hosted page; we never see the card details.
          if (order.payUrl) window.location.href = order.payUrl;
        },
      },
    );
  };

  if (quote.isLoading) {
    return <p className="py-20 text-center text-muted-foreground">{t('loading')}</p>;
  }
  if (quote.error || !quote.data) {
    return (
      <p role="alert" className="py-20 text-center text-destructive">
        {quote.error?.message ?? t('notFound')}
      </p>
    );
  }

  const { target, activeTier, activeUntil, bumpsLeft } = quote.data;
  const image = target.imageUrl ? resolveMediaUrl(target.imageUrl) : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-10">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('title')}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t('subtitle')}</p>

      {/* What is being promoted, so nobody pays for the wrong listing. */}
      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
        {image ? (
          <img src={image} alt="" className="h-16 w-24 shrink-0 rounded-xl object-cover" />
        ) : (
          <div className="h-16 w-24 shrink-0 rounded-xl bg-muted" />
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{target.title}</p>
          {target.href ? (
            <Link to={target.href} className="text-sm text-primary hover:underline">
              {t('openTarget')}
            </Link>
          ) : null}
        </div>
      </div>

      {activeTier ? (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
          <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            {t('active.running', {
              tier: t(`tier.${activeTier}.name`),
              date: activeUntil ? new Date(activeUntil).toLocaleDateString() : '',
            })}
            {bumpsLeft > 0 ? ` ${t('active.bumpsLeft', { count: bumpsLeft })}` : ''}
          </span>
        </p>
      ) : null}

      <form onSubmit={onSubmit}>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {TIERS.map((candidate) => {
            const from = cheapest(packages, candidate);
            if (!from) return null;
            const Icon = TIER_ICON[candidate];
            const active = tier === candidate;
            return (
              <button
                key={candidate}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setTier(candidate);
                  setCode(null);
                }}
                className={`rounded-2xl border p-4 text-left transition ${
                  active
                    ? 'border-primary bg-card shadow-[var(--shadow)] ring-1 ring-primary'
                    : 'border-border bg-card hover:border-primary/40'
                }`}
              >
                <span className="flex items-center gap-2 font-semibold text-foreground">
                  <Icon size={18} className={TIER_ACCENT[candidate]} aria-hidden="true" />
                  {t(`tier.${candidate}.name`)}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {t('fromPrice', { price: formatQapik(from.amount, currency) })}
                </span>
                <ul className="mt-3 space-y-1.5">
                  {TIER_FEATURES[candidate].map((feature) => (
                    <li key={feature} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Check size={13} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                      {t(`feature.${feature}`)}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-foreground">
            {t(tier === 'BUMP' ? 'chooseCount' : 'chooseDuration')}
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {forTier.map((pkg) => {
              const active = selected?.code === pkg.code;
              return (
                <button
                  key={pkg.code}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCode(pkg.code)}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    active
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <span className="block text-sm font-semibold text-foreground">
                    {tier === 'BUMP'
                      ? t('bumpCount', { count: pkg.bumps })
                      : t('dayCount', { count: pkg.days })}
                  </span>
                  <span className="block text-sm text-foreground">
                    {formatQapik(pkg.amount, currency)}
                  </span>
                  {/* The longer packages are cheaper per day; say so instead of hiding it. */}
                  {pkg.days > 1 && tier !== 'BUMP' ? (
                    <span className="block text-[11px] text-muted-foreground">
                      {t('perDay', { price: formatQapik(Math.round(pkg.amount / pkg.days), currency) })}
                    </span>
                  ) : null}
                  {pkg.recommended ? (
                    <span className="mt-1 inline-block rounded bg-emerald-600/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                      {t('bestValue')}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </fieldset>

        {selected ? (
          <div className="mt-6 rounded-2xl border border-border bg-card p-5">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{t('summary.package')}</dt>
                <dd className="text-right font-medium text-foreground">
                  {t(`tier.${selected.tier}.name`)} ·{' '}
                  {selected.tier === 'BUMP'
                    ? t('bumpCount', { count: selected.bumps })
                    : t('dayCount', { count: selected.days })}
                </dd>
              </div>
              {selected.tier !== 'BUMP' ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{t('summary.bumps')}</dt>
                  <dd className="text-right text-foreground">
                    {t(selected.bumpsPerDay === 3 ? 'summary.bumpThrice' : 'summary.bumpOnce')}
                  </dd>
                </div>
              ) : null}
              {selected.creditAmount > 0 ? (
                <>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{t('summary.listPrice')}</dt>
                    <dd className="text-right text-muted-foreground line-through">
                      {formatQapik(selected.listAmount, currency)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-emerald-700">{t('summary.credit')}</dt>
                    <dd className="text-right font-medium text-emerald-700">
                      −{formatQapik(selected.creditAmount, currency)}
                    </dd>
                  </div>
                </>
              ) : null}
              <div className="flex justify-between gap-4 border-t border-border pt-2 text-base">
                <dt className="font-semibold text-foreground">{t('summary.total')}</dt>
                <dd className="text-right text-xl font-bold text-foreground">
                  {formatQapik(selected.amount, currency)}
                </dd>
              </div>
            </dl>

            <label className="mt-4 block text-sm">
              <span className="text-muted-foreground">{t('contact.label')}</span>
              <input
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder={t('contact.placeholder')}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>

            {createOrder.isError ? (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {createOrder.error.message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={createOrder.isPending}
              className="mt-4 w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {createOrder.isPending
                ? t('pay.working')
                : t('pay.button', { price: formatQapik(selected.amount, currency) })}
            </button>
            <p className="mt-3 text-xs text-muted-foreground">{t('pay.note')}</p>
          </div>
        ) : null}
      </form>
    </div>
  );
}

export default PromotePage;
