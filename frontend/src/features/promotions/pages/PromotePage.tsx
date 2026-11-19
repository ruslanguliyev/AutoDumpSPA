import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUp, Check, Crown, Gem, Info } from 'lucide-react';

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
import { Badge } from '@/shared/ui/Badge';
import { Input } from '@/shared/ui/Input';
import { ListingPhoto } from '@/shared/ui/ListingImagePlaceholder';

const TIERS: PromotionTier[] = ['BUMP', 'VIP', 'PREMIUM'];

const TIER_ICON = { BUMP: ArrowUp, VIP: Gem, PREMIUM: Crown } as const;
const TIER_ACCENT = {
  BUMP: 'text-promo-bump',
  VIP: 'text-promo-vip',
  PREMIUM: 'text-promo-premium',
} as const;

/** What each tier does, read off the backend's promotion rules (promotion-pricing.ts). Copy only; no amounts. */
const TIER_FEATURES: Record<PromotionTier, string[]> = {
  BUMP: ['top', 'dailyBump'],
  VIP: ['top', 'vipBlock', 'dailyBump'],
  PREMIUM: ['top', 'vipBlock', 'homePage', 'thriceDaily'],
};

const TIER_TILE = {
  BUMP: 'bg-promo-bump-fill/15',
  VIP: 'bg-promo-vip-fill/15',
  PREMIUM: 'bg-promo-premium-fill/15',
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
  const askedTier: PromotionTier =
    asked === 'BUMP' || asked === 'PREMIUM' || asked === 'VIP' ? asked : 'VIP';
  const [code, setCode] = useState<string | null>(null);
  const [contact, setContact] = useState('');

  const packages = useMemo(() => quote.data?.packages ?? [], [quote.data?.packages]);
  const byTier = (tier: PromotionTier) => packages.filter((p) => p.tier === tier);
  const preselected =
    byTier(askedTier).find((p) => p.recommended) ?? byTier(askedTier)[0] ?? packages[0] ?? null;
  const selected = packages.find((p) => p.code === code) ?? preselected;
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
      <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:py-10">
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground md:text-[26px]">
          {t('title')}
        </h1>
        <p className="mt-4 text-[15px] text-muted-foreground">{t('emptyPackages')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:py-10">
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
        <div role="radiogroup" aria-label={t('chooseTier')} className="mt-6 grid gap-4 lg:grid-cols-3">
          {availableTiers.map((candidate) => {
            const Icon = TIER_ICON[candidate];
            const options = byTier(candidate);
            const from = cheapest(packages, candidate);
            const active = selected?.tier === candidate;
            const unit = candidate === 'BUMP' ? 'bump' : 'day';
            return (
              <section
                key={candidate}
                className={`flex flex-col rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)] [overflow-wrap:anywhere] ${
                  active ? 'border-primary ring-1 ring-primary' : 'border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius)] ${TIER_TILE[candidate]}`}
                  >
                    <Icon size={22} strokeWidth={1.5} className={TIER_ACCENT[candidate]} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h2 className={`text-[20px] font-semibold leading-tight ${TIER_ACCENT[candidate]}`}>
                      {t(`tier.${candidate}.name`)}
                    </h2>
                    {from ? (
                      <p className="text-[13px] text-muted-foreground">
                        {t('fromPrice', { price: price(from.amount) })}
                      </p>
                    ) : null}
                  </div>
                </div>

                <p className="mt-4 text-[15px] text-foreground">{t(`tier.${candidate}.summary`)}</p>

                <ul className="mt-4 flex list-none flex-col gap-2 p-0 text-[15px] text-foreground">
                  {TIER_FEATURES[candidate].map((key) => (
                    <li key={key} className="flex items-start gap-2">
                      <Check size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
                      <span>{t(`feature.${key}`)}</span>
                    </li>
                  ))}
                </ul>

                <fieldset className="mt-5 border-t border-dashed border-border pt-4">
                  <legend className="mb-2 text-[12px] font-semibold uppercase leading-none tracking-[0.06em] text-muted-foreground">
                    {t(candidate === 'BUMP' ? 'chooseCount' : 'chooseDuration')}
                    <span className="sr-only"> — {t(`tier.${candidate}.name`)}</span>
                  </legend>
                  <div className="flex flex-col gap-2">
                    {options.map((pkg) => {
                      const checked = selected?.code === pkg.code;
                      const units = unit === 'bump' ? pkg.bumps : pkg.days;
                      return (
                        <label
                          key={pkg.code}
                          className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius)] border px-3 py-2 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary ${
                            checked ? 'border-primary bg-primary/10' : 'border-border hover:border-border-strong'
                          }`}
                        >
                          <input
                            type="radio"
                            name="promotion-package"
                            value={pkg.code}
                            checked={checked}
                            onChange={() => setCode(pkg.code)}
                            className="h-5 w-5 shrink-0 [accent-color:rgb(var(--primary))]"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] font-semibold text-foreground">
                              {unit === 'bump'
                                ? t('bumpCount', { count: pkg.bumps })
                                : t('dayCount', { count: pkg.days })}
                              {pkg.recommended ? (
                                <Badge variant="custom" className="border-success text-success">
                                  {t('bestValue')}
                                </Badge>
                              ) : null}
                            </span>
                            {units > 1 ? (
                              <span className="block text-[12px] text-muted-foreground">
                                {t(unit === 'bump' ? 'perBump' : 'perDay', {
                                  price: price(Math.round(pkg.amount / units)),
                                })}
                              </span>
                            ) : null}
                          </span>
                          <span className="shrink-0 text-[15px] font-bold text-foreground">{price(pkg.amount)}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </section>
            );
          })}
        </div>

        <ul className="mt-6 flex list-none flex-col gap-2 p-0 text-[13px] text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-6">
          {(['noAccount', 'labelled', 'upgrade'] as const).map((key) => (
            <li key={key} className="flex items-start gap-2">
              <Check size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
              <span>{t(`notes.${key}`)}</span>
            </li>
          ))}
        </ul>

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
