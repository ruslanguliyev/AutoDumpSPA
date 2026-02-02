import { formatInt } from "@/vehicles/pages/vehicleDetail/utils/formatInt";
import { formatPrice } from "@/vehicles/pages/vehicleDetail/utils/formatPrice";

const VehicleSummaryCard = ({
  title,
  year,
  mileage,
  price,
  currency,
  fuelType,
  transmission,
  engine,
}) => {
  const formattedMileage = formatInt(mileage);
  const displayFuelType = fuelType || "—";
  const displayTransmission = transmission || "—";
  const subtitle = [engine, transmission].filter(Boolean).join(" • ");

  return (
    <article className="w-full rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow)] transition-shadow hover:shadow-[var(--shadow)]">
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

    </article>
  );
};

export default VehicleSummaryCard;
