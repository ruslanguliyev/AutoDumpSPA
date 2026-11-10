import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';

import { Badge } from '@/shared/ui/Badge';
import RatingStars from '@/shared/ui/RatingStars/RatingStars';
import { hasPublicSellerPage, normalizeSellerType } from '@/shared/utils/sellerType';

type SellerLike = {
  id?: string;
  name?: string | null;
  type?: string | null;
  rating?: number | null;
  votes?: number | null;
  reviewsCount?: number | null;
  logo?: string | null;
  avatarUrl?: string | null;
  verified?: boolean;
  hasPublicPage?: boolean;
};

const getInitials = (name: string) => {
  const safe = name.trim();
  if (!safe) return '??';
  return safe.slice(0, 2).toUpperCase();
};

type Props = {
  seller: SellerLike | null | undefined;
  className?: string;
};

/** Compact seller row for part/vehicle sidebars — avatar, name, type, stars, “View seller”. */
export function MiniSellerCard({ seller, className = '' }: Props) {
  const { t } = useTranslation('common');

  if (!seller?.id) return null;

  const name = seller.name?.trim() || t('seller.fallbackName');
  const typeKey = normalizeSellerType(seller.type);
  const typeLabel = typeKey ? t(`seller.type.${typeKey}`) : null;
  const rating = Number.isFinite(Number(seller.rating)) ? Number(seller.rating) : null;
  const reviewsRaw = seller.votes ?? seller.reviewsCount;
  const reviews = Number.isFinite(Number(reviewsRaw)) ? Number(reviewsRaw) : null;
  const showRating = reviews != null && reviews > 0 && rating != null;
  const avatar = seller.logo || seller.avatarUrl || null;
  const canOpen = hasPublicSellerPage(seller.type) && seller.hasPublicPage === true;

  return (
    <article
      className={`rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] [overflow-wrap:anywhere] ${className}`.trim()}
    >
      <div className="flex items-center gap-3">
        {avatar ? (
          <img
            src={avatar}
            alt=""
            className="h-11 w-11 shrink-0 rounded-full border border-border bg-card-muted object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card-muted text-[13px] font-semibold text-muted-foreground"
            aria-hidden="true"
          >
            {getInitials(name)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[16px] font-semibold text-foreground">{name}</h3>
            {seller.verified ? <Badge variant="verified">{t('seller.verified')}</Badge> : null}
          </div>
          {typeLabel ? <p className="mt-0.5 text-[13px] text-muted-foreground">{typeLabel}</p> : null}
          {showRating ? (
            <RatingStars
              value={rating}
              count={reviews}
              countLabel={t('seller.reviews', { count: reviews })}
              className="mt-2"
            />
          ) : (
            <p className="mt-2 text-[13px] text-muted-foreground">{t('seller.noReviewsYet')}</p>
          )}
        </div>
      </div>

      {canOpen ? (
        <Link
          to={`/sellers/${seller.id}`}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-1 rounded-[var(--radius)] border border-brand text-[15px] font-semibold text-primary-text no-underline transition hover:bg-foreground/5"
        >
          {t('seller.viewSeller')}
          <ChevronRight size={18} strokeWidth={1.5} aria-hidden="true" />
        </Link>
      ) : null}
    </article>
  );
}

export default MiniSellerCard;
