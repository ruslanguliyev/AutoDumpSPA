import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, Star } from 'lucide-react';

const PUBLIC_SELLER_TYPES = new Set(['dealer', 'reseller']);

const TYPE_LABELS = { dealer: 'Dealer', reseller: 'Reseller', private: 'Private' };

const getInitials = (name) => {
  const safe = String(name ?? '').trim();
  if (!safe) return '??';
  return safe.slice(0, 2).toUpperCase();
};

/**
 * Unified SellerCard component for use in both vehicle and part detail pages.
 * 
 * Props:
 * - seller: { id, name, type, rating, votes, logo, avatarUrl, hasPublicPage, ... }
 * - variant: 'full' | 'compact' (default: 'full')
 * - actions: ReactNode - Custom action buttons (phone, favorite, etc.)
 * - className: string - Additional CSS classes
 */
export const SellerCard = ({ seller, variant = 'full', actions, className = '' }) => {
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
                <span aria-hidden="true">⭐</span>
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
            <div className="flex h-full w-full items-center justify-center bg-blue-600 text-sm font-semibold text-white rounded-full">
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
