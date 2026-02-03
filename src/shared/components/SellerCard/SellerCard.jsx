import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, MapPin, Star } from 'lucide-react';

const PUBLIC_SELLER_TYPES = new Set(['dealer', 'reseller']);

const TYPE_LABELS = { dealer: 'Dealer', reseller: 'Reseller', private: 'Private' };
const DOMAIN_LABELS = { cars: 'Cars', parts: 'Parts' };

const getInitials = (name) => {
  const safe = String(name ?? '').trim();
  if (!safe) return '??';
  return safe.slice(0, 2).toUpperCase();
};

const getLocationLabel = (seller) => {
  const value =
    seller?.city ??
    seller?.location?.city ??
    seller?.address?.city ??
    seller?.cityName;

  const safe = typeof value === 'string' ? value.trim() : '';
  return safe.length > 0 ? safe : null;
};

/**
 * Unified SellerCard component:
 * - variant="full" | "compact" for detail pages
 * - variant="grid" for sellers list
 */
export const SellerCard = ({
  seller,
  variant = 'full',
  actions,
  className = '',
  onClick,
}) => {
  const navigate = useNavigate();

  if (!seller?.id) return null;

  const name = seller?.name || 'Seller';
  const ratingNumber = Number(seller?.rating);
  const rating = Number.isFinite(ratingNumber) && ratingNumber != null ? ratingNumber : null;
  const votesNumber = Number(seller?.votes);
  const votes = Number.isFinite(votesNumber) && votesNumber != null ? votesNumber : null;
  const avatar = seller?.logo || seller?.avatarUrl || null;
  const type = seller?.type || null;
  const typeLabel = TYPE_LABELS[type] ?? type ?? '—';

  if (variant === 'grid') {
    const ratingValue = Number.isFinite(ratingNumber) ? ratingNumber : null;
    const domainLabel = DOMAIN_LABELS[seller?.domain] ?? seller?.domain ?? 'n/a';
    const locationLabel = getLocationLabel(seller);
    const listingsCount = Number.isFinite(seller?.listingsCount)
      ? seller.listingsCount
      : 0;

    const badgeTone =
      seller?.type === 'dealer'
        ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
        : seller?.type === 'reseller'
          ? 'bg-warning/10 text-warning ring-1 ring-warning/30'
          : 'bg-muted text-muted-foreground ring-1 ring-border';

    return (
      <article
        onClick={onClick}
        className="flex h-full w-full cursor-pointer flex-col rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow)] transition hover:shadow-[var(--shadow)]"
      >
        {/* ROW 1: LOGO + BADGE */}
        <div className="flex items-center justify-between">
          <div className="h-15 w-15 overflow-hidden rounded-full ring-1 ring-border">
            {seller?.logo ? (
              <img
                src={seller.logo}
                alt={seller?.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-sm font-semibold text-primary-foreground">
                {getInitials(seller?.name)}
              </div>
            )}
          </div>

          <span
            className={`rounded-full px-3 py-1 text-[11px] font-medium ${badgeTone}`}
          >
            {typeLabel}
          </span>
        </div>

        {/* ROW 2: NAME */}
        <h4 className="mt-2 text-sm font-semibold leading-snug text-foreground">
          {seller?.name ?? 'Seller'}
        </h4>

        <p className="text-sm text-muted-foreground">
          {domainLabel} · {typeLabel}
        </p>

        {/* ROW 3: RATING + LISTINGS */}
        <div className="border-t border-border pt-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {ratingValue != null ? (
              <span className="inline-flex items-center gap-1">
                <Star size={14} className="text-warning" fill="currentColor" aria-hidden="true" />
                <span className="font-semibold text-foreground">
                  {ratingValue.toFixed(1)}
                </span>
              </span>
            ) : null}
            {ratingValue != null ? <span className="text-muted-foreground">•</span> : null}
            <span>{listingsCount} listings</span>
          </div>
        </div>

        {/* ROW 4: CITY */}
        {locationLabel ? (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin size={14} className="text-muted-foreground" aria-hidden="true" />
            <span className="truncate">{locationLabel}</span>
          </div>
        ) : null}

        {/* ROW 5: BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="mt-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-foreground bg-brand hover:opacity-90 transition-opacity"
        >
          View seller →
        </button>
      </article>
    );
  }

  const canOpenPublicPage =
    PUBLIC_SELLER_TYPES.has(seller?.type) && seller?.hasPublicPage === true;

  const openDealerPage = () => {
    if (!canOpenPublicPage || !seller?.id) return;
    navigate(`/sellers/${seller.id}`);
  };

  const onCardKeyDown = (e) => {
    if (!canOpenPublicPage) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDealerPage();
    }
  };

  const filledStars = useMemo(() => {
    if (rating === null) return 0;
    return Math.max(0, Math.min(5, Math.round(rating)));
  }, [rating]);

  // Compact variant (for parts)
  if (variant === 'compact') {
    return (
      <div
        className={[
          'group flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-3 transition',
          canOpenPublicPage ? 'cursor-pointer hover:bg-accent' : 'cursor-default',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={canOpenPublicPage ? `Open seller ${name}` : 'Seller info'}
        onClick={canOpenPublicPage ? openDealerPage : undefined}
        onKeyDown={canOpenPublicPage ? onCardKeyDown : undefined}
        role={canOpenPublicPage ? 'button' : undefined}
        tabIndex={canOpenPublicPage ? 0 : undefined}
      >
        {avatar ? (
          <img
            src={avatar}
            alt=""
            className="h-10 w-10 rounded-full border border-border bg-secondary object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-10 w-10 rounded-full border border-border bg-secondary flex items-center justify-center text-xs font-semibold text-muted-foreground">
            {getInitials(name)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold text-muted-foreground">Sold by</div>
          <div className="mt-0.5 truncate text-sm font-extrabold text-foreground">{name}</div>

          <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            {rating != null ? (
              <span className="inline-flex items-center gap-1">
                <Star size={12} className="text-warning" fill="currentColor" aria-hidden="true" />
                <span className="font-extrabold text-foreground">{rating.toFixed(1)}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">No rating</span>
            )}

            {votes != null ? <span className="text-muted-foreground">({votes})</span> : null}
            {type ? <span className="text-muted-foreground">·</span> : null}
            {type ? <span className="text-muted-foreground">{typeLabel}</span> : null}
          </div>
        </div>

        {canOpenPublicPage ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-muted-foreground transition group-hover:text-foreground"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        ) : null}
      </div>
    );
  }

  // Full variant (for vehicles)
  return (
    <div
      className={[
        `seller-card${canOpenPublicPage ? ' seller-card--clickable' : ''}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Seller card"
      onClick={canOpenPublicPage ? openDealerPage : undefined}
      onKeyDown={canOpenPublicPage ? onCardKeyDown : undefined}
      role={canOpenPublicPage ? 'button' : undefined}
      tabIndex={canOpenPublicPage ? 0 : undefined}
    >
      <div className="seller-card__header">
        <div className="seller-card__avatar" aria-hidden="true">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="h-full w-full object-cover rounded-full"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary text-sm font-semibold text-primary-foreground rounded-full">
              {getInitials(name)}
            </div>
          )}
        </div>
        <div className="seller-card__headerContent">
          <div className="seller-card__titleLine">
            <h4 className="seller-card__name">{name}</h4>

            <span className="seller-card__badge" aria-label="Verified seller">
              <BadgeCheck size={16} aria-hidden="true" />
              Verified
            </span>
          </div>

          <p className="seller-card__type">{typeLabel}</p>

          <div className="seller-card__rating" aria-label="Seller rating">
            <div className="seller-card__stars" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  size={16}
                  className="seller-card__star"
                  fill={i < filledStars ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="seller-card__ratingText">
              {rating !== null ? rating.toFixed(1) : '—'} ({votes ?? 0} reviews)
            </span>
          </div>
        </div>
      </div>

      {actions && <div className="seller-card__body">{actions}</div>}
    </div>
  );
};
