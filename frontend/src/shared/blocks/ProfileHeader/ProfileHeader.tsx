import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { formatNumber, intlLocale } from '@/lib/format';
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
  verified?: ReactNode;
  subtitle?: ReactNode;
  avatar?: ReactNode;
  cover?: ReactNode;
  rating?: ProfileHeaderRating;
  meta?: ProfileHeaderMetaItem[];
  tags?: ReactNode;
  actions?: ReactNode;
};

export function ProfileHeader({
  name,
  verified,
  subtitle,
  avatar,
  cover,
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
  const overlapAvatar = Boolean(cover && avatar);

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] [overflow-wrap:anywhere]">
      {cover ? <div className="w-full bg-card-muted">{cover}</div> : null}

      <div
        className={`flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5 ${
          overlapAvatar ? 'sm:pt-5' : ''
        }`}
      >
        <div className="flex min-w-0 flex-1 gap-3">
          {avatar ? (
            <div className={`shrink-0 ${overlapAvatar ? 'relative -mt-12 sm:-mt-14' : ''}`}>{avatar}</div>
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[22px] font-semibold tracking-tight text-foreground [overflow-wrap:anywhere] md:text-[26px]">
                {name}
              </h1>
              {verified}
            </div>
            {subtitle ? <div className="mt-1 text-[13px] text-muted-foreground">{subtitle}</div> : null}
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
            {tags ? <div className="mt-3">{tags}</div> : null}
          </div>
        </div>
        {actions ? <div className="shrink-0 self-start">{actions}</div> : null}
      </div>
    </section>
  );
}
