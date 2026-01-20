import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { autos } from "@/vehicles/api/data";
import { fetchParts } from "@/parts/api/parts.api";
import { PARTS_DEFAULT_FILTER } from "@/parts/utils/parts.constants";
import AutoCard from "@/vehicles/components/AutoCardComponent/AutoCard";
import PartCard from "@/parts/components/PartCard/PartCard";
import NotFound from "@/app/pages/notFound/NotFound";

const DEALER_TYPE = "dealer";
const PARTS_QUERY_KEY = "parts";

const isPublicDealer = (seller) =>
  seller?.type === DEALER_TYPE && seller?.hasPublicPage === true;

export default function DealerDetailPage() {
  const { dealerId } = useParams();

  const dealerVehicles = useMemo(() => {
    if (!dealerId) return [];
    return autos.filter(
      (vehicle) =>
        vehicle?.seller?.id === dealerId && isPublicDealer(vehicle?.seller)
    );
  }, [dealerId]);

  const dealerFromVehicles = useMemo(() => {
    if (!dealerId) return null;
    const match = autos.find((vehicle) => vehicle?.seller?.id === dealerId);
    return match?.seller ?? null;
  }, [dealerId]);

  const partsQuery = useQuery({
    queryKey: [PARTS_QUERY_KEY, "dealer", dealerId],
    queryFn: () =>
      fetchParts({ ...PARTS_DEFAULT_FILTER, limit: 10_000, offset: 0 }),
    staleTime: 30_000,
    enabled: Boolean(dealerId),
  });

  const dealerParts = useMemo(() => {
    if (!dealerId) return [];
    const items = partsQuery.data?.items ?? [];
    return items.filter(
      (part) => part?.seller?.id === dealerId && isPublicDealer(part?.seller)
    );
  }, [dealerId, partsQuery.data?.items]);

  const dealerFromParts = useMemo(() => {
    const items = partsQuery.data?.items ?? [];
    const match = items.find((part) => part?.seller?.id === dealerId);
    return match?.seller ?? null;
  }, [dealerId, partsQuery.data?.items]);

  const dealer = dealerFromVehicles ?? dealerFromParts;
  const dealerDomain = dealer?.domain ?? null;
  const isCarsDealer = dealerDomain === "cars";
  const isPartsDealer = dealerDomain === "parts";
  const shouldWaitForParts = !dealer && partsQuery.isLoading;

  if (shouldWaitForParts) {
    return (
      <div className="w-full px-4 py-12">
        <div className="mx-auto w-full max-w-[640px] text-sm text-slate-500">
          Loading dealer details…
        </div>
      </div>
    );
  }

  if (!dealer || !isPublicDealer(dealer) || (!isCarsDealer && !isPartsDealer)) {
    return <NotFound />;
  }

  const ratingValue = Number.isFinite(Number(dealer.rating))
    ? Number(dealer.rating)
    : null;

  return (
    <div className="w-full px-4 py-10">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8">
        <header className="flex flex-wrap items-center gap-4">
          {dealer.logo ? (
            <img
              src={dealer.logo}
              alt={`${dealer.name} logo`}
              className="h-16 w-16 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-full border border-slate-200 bg-slate-100" />
          )}

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900">
              {dealer.name}
            </h1>
            {ratingValue != null ? (
              <div className="text-sm text-slate-600">
                Rating: {ratingValue.toFixed(1)}
              </div>
            ) : null}
            <div className="text-sm text-slate-500">
              {isCarsDealer
                ? `${dealerVehicles.length} vehicle${dealerVehicles.length === 1 ? "" : "s"}`
                : null}
              {isPartsDealer
                ? `${dealerParts.length} part${dealerParts.length === 1 ? "" : "s"}`
                : null}
            </div>
          </div>
        </header>

        {isCarsDealer ? (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Vehicles</h2>
            {dealerVehicles.length === 0 ? (
              <div className="rounded-xl border border-slate-100 bg-white px-4 py-6 text-sm text-slate-600">
                This dealer has no vehicles listed yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {dealerVehicles.map((car) => (
                  <AutoCard key={car.id} car={car} />
                ))}
              </div>
            )}
          </section>
        ) : null}

        {isPartsDealer ? (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Parts</h2>
            {partsQuery.isLoading ? (
              <div className="text-sm text-slate-500">Loading parts…</div>
            ) : dealerParts.length === 0 ? (
              <div className="rounded-xl border border-slate-100 bg-white px-4 py-6 text-sm text-slate-600">
                This dealer has no parts listed yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {dealerParts.map((part) => (
                  <PartCard key={part.id} part={part} />
                ))}
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}
