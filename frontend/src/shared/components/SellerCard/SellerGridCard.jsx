import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import RatingStars from '@/shared/ui/RatingStars/RatingStars.jsx';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { Badge } from '@/shared/ui/Badge';
import Button from '@/shared/ui/button';
import { normalizeSellerType } from '@/shared/utils/sellerType';


const getInitials = (name) => {
  const safe = String(name ?? '').trim();
  if (!safe) return '??';
  return safe.slice(0, 2).toUpperCase();
};

const getTypeLabel = (type, t) => {
  const key = normalizeSellerType(type);
  return key ? t(`seller.type.${key}`) : null;
};

const getCity = (seller) => {
  const value = seller?.city ?? seller?.location?.city ?? seller?.address?.city ?? seller?.cityName;
  const safe = typeof value === 'string' ? value.trim() : '';
  return safe.length > 0 ? safe : null;
};

/**
 * The seller card of design/components.md: a 76px cover strip, the avatar overlapping it,
 * then name, type, rating, where they are and how much they have listed.
 */
export default function SellerGridCard({ seller, onClick, className = '' }) {
  const { t } = useTranslation('common');
  if (!seller?.id) return null;

  const name = seller.name || t('seller.fallbackName');
  const typeLabel = getTypeLabel(seller.type, t);
  const city = getCity(seller);
  const rating = Number.isFinite(Number(seller.rating)) ? Number(seller.rating) : null;
  const votes = Number.isFinite(Number(seller.votes)) ? Number(seller.votes) : 0;
  const listingsCount = Number.isFinite(seller.listingsCount) ? seller.listingsCount : 0;
  const avatar = seller.logo || seller.avatarUrl || null;

  return (
    <CardWrapper as="article" hover className={`relative flex h-full flex-col overflow-hidden [overflow-wrap:anywhere] ${className}`.trim()}>
      {/* The seller record has no cover image yet, so the strip is the design's placeholder. */}
      <div className="h-[76px] w-full bg-card-muted" />

      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* The avatar rides up over the cover strip, as the design draws it. */}
        <div className="-mt-[42px] h-14 w-14 overflow-hidden rounded-full bg-card ring-2 ring-card">
          {avatar ? (
            <img src={avatar} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-card-muted text-[15px] font-semibold text-muted-foreground">
              {getInitials(name)}
            </span>
          )}
        </div>

        <h3 className="text-[17px] font-semibold leading-snug text-foreground">
          <button
            type="button"
            onClick={onClick}
            className="text-left after:absolute after:inset-0 after:content-['']"
          >
            {name}
          </button>
        </h3>

        <div className="flex flex-wrap items-center gap-1.5">
          {typeLabel ? <Badge variant="ad">{typeLabel}</Badge> : null}
          {seller.verified ? <Badge variant="verified">{t('seller.verified')}</Badge> : null}
        </div>

        <RatingStars value={rating ?? 0} countLabel={t('seller.reviews', { count: votes })} />

        <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
          {city ? (
            <>
              <MapPin size={14} strokeWidth={1.5} aria-hidden="true" />
              {city}
              <span aria-hidden="true">·</span>
            </>
          ) : null}
          {t('seller.listings', { count: listingsCount })}
        </p>

        <div className="flex-1" />

        <Button variant="secondary" onClick={onClick} className="relative z-10 mt-2 w-full">
          {t('seller.viewSellerShort')}
        </Button>
      </div>
    </CardWrapper>
  );
}
