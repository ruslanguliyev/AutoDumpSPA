import { useTranslation } from "react-i18next";
import { formatInt } from "@/vehicles/pages/vehicleDetail/utils/formatInt";
import { formatPrice } from "@/vehicles/pages/vehicleDetail/utils/formatPrice";
import "./VehicleSummaryCard.scss";

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
  const { t } = useTranslation("vehicle");
  const formattedMileage = formatInt(mileage);
  const noValue = t("summary.noValue");
  const displayFuelType = fuelType || noValue;
  const displayTransmission = transmission || noValue;
  const subtitle = [engine, transmission].filter(Boolean).join(" • ");

  return (
    <article className="vehicle-summary-card min-w-0 w-full rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow)] transition-shadow hover:shadow-[var(--shadow)]">
      <header className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="vehicle-summary-card__title font-semibold leading-tight text-foreground">
            {title}
          </h1>
          <p className="m-0 text-sm text-muted-foreground">
            {subtitle || noValue}
          </p>
        </div>

        <div className="flex flex-col items-start shrink-0 sm:items-end sm:text-right">
          <p className="whitespace-nowrap text-2xl font-bold tracking-tight text-chart-1 sm:text-3xl">
            {formatPrice(price, currency)}
          </p>
        </div>
      </header>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex min-h-[4.5rem] min-w-0 w-full flex-col items-start justify-center overflow-hidden rounded-xl border border-border/70 bg-muted px-3 py-2.5">
          <dt className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("summary.year")}
          </dt>
          <dd className="mt-1 min-w-0 truncate text-sm font-semibold text-foreground">{year}</dd>
        </div>
        <div className="flex min-h-[4.5rem] min-w-0 w-full flex-col items-start justify-center overflow-hidden rounded-xl border border-border/70 bg-muted px-3 py-2.5">
          <dt className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("summary.mileage")}
          </dt>
          <dd className="mt-1 min-w-0 truncate text-sm font-semibold text-foreground">
            {formattedMileage} {t("specs.km")}
          </dd>
        </div>
        <div className="flex min-h-[4.5rem] min-w-0 w-full flex-col items-start justify-center overflow-hidden rounded-xl border border-border/70 bg-muted px-3 py-2.5">
          <dt className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("summary.fuelType")}
          </dt>
          <dd className="mt-1 min-w-0 truncate text-sm font-semibold text-foreground">
            {displayFuelType}
          </dd>
        </div>
        <div className="flex min-h-[4.5rem] min-w-0 w-full flex-col items-start justify-center overflow-hidden rounded-xl border border-border/70 bg-muted px-3 py-2.5">
          <dt className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("summary.transmission")}
          </dt>
          <dd className="mt-1 min-w-0 truncate text-sm font-semibold text-foreground">
            {displayTransmission}
          </dd>
        </div>
      </dl>

    </article>
  );
};

export default VehicleSummaryCard;
