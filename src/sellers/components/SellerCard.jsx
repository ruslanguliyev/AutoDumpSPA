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
      ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
      : seller?.type === "reseller"
        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
        : "bg-slate-100 text-slate-600 ring-1 ring-slate-200";

  return (
    <article
      onClick={onClick}
      className="flex h-full w-full cursor-pointer flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      {/* ROW 1: LOGO + BADGE */}
      <div className="flex items-center justify-between">
        <div className="h-12 w-12 overflow-hidden rounded-full ring-1 ring-slate-200">
          {seller?.logo ? (
            <img
              src={seller.logo}
              alt={seller?.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-blue-600 text-sm font-semibold text-white">
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
      <h4 className="mt-2 text-sm font-semibold leading-snug text-slate-900">
        {seller?.name ?? "Seller"}
      </h4>

      <p className="text-sm text-slate-500">
        {domainLabel} · {typeLabel}
      </p>

      {/* ROW 3: RATING + LISTINGS */}
      <div className="border-t border-slate-300 pt-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          {ratingValue != null ? (
            <span className="inline-flex items-center gap-1">
              <span className="text-amber-500">⭐</span>
              <span className="font-semibold text-slate-900">
                {ratingValue.toFixed(1)}
              </span>
            </span>
          ) : null}
          {ratingValue != null ? <span className="text-slate-300">•</span> : null}
          <span>{listingsCount} listings</span>
        </div>
      </div>


      {/* ROW 4: CITY */}
      {locationLabel ? (
        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
          <span aria-hidden="true">📍</span>
          <span className="truncate">{locationLabel}</span>
        </div>
      ) : null}

      {/* ROW 5: BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className="mt-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        View seller →
      </button>
    </article>
  );
};

export default SellerCard;
