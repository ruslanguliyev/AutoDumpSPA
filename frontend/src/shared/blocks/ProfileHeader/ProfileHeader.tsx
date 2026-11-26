import type { ReactNode } from 'react';
import { BadgeCheck, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatNumber, intlLocale } from '@/lib/format';
import { ListingPhoto } from '@/shared/ui/ListingImagePlaceholder';
import RatingStars from '@/shared/ui/RatingStars/RatingStars';

export type ProfileHeaderMetaItem = {
  icon?: ReactNode;
  text: string;
};

export type ProfileHeaderRating = {
  rating?: number | null;
  reviewsCount?: number | null;
};

export type ProfileHeaderProps = {
  name: string;
  coverSrc?: string | null;
  avatarSrc?: string | null;
  verified?: boolean;
  verifiedBadge?: ReactNode;
  rating?: ProfileHeaderRating;
  meta?: ProfileHeaderMetaItem[];
  tags?: ReactNode;
  actions?: ReactNode;
  /**
   * `default` is the round-avatar hero used by specialists and service centres.
   * `seller` is the dealer page: square avatar, inline activity, actions in the hero.
   */
  variant?: 'default' | 'seller';
  /** Seller variant: member-since (or similar) on the same line as the rating. */
  activity?: string | null;
  /** Seller variant: city, or district when the API has one. */
  location?: string | null;
  /** Seller variant: “N active listings”, already pluralised. */
  listingsLabel?: string | null;
};

const initialsFromName = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0] ?? '').slice(0, 2).toUpperCase() || '??';
};

function DefaultProfileHeader({
  name,
  coverSrc,
  avatarSrc,
  verified = false,
  verifiedBadge,
  rating,
  meta,
  tags,
  actions,
}: ProfileHeaderProps) {
  const { t, i18n } = useTranslation('common');
  const locale = intlLocale(i18n.language);

  const reviewsCount = Number.isFinite(rating?.reviewsCount) ? Number(rating?.reviewsCount) : 0;
  const ratingValue = Number.isFinite(rating?.rating) ? Number(rating?.rating) : null;
  const showRating = reviewsCount > 0 && ratingValue !== null;
  const formattedCount = formatNumber(reviewsCount, locale);
  const metaItems = (meta ?? []).filter((item) => item.text);
  const coverImage = typeof coverSrc === 'string' && coverSrc.trim() ? coverSrc.trim() : null;
  const avatarImage = typeof avatarSrc === 'string' && avatarSrc.trim() ? avatarSrc.trim() : null;

  return (
    <section className="w-full max-w-full overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] [overflow-wrap:anywhere]">
      <div className="h-32 w-full bg-card-muted sm:h-40 lg:h-48">
        {coverImage ? (
          <ListingPhoto src={coverImage} className="h-full w-full object-cover" loading="eager" />
        ) : null}
      </div>

      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="relative -mt-12 shrink-0 sm:-mt-14">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-card bg-card-muted sm:h-28 sm:w-28">
              {avatarImage ? (
                <ListingPhoto src={avatarImage} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[18px] font-semibold text-muted-foreground">
                  {initialsFromName(name)}
                </span>
              )}
            </div>
            {verified ? (
              <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-success text-primary-foreground">
                <BadgeCheck size={14} aria-hidden="true" />
              </span>
            ) : null}
          </div>

          <div className="min-w-0 flex-1 pt-1 sm:pt-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[22px] font-semibold tracking-tight text-foreground [overflow-wrap:anywhere] md:text-[26px]">
                {name}
              </h1>
              {verifiedBadge}
            </div>
            {rating ? (
              showRating ? (
                <RatingStars
                  value={ratingValue}
                  countLabel={t('profileHeader.reviews', { count: reviewsCount, formatted: formattedCount })}
                  className="mt-2"
                />
              ) : (
                <p className="mt-2 text-[13px] text-muted-foreground">{t('seller.noReviewsYet')}</p>
              )
            ) : null}
            {metaItems.length > 0 ? (
              <ul className="mt-3 space-y-1.5 text-[13px] text-muted-foreground">
                {metaItems.map((item) => (
                  <li key={item.text} className="flex items-start gap-2">
                    {item.icon ? <span className="mt-0.5 shrink-0">{item.icon}</span> : null}
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {tags ? <div className="mt-3 flex flex-wrap gap-2">{tags}</div> : null}
          </div>
        </div>
        {actions ? <div className="shrink-0 self-start">{actions}</div> : null}
      </div>
    </section>
  );
}

function SellerProfileHeader({
  name,
  coverSrc,
  avatarSrc,
  verifiedBadge,
  rating,
  activity,
  location,
  listingsLabel,
  actions,
}: ProfileHeaderProps) {
  const { t, i18n } = useTranslation('common');
  const locale = intlLocale(i18n.language);
  const reviewsCount = Number.isFinite(rating?.reviewsCount) ? Number(rating?.reviewsCount) : 0;
  const ratingValue = Number.isFinite(rating?.rating) ? Number(rating?.rating) : null;
  const showRating = reviewsCount > 0 && ratingValue !== null;
  const formattedCount = formatNumber(reviewsCount, locale);
  const coverImage = typeof coverSrc === 'string' && coverSrc.trim() ? coverSrc.trim() : null;
  const avatarImage = typeof avatarSrc === 'string' && avatarSrc.trim() ? avatarSrc.trim() : null;
  const place = typeof location === 'string' && location.trim() ? location.trim() : null;
  const since = typeof activity === 'string' && activity.trim() ? activity.trim() : null;
  const listings = typeof listingsLabel === 'string' && listingsLabel.trim() ? listingsLabel.trim() : null;

  return (
    <section className="w-full max-w-full overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] [overflow-wrap:anywhere]">
      <div className="h-36 w-full bg-card-muted sm:h-40">
        {coverImage ? (
          <ListingPhoto src={coverImage} className="h-full w-full object-cover" loading="eager" />
        ) : null}
      </div>

      <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="relative z-10 -mt-7 h-[4.375rem] w-[4.375rem] shrink-0 overflow-hidden rounded-2xl border border-border bg-card">
            {avatarImage ? (
              <ListingPhoto src={avatarImage} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[18px] font-semibold text-foreground">
                {initialsFromName(name)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1 pt-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="text-[28px] font-bold leading-8 tracking-tight text-foreground">{name}</h1>
              {verifiedBadge}
            </div>

            {rating || since ? (
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
                {rating ? (
                  showRating ? (
                    <RatingStars
                      value={ratingValue}
                      countLabel={t('profileHeader.reviews', { count: reviewsCount, formatted: formattedCount })}
                    />
                  ) : (
                    <span>{t('seller.noReviewsYet')}</span>
                  )
                ) : null}
                {since ? (
                  <span className="inline-flex items-center gap-2">
                    {rating ? <span aria-hidden="true">·</span> : null}
                    <span>{since}</span>
                  </span>
                ) : null}
              </div>
            ) : null}

            {place || listings ? (
              <div className="mt-1.5 flex items-start justify-between gap-3 text-[13px] text-muted-foreground">
                {place ? (
                  <span className="flex min-w-0 items-start gap-1.5">
                    <MapPin size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <span className="min-w-0">{place}</span>
                  </span>
                ) : (
                  <span />
                )}
                {listings ? <span className="shrink-0 text-right">{listings}</span> : null}
              </div>
            ) : null}
          </div>
        </div>

        {actions ? <div className="min-w-0 sm:shrink-0 sm:self-center">{actions}</div> : null}
      </div>
    </section>
  );
}

export function ProfileHeader(props: ProfileHeaderProps) {
  if (props.variant === 'seller') return <SellerProfileHeader {...props} />;
  return <DefaultProfileHeader {...props} />;
}
