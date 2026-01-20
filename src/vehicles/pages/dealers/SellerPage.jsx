import { useNavigate } from "react-router-dom";
import { autos } from "@/vehicles/api/data";

const DEALER_TYPE = "dealer";
const DEALER_ROUTE_PREFIX = "/dealers";

const buildDealersFromAutos = (vehicles) => {
  const dealersById = new Map();

  vehicles.forEach((vehicle) => {
    const seller = vehicle?.seller;
    if (!seller) return;

    const isPublicDealer =
      seller.type === DEALER_TYPE && seller.hasPublicPage === true;
    if (!isPublicDealer) return;

    const existing = dealersById.get(seller.id);
    if (existing) {
      existing.listingsCount += 1;
      return;
    }

    dealersById.set(seller.id, {
      id: seller.id,
      name: seller.name,
      logo: seller.logo,
      rating: seller.rating,
      listingsCount: 1,
    });
  });

  return Array.from(dealersById.values());
};

export default function SellerPage() {
  const navigate = useNavigate();
  const dealers = buildDealersFromAutos(autos);

  return (
    <div className="w-full px-4 py-10">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
        <header>
          <h1 className="text-2xl font-semibold text-slate-900">Dealers</h1>
          <p className="mt-1 text-sm text-slate-500">
            {dealers.length} dealer{dealers.length === 1 ? "" : "s"} with public
            listings
          </p>
        </header>

        {dealers.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-white px-4 py-6 text-sm text-slate-600">
            No dealers with public listings yet.
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dealers.map((dealer) => {
              const ratingValue = Number.isFinite(dealer.rating)
                ? dealer.rating
                : null;

              return (
                <button
                  key={dealer.id}
                  type="button"
                  onClick={() =>
                    navigate(`${DEALER_ROUTE_PREFIX}/${dealer.id}`)
                  }
                  className="group flex w-full flex-col items-start gap-3 rounded-xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:border-slate-200 hover:shadow-md"
                  aria-label={`Open dealer ${dealer.name}`}
                >
                  {dealer.logo ? (
                    <img
                      src={dealer.logo}
                      alt={`${dealer.name} logo`}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : null}

                  <div className="space-y-1">
                    <h2 className="text-base font-semibold text-slate-900">
                      {dealer.name}
                    </h2>

                    {ratingValue != null ? (
                      <div className="text-sm text-slate-600">
                        Rating: {ratingValue}
                      </div>
                    ) : null}

                    <div className="text-sm text-slate-500">
                      {dealer.listingsCount} listing
                      {dealer.listingsCount === 1 ? "" : "s"}
                    </div>
                  </div>
                </button>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}
