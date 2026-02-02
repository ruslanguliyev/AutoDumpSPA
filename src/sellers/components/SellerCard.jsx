import { MapPin, Star } from "lucide-react";

const DOMAIN_LABELS = { cars: "Cars", parts: "Parts" };
const TYPE_LABELS = { dealer: "Dealer", reseller: "Reseller", private: "Private" };


const getInitials = (name) => {
  const safe = String(name ?? "").trim();
  if (!safe) return "??";
  return safe.slice(0, 2).toUpperCase();
};

const getLocationLabel = (seller) => {
  const value =
    seller?.city ??
    seller?.location?.city ??
    seller?.address?.city ??
    seller?.cityName;

  const safe = typeof value === "string" ? value.trim() : "";
  return safe.length > 0 ? safe : null;
};

const SellerCard = ({ seller, onClick }) => {
  const ratingNumber = Number(seller?.rating);
  const ratingValue = Number.isFinite(ratingNumber) ? ratingNumber : null;
  const typeLabel = TYPE_LABELS[seller?.type] ?? seller?.type ?? "n/a";
  const domainLabel = DOMAIN_LABELS[seller?.domain] ?? seller?.domain ?? "n/a";
  const locationLabel = getLocationLabel(seller);

  const listingsCount = Number.isFinite(seller?.listingsCount)
    ? seller.listingsCount
    : 0;

  const badgeTone =
    seller?.type === "dealer"
      ? "bg-primary/10 text-primary ring-1 ring-primary/30"
      : seller?.type === "reseller"
        ? "bg-warning/10 text-warning ring-1 ring-warning/30"
        : "bg-muted text-muted-foreground ring-1 ring-border";

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
        {seller?.name ?? "Seller"}
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
};

export default SellerCard;
