import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUp, Crown, Gem, Info } from 'lucide-react';

import { formatQapik } from '@/features/promotions/api/promotions.api';
import type {
  PromotionPackage,
  PromotionTier,
} from '@/features/promotions/api/promotions.api';
import { promotionTargetFromPath } from '@/features/promotions/promotePath';
import {
  useCreatePromotionOrder,
  usePromotionQuote,
} from '@/features/promotions/hooks/usePromotions';
import { formatDate, intlLocale } from '@/lib/format';
import { mapSubmitError } from '@/lib/formSubmitError';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import Button from '@/shared/ui/button';
import { Input } from '@/shared/ui/Input';
import { ListingPhoto } from '@/shared/ui/ListingImagePlaceholder';

const TIERS: PromotionTier[] = ['BUMP', 'VIP', 'PREMIUM'];

const TIER_ICON = { BUMP: ArrowUp, VIP: Gem, PREMIUM: Crown } as const;
const TIER_ACCENT = {
  BUMP: 'text-promo-bump',
  VIP: 'text-promo-vip',
  PREMIUM: 'text-promo-premium',
} as const;

const cheapest = (packages: PromotionPackage[], tier: PromotionTier) =>
  packages
    .filter((p) => p.tier === tier)
    .reduce<PromotionPackage | null>(
      (best, p) => (best === null || p.amount < best.amount ? p : best),
      null,
    );

export function PromotePage() {
  const { t, i18n } = useTranslation(['promote', 'common']);
  const locale = intlLocale(i18n.language);
  const params = useParams();
  const targetType = promotionTargetFromPath(params.targetType);
  const targetId = params.targetId ?? '';

  const quote = usePromotionQuote(targetType, targetId);
  const createOrder = useCreatePromotionOrder();

  const [search] = useSearchParams();
  const asked = search.get('tier');
  const [tier, setTier] = useState<PromotionTier>(
    asked === 'BUMP' || asked === 'PREMIUM' || asked === 'VIP' ? asked : 'VIP',
  );
  const [code, setCode] = useState<string | null>(null);
  const [contact, setContact] = useState('');

  const packages = useMemo(() => quote.data?.packages ?? [], [quote.data?.packages]);
  const forTier = useMemo(() => packages.filter((p) => p.tier === tier), [packages, tier]);
  const selected =
    forTier.find((p) => p.code === code) ?? forTier.find((p) => p.recommended) ?? forTier[0] ?? null;
  const currency = quote.data?.currency ?? 'AZN';
  const price = (amount: number) => formatQapik(amount, currency, locale);

  const submitError = mapSubmitError(createOrder.error, {
    network: t('errors.network'),
    generic: t('errors.generic'),
    loginRequired: t('errors.loginRequired'),
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    const typed = contact.trim();
    createOrder.mutate(
      {
        targetType,
        targetId,
        packageCode: selected.code,
        contactEmail: typed.includes('@') ? typed : null,
        contactPhone: typed && !typed.includes('@') ? typed : null,
      },
      {
        onSuccess: (order) => {
          if (order.payUrl) window.location.href = order.payUrl;
        },
      },
    );
  };

  if (quote.isLoading) {
    return <p className="py-20 text-center text-[15px] text-muted-foreground">{t('loading')}</p>;
  }
  if (quote.error || !quote.data) {
    return (
      <p role="alert" className="py-20 text-center text-[15px] text-destructive">
        {t('errors.generic')}
      </p>
    );
  }

  const { target, activeTier, activeUntil, bumpsLeft } = quote.data;
  const image = target.imageUrl ? resolveMediaUrl(target.imageUrl) : null;
  const activeUntilLabel = formatDate(activeUntil, locale);
  const availableTiers = TIERS.filter((candidate) => cheapest(packages, candidate));

  if (packages.length === 0) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-10">
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground md:text-[26px]">
          {t('title')}
        </h1>
        <p className="mt-4 text-[15px] text-muted-foreground">{t('emptyPackages')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-10">
      <h1 className="text-[22px] font-semibold tracking-tight text-foreground md:text-[26px]">
        {t('title')}
      </h1>
      <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">{t('subtitle')}</p>

      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
        <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-card-muted">
          <ListingPhoto src={image} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{target.title}</p>
          {target.href ? (
            <Link to={target.href} className="text-[13px] text-primary-text underline">
              {t('openTarget')}
            </Link>
          ) : null}
        </div>
      </div>

      {activeTier ? (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-card-muted p-3 text-[13px] text-muted-foreground">
          <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            {t('active.running', {
              tier: t(`tier.${activeTier}.name`),
              date: activeUntilLabel,
            })}
            {bumpsLeft > 0 ? ` ${t('active.bumpsLeft', { count: bumpsLeft })}` : ''}
          </span>
        </p>
      ) : null}

      <form onSubmit={onSubmit}>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {availableTiers.map((candidate) => {
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
                className={`appearance-none min-h-11 rounded-2xl border bg-card p-4 text-left transition ${
                  active
                    ? 'border-primary shadow-[var(--shadow-card)] ring-1 ring-primary'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <span className="flex items-center gap-2 font-semibold text-foreground">
                  <Icon size={18} className={TIER_ACCENT[candidate]} aria-hidden="true" />
                  {t(`tier.${candidate}.name`)}
                </span>
                <span className="mt-1 block text-[13px] text-muted-foreground">
                  {t('fromPrice', { price: price(from.amount) })}
                </span>
              </button>
            );
          })}
        </div>

        <fieldset className="mt-6">
          <legend className="text-[15px] font-semibold text-foreground">
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
                  className={`appearance-none min-h-11 rounded-xl border bg-card px-4 py-3 text-left transition ${
                    active
                      ? 'border-primary ring-1 ring-primary'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <span className="block text-[15px] font-semibold text-foreground">
                    {tier === 'BUMP'
                      ? t('bumpCount', { count: pkg.bumps })
                      : t('dayCount', { count: pkg.days })}
                  </span>
                  <span className="block text-[15px] text-foreground">{price(pkg.amount)}</span>
                  {pkg.days > 1 && tier !== 'BUMP' ? (
                    <span className="block text-[12px] text-muted-foreground">
                      {t('perDay', { price: price(Math.round(pkg.amount / pkg.days)) })}
                    </span>
                  ) : null}
                  {pkg.recommended ? (
                    <span className="mt-1 inline-block rounded bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                      {t('bestValue')}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </fieldset>

        {selected ? (
          <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <dl className="space-y-2 text-[15px]">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{t('summary.package')}</dt>
                <dd className="text-right font-medium text-foreground">
                  {t(`tier.${selected.tier}.name`)} ·{' '}
                  {selected.tier === 'BUMP'
                    ? t('bumpCount', { count: selected.bumps })
                    : t('dayCount', { count: selected.days })}
                </dd>
              </div>
              {selected.tier !== 'BUMP' && selected.bumpsPerDay > 0 ? (
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
                      {price(selected.listAmount)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-success">{t('summary.credit')}</dt>
                    <dd className="text-right font-medium text-success">
                      −{price(selected.creditAmount)}
                    </dd>
                  </div>
                </>
              ) : null}
              <div className="flex justify-between gap-4 border-t border-border pt-2">
                <dt className="font-semibold text-foreground">{t('summary.total')}</dt>
                <dd className="text-right text-xl font-bold text-foreground">{price(selected.amount)}</dd>
              </div>
            </dl>

            <div className="mt-4">
              <Input
                label={t('contact.label')}
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder={t('contact.placeholder')}
              />
            </div>

            {submitError ? (
              <p role="alert" className="mt-3 text-[13px] text-destructive">
                {submitError.message}
              </p>
            ) : null}

            <Button type="submit" disabled={createOrder.isPending} className="mt-4 w-full min-h-11">
              {createOrder.isPending
                ? t('pay.working')
                : t('pay.button', { price: price(selected.amount) })}
            </Button>
            <p className="mt-3 text-[12px] text-muted-foreground">{t('pay.note')}</p>
          </div>
        ) : null}
      </form>
    </div>
  );
}

export default PromotePage;
