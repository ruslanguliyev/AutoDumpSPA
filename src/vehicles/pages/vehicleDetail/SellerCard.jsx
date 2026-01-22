import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  CalendarDays,
  Clock,
  Heart,
  MapPin,
  Phone,
  Star,
} from "lucide-react";

const PUBLIC_SELLER_TYPES = new Set(["dealer", "reseller"]);

const SellerCard = ({ seller, phone, location, isFavorite, onToggleFavorite }) => {
  const navigate = useNavigate();
  const [showPhone, setShowPhone] = useState(false);

  const ratingNumber = Number(seller?.rating);
  const rating = Number.isFinite(ratingNumber) ? ratingNumber : null;

  const votesNumber = Number(seller?.votes);
  const votes = Number.isFinite(votesNumber) ? votesNumber : 0;

  const filledStars = useMemo(() => {
    if (rating === null) return 0;
    return Math.max(0, Math.min(5, Math.round(rating)));
  }, [rating]);

  const preventCardNavigation = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const favoriteLabel = isFavorite ? "Added to Favorites" : "Add to Favorites";

  const canOpenPublicPage =
    PUBLIC_SELLER_TYPES.has(seller?.type) && seller?.hasPublicPage === true;

  const openDealerPage = () => {
    if (!canOpenPublicPage || !seller?.id) return;
    navigate(`/sellers/${seller.id}`);
  };

  const onCardKeyDown = (e) => {
    if (!canOpenPublicPage) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDealerPage();
    }
  };

  const content = (
    <div
      className={`seller-card${canOpenPublicPage ? " seller-card--clickable" : ""}`}
      aria-label="Seller card"
      onClick={canOpenPublicPage ? openDealerPage : undefined}
      onKeyDown={canOpenPublicPage ? onCardKeyDown : undefined}
      role={canOpenPublicPage ? "button" : undefined}
      tabIndex={canOpenPublicPage ? 0 : undefined}
    >
      <div className="seller-card__header">
        <div className="seller-card__avatar" aria-hidden="true" />
        <div className="seller-card__headerContent">
          <div className="seller-card__titleLine">
            <h4 className="seller-card__name">{seller?.name ?? "—"}</h4>

            <span className="seller-card__badge" aria-label="Verified seller">
              <BadgeCheck size={16} aria-hidden="true" />
              Verified
            </span>
          </div>

          <p className="seller-card__type">{seller?.type ?? "—"}</p>

          <div className="seller-card__rating" aria-label="Seller rating">
            <div className="seller-card__stars" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  size={16}
                  className="seller-card__star"
                  fill={i < filledStars ? "currentColor" : "none"}
                />
              ))}
            </div>
            <span className="seller-card__ratingText">
              {rating !== null ? rating.toFixed(1) : "—"} ({votes} reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="seller-card__body">
        <div className="seller-card__meta">
          <div className="seller-card__metaRow">
            <MapPin size={16} aria-hidden="true" />
            <span>{location}</span>
          </div>
          <div className="seller-card__metaRow">
            <CalendarDays size={16} aria-hidden="true" />
            <span>Member since {seller?.memberSince ?? "—"}</span>
          </div>
          <div className="seller-card__metaRow">
            <Clock size={16} aria-hidden="true" />
            <span>Usually responds within {seller?.responseTime ?? "—"}</span>
          </div>
        </div>

        <div className="seller-card__actions">
          <button
            type="button"
            className="seller-card__primaryButton"
            onClick={(e) => {
              preventCardNavigation(e);
              setShowPhone((v) => !v);
            }}
          >
            <Phone size={18} aria-hidden="true" />
            {showPhone ? phone ?? "—" : "Show Phone Number"}
          </button>

          <button
            type="button"
            aria-pressed={isFavorite}
            className={`seller-card__secondaryButton${isFavorite ? " seller-card__secondaryButton--active" : ""}`}
            onClick={(e) => {
              preventCardNavigation(e);
              onToggleFavorite?.();
            }}
          >
            <Heart size={18} aria-hidden="true" />
            {favoriteLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return content;
};

export default SellerCard;
