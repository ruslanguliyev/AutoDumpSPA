import { Heart, MapPin, Phone } from "lucide-react";

import { formatInt } from "@/pages/vehicleDetail/utils/formatInt";
import { formatPrice } from "@/pages/vehicleDetail/utils/formatPrice";

const VehicleSummaryCard = ({
  title,
  year,
  mileage,
  price,
  currency,
  location,
  isFavorite,
  onToggleFavorite,
  fuelType,
  transmission,
  engine,
  isFeatured,
  isVerified,
}) => {
  const formattedMileage = formatInt(mileage);
  const displayFuelType = fuelType || "—";
  const displayTransmission = transmission || "—";
  const subtitle = [engine, transmission].filter(Boolean).join(" • ");

  return (
    <article className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <header className="flex w-full items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="truncate text-lg font-semibold leading-tight text-foreground">
            {title}
          </h1>
          <p className="m-0 w-full self-start text-left text-sm text-muted-foreground">
            {subtitle || "—"}
          </p>
        </div>

        <div className="flex flex-col items-end text-right shrink-0">
          <p className="whitespace-nowrap text-3xl font-bold tracking-tight text-chart-1">
            {formatPrice(price, currency)}
          </p>
        </div>
      </header>

      <dl className="mt-4 grid grid-cols-4 gap-3">
        <div className="rounded-xl border border-border/70 bg-muted px-3 py-2.5">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Year
          </dt>
          <dd className="mt-1 text-sm font-semibold text-foreground">{year}</dd>
        </div>
        <div className="rounded-xl border border-border/70 bg-muted px-3 py-2.5">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Mileage
          </dt>
          <dd className="mt-1 text-sm font-semibold text-foreground">
            {formattedMileage} km
          </dd>
        </div>
        <div className="rounded-xl border border-border/70 bg-muted px-3 py-2.5">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Fuel type
          </dt>
          <dd className="mt-1 text-sm font-semibold text-foreground">
            {displayFuelType}
          </dd>
        </div>
        <div className="rounded-xl border border-border/70 bg-muted px-3 py-2.5">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Transmission
          </dt>
          <dd className="mt-1 text-sm font-semibold text-foreground">
            {displayTransmission}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-col gap-3">
        <button
          type="button"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          <span>Contact Seller</span>
        </button>

        <button
          type="button"
          aria-pressed={isFavorite}
          onClick={onToggleFavorite}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border/70 px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${isFavorite
            ? "border-chart-1/40 bg-chart-1/10 text-chart-1"
            : "border-border bg-background text-foreground hover:bg-accent"
            }`}
        >
          <Heart className="h-4 w-4" aria-hidden="true" />
          <span>{isFavorite ? "Added to Favorites" : "Add to Favorites"}</span>
        </button>
      </div>
    </article>
  );
};

export default VehicleSummaryCard;

