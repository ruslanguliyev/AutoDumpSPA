import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import { useSellersData } from "@/sellers/hooks/useSellersData";

const DOMAIN_LABELS = { cars: "Cars", parts: "Parts" };
const TYPE_LABELS = { dealer: "Dealer", reseller: "Reseller", private: "Private" };

export default function SellerDetailPage({ vehicles = [], parts = [] } = {}) {
  const params = useParams();
  const sellerId = String(params?.sellerId ?? "").trim();

  const sellers = useSellersData({ vehicles, parts });

  const seller = useMemo(() => {
    if (!sellerId) return null;
    return sellers.find((s) => String(s.id) === sellerId) ?? null;
  }, [sellers, sellerId]);

  const domainLabel =
    DOMAIN_LABELS[seller?.domain] ?? (seller?.domain ? String(seller.domain) : "");
  const typeLabel =
    TYPE_LABELS[seller?.type] ?? (seller?.type ? String(seller.type) : "");

  const ratingNumber = Number(seller?.rating);
  const ratingValue = Number.isFinite(ratingNumber) ? ratingNumber : null;
  const votesNumber = Number(seller?.votes);
  const votesValue = Number.isFinite(votesNumber) ? votesNumber : null;

  const city =
    typeof seller?.city === "string" && seller.city.trim() ? seller.city.trim() : null;

  const listingsCount = Number.isFinite(seller?.listingsCount)
    ? seller.listingsCount
    : null;

  if (!sellerId) {
    return (
      <div className="w-full px-4 py-10">
        <div className="mx-auto w-full max-w-[960px] space-y-4">
          <h1 className="text-2xl font-semibold text-slate-900">Seller</h1>
          <p className="text-sm text-slate-600">Missing seller id.</p>
          <Link className="text-sm font-semibold text-blue-700" to="/sellers">
            ← Back to sellers
          </Link>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="w-full px-4 py-10">
        <div className="mx-auto w-full max-w-[960px] space-y-4">
          <h1 className="text-2xl font-semibold text-slate-900">Seller not found</h1>
          <p className="text-sm text-slate-600">
            Seller <span className="font-mono">{sellerId}</span> is not available.
          </p>
          <Link className="text-sm font-semibold text-blue-700" to="/sellers">
            ← Back to sellers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-10">
      <div className="mx-auto w-full max-w-[960px] space-y-6">
        <header className="space-y-2">
          <Link className="inline-flex text-sm font-semibold text-blue-700" to="/sellers">
            ← Back to sellers
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-slate-900">{seller.name}</h1>
            {typeLabel ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 ring-1 ring-slate-200">
                {typeLabel}
              </span>
            ) : null}
          </div>

          {(domainLabel || city) && (
            <p className="text-sm text-slate-500">
              {domainLabel ? <span>{domainLabel}</span> : null}
              {domainLabel && city ? <span className="text-slate-300"> · </span> : null}
              {city ? <span>{city}</span> : null}
            </p>
          )}
        </header>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-slate-400">Rating</p>
              {ratingValue != null ? (
                <p className="text-sm font-semibold text-slate-900">
                  ⭐ {ratingValue.toFixed(1)}
                  {votesValue != null ? (
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      ({votesValue} votes)
                    </span>
                  ) : null}
                </p>
              ) : (
                <p className="text-sm text-slate-500">No rating</p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-slate-400">Listings</p>
              {listingsCount != null ? (
                <p className="text-sm font-semibold text-slate-900">
                  {listingsCount} listing{listingsCount === 1 ? "" : "s"}
                </p>
              ) : (
                <p className="text-sm text-slate-500">—</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}