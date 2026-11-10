import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Clock, Heart, MapPin, Phone } from 'lucide-react';

import { formatMonthYear, intlLocale } from '@/lib/format';
import { Badge } from '@/shared/ui/Badge';
import Button from '@/shared/ui/button';
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
  city?: string | null;
  phone?: string | null;
  memberSince?: string | null;
  responseTime?: string | null;
};

type Props = {
  seller: SellerLike | null | undefined;
  location?: string | null;
  showPhone: boolean;
  onTogglePhone: () => void;
  phoneVisible: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  /** The sticky bottom bar already carries the favourite toggle: hide it here below `lg`. */
  barCarriesFavorite?: boolean;
  /** …and the phone button. */
  barCarriesPhone?: boolean;
};

const initials = (name: string) => {
  const safe = name.trim();
  if (!safe) return '??';
  return safe.slice(0, 2).toUpperCase();
};

export function VehicleDetailSellerSidebar({
  seller,
  location,
  showPhone,
  onTogglePhone,
  phoneVisible,
  isFavorite,
  onToggleFavorite,
  barCarriesFavorite = false,
  barCarriesPhone = false,
}: Props) {
  const { t, i18n } = useTranslation(['common', 'sellers']);
  const navigate = useNavigate();

  if (!seller?.id) return null;

  const name = seller.name?.trim() || t('seller.fallbackName', { ns: 'common' });
  const typeKey = normalizeSellerType(seller.type);
  const typeLabel = typeKey ? t(`seller.type.${typeKey}`, { ns: 'common' }) : null;
  const avatar = seller.logo || seller.avatarUrl || null;
  const rating = Number.isFinite(Number(seller.rating)) ? Number(seller.rating) : null;
  const reviewsRaw = seller.votes ?? seller.reviewsCount;
  const reviews = Number.isFinite(Number(reviewsRaw)) ? Number(reviewsRaw) : null;
  const showSellerRating = reviews != null && reviews > 0 && rating != null;
  const canOpen = hasPublicSellerPage(seller.type) && seller.hasPublicPage === true;
  const phone = seller.phone?.trim() || null;
  const memberSince = formatMonthYear(seller.memberSince, intlLocale(i18n.language)) || null;
  const showPhoneButton = Boolean(phone && showPhone);
  const hasMobileActions = (showPhoneButton && !barCarriesPhone) || !barCarriesFavorite;

  const openSeller = () => {
    if (!canOpen) return;
    navigate(`/sellers/${seller.id}`);
  };

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] [overflow-wrap:anywhere]">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={openSeller}
          disabled={!canOpen}
          className={`shrink-0 rounded-full border-0 bg-transparent p-0 ${canOpen ? 'cursor-pointer' : 'cursor-default'}`}
        >
          {avatar ? (
            <img src={avatar} alt="" className="h-[52px] w-[52px] rounded-full border border-border object-cover" />
          ) : (
            <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-border bg-card-muted text-[13px] font-semibold text-muted-foreground">
              {initials(name)}
            </span>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {canOpen ? (
              <Link
                to={`/sellers/${seller.id}`}
                className="truncate text-[17px] font-semibold text-foreground no-underline hover:text-primary-text"
              >
                {name}
              </Link>
            ) : (
              <h3 className="truncate text-[17px] font-semibold text-foreground">{name}</h3>
            )}
            {seller.verified ? <Badge variant="verified">{t('seller.verified', { ns: 'common' })}</Badge> : null}
          </div>
          {typeLabel ? <p className="mt-0.5 text-[13px] text-muted-foreground">{typeLabel}</p> : null}
          {showSellerRating ? (
            <RatingStars
              value={rating}
              count={reviews}
              countLabel={t('seller.reviews', { ns: 'common', count: reviews })}
              className="mt-2"
            />
          ) : (
            <p className="mt-2 text-[13px] text-muted-foreground">{t('seller.noReviewsYet', { ns: 'common' })}</p>
          )}
        </div>
      </div>

      <ul className="mt-4 space-y-2 text-[13px] text-muted-foreground">
        {location ? (
          <li className="flex items-center gap-2">
            <MapPin size={16} strokeWidth={1.5} aria-hidden="true" />
            <span>{location}</span>
          </li>
        ) : seller.city ? (
          <li className="flex items-center gap-2">
            <MapPin size={16} strokeWidth={1.5} aria-hidden="true" />
            <span>{seller.city}</span>
          </li>
        ) : null}
        {memberSince ? (
          <li className="flex items-center gap-2">
            <CalendarDays size={16} strokeWidth={1.5} aria-hidden="true" />
            <span>{t('vehicle.memberSince', { ns: 'sellers', date: memberSince })}</span>
          </li>
        ) : null}
        {seller.responseTime ? (
          <li className="flex items-center gap-2">
            <Clock size={16} strokeWidth={1.5} aria-hidden="true" />
            <span>{t('vehicle.respondsWithin', { ns: 'sellers', time: seller.responseTime })}</span>
          </li>
        ) : null}
      </ul>

      <div className={`mt-4 flex-col gap-2 ${hasMobileActions ? 'flex' : 'hidden lg:flex'}`}>
        {showPhoneButton ? (
          <Button
            type="button"
            variant="secondary"
            className={`w-full justify-center gap-2 ${barCarriesPhone ? 'max-lg:hidden' : ''}`}
            onClick={onTogglePhone}
          >
            <Phone size={18} strokeWidth={1.5} aria-hidden="true" />
            {phoneVisible ? phone : t('vehicle.showPhoneNumber', { ns: 'sellers' })}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          className={`w-full justify-center gap-2 ${barCarriesFavorite ? 'max-lg:hidden' : ''}`}
          aria-pressed={isFavorite}
          onClick={onToggleFavorite}
        >
          <Heart
            size={18}
            strokeWidth={1.5}
            aria-hidden="true"
            className={isFavorite ? 'fill-destructive text-destructive' : ''}
          />
          {isFavorite
            ? t('vehicle.addedToFavorites', { ns: 'sellers' })
            : t('vehicle.addToFavorites', { ns: 'sellers' })}
        </Button>
      </div>
    </article>
  );
}

export default VehicleDetailSellerSidebar;
