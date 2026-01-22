import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useSellersStore } from "@/sellers/store/sellersStore";
import { useSellersData } from "@/sellers/hooks/useSellersData";
import SellersFilter from "@/sellers/components/SellersFilter";
import SellersGrid from "@/sellers/components/SellersGrid";

const SELLER_ROUTE_PREFIX = "/sellers";
const DOMAIN_OPTIONS = [
  { value: "all", label: "All" },
  { value: "cars", label: "Cars" },
  { value: "parts", label: "Parts" },
];
// Private sellers don't have public pages — don't expose them in filters.
const SELLER_TYPE_OPTIONS = [
  { value: "dealer", label: "Dealer" },
  { value: "reseller", label: "Reseller" },
];
const RATING_OPTIONS = [
  { value: "4.5", label: "4.5+" },
  { value: "4.0", label: "4.0+" },
  { value: "3.5", label: "3.5+" },
];
const LISTING_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "1-10", label: "1-10" },
  { value: "10-50", label: "10-50" },
  { value: "50+", label: "50+" },
];
const SORT_OPTIONS = [
  { value: "rating", label: "Rating" },
  { value: "listings", label: "Listings" },
  { value: "newest", label: "Newest" },
  { value: "az", label: "A-Z" },
];
const DEFAULT_SELLER_TYPES = ["dealer", "reseller"];
const DEFAULT_RATING_FILTER = "4.5";
const DEFAULT_LISTING_FILTER = "any";
const DEFAULT_CITY = "";
const DEFAULT_SORT = "rating";
const DEFAULT_DOMAIN = "all";
const DEFAULT_SELLER_TYPE = "";

export default function SellerPage({
  vehicles = [],
  parts = [],
  isPartsLoading = false,
} = {}) {
  const navigate = useNavigate();
  const domainFilter = useSellersStore((s) => s.domainFilter);
  const typeFilter = useSellersStore((s) => s.typeFilter);
  const setDomainFilter = useSellersStore((s) => s.setDomainFilter);
  const setTypeFilter = useSellersStore((s) => s.setTypeFilter);
  const resetFilters = useSellersStore((s) => s.resetFilters);
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState(() => {
    if (typeFilter === "dealer") return ["dealer"];
    if (typeFilter === "reseller") return ["reseller"];
    return DEFAULT_SELLER_TYPES;
  });
  const [selectedRating, setSelectedRating] = useState(DEFAULT_RATING_FILTER);
  const [selectedListings, setSelectedListings] = useState(DEFAULT_LISTING_FILTER);
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITY);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);

  const sellers = useSellersData({ vehicles, parts });

  const filteredSellers = useMemo(() => {
    const ratingMin = Number(selectedRating);
    const hasRatingMin = Number.isFinite(ratingMin) && selectedRating !== "";

    return sellers.filter((seller) => {
      if (domainFilter !== "all" && seller.domain !== domainFilter) return false;
      if (typeFilter !== "all" && seller.type !== typeFilter) return false;
      // Safety: no "private" sellers on sellers page
      if (seller?.type === "private") return false;
      if (search?.trim()) {
        const q = search.trim().toLowerCase();
        const hay = `${seller.name ?? ""} ${seller.city ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (selectedCity) {
        if (String(seller?.city ?? "").trim() !== String(selectedCity).trim())
          return false;
      }
      if (hasRatingMin) {
        const r = Number(seller?.rating);
        if (!Number.isFinite(r) || r < ratingMin) return false;
      }
      if (selectedListings && selectedListings !== "any") {
        const count = Number(seller?.listingsCount);
        const n = Number.isFinite(count) ? count : 0;
        if (selectedListings === "1-10" && (n < 1 || n > 10)) return false;
        if (selectedListings === "10-50" && (n < 10 || n > 50)) return false;
        if (selectedListings === "50+" && n < 50) return false;
      }
      return true;
    });
  }, [
    domainFilter,
    search,
    selectedCity,
    selectedListings,
    selectedRating,
    sellers,
    typeFilter,
  ]);

  const isFiltering = domainFilter !== "all" || typeFilter !== "all";
  const countLabel = isFiltering
    ? `${filteredSellers.length} of ${sellers.length} sellers`
    : `${sellers.length} seller${sellers.length === 1 ? "" : "s"}`;
  const showCountLabel = `Show ${filteredSellers.length} seller${
    filteredSellers.length === 1 ? "" : "s"
  }`;
  const isRatingPillActive = selectedRating === "4.5";

  const handleSellerTypeToggle = (value) => {
    setSelectedTypes((prev) => {
      const next = prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value];
      const hasDealer = next.includes("dealer");
      const hasReseller = next.includes("reseller");

      if (hasDealer && !hasReseller) {
        setTypeFilter("dealer");
      } else if (hasReseller && !hasDealer) {
        setTypeFilter("reseller");
      } else {
        setTypeFilter("all");
      }

      return next;
    });
  };

  const sellerTypeValue = useMemo(() => {
    // "Any" when multiple or all selected
    if (!selectedTypes?.length) return DEFAULT_SELLER_TYPE;
    if (selectedTypes.length === 1) return selectedTypes[0];
    if (selectedTypes.length === DEFAULT_SELLER_TYPES.length) return DEFAULT_SELLER_TYPE;
    return DEFAULT_SELLER_TYPE;
  }, [selectedTypes]);

  const cityOptions = useMemo(() => {
    const set = new Set();
    sellers.forEach((s) => {
      const c = typeof s?.city === "string" ? s.city.trim() : "";
      if (c) set.add(c);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [sellers]);

  const sellerFilterOptions = useMemo(() => {
    const domains = [
      { value: DEFAULT_DOMAIN, label: "All" },
      ...DOMAIN_OPTIONS.filter((o) => o.value !== DEFAULT_DOMAIN),
    ];
    const sellerTypes = [
      { value: DEFAULT_SELLER_TYPE, label: "Any" },
      ...SELLER_TYPE_OPTIONS,
    ];
    const ratings = [
      { value: "", label: "Any" },
      ...RATING_OPTIONS,
    ];
    const listings = [
      { value: "", label: "Any" },
      ...LISTING_OPTIONS,
    ];
    const cities = [{ value: "", label: "Any" }, ...cityOptions.map((c) => ({ value: c, label: c }))];
    const sorts = SORT_OPTIONS;

    return { domains, sellerTypes, ratings, listings, cities, sorts };
  }, [cityOptions]);

  const sellerFilterState = useMemo(() => {
    return {
      search,
      domain: domainFilter,
      sellerType: sellerTypeValue,
      rating: selectedRating,
      listings: selectedListings,
      city: selectedCity,
      verifiedOnly,
      sort: sortBy,
    };
  }, [
    domainFilter,
    search,
    selectedCity,
    selectedListings,
    selectedRating,
    sellerTypeValue,
    sortBy,
    verifiedOnly,
  ]);

  const handleSellerFilterChange = (key, value) => {
    if (key === "search") return setSearch(value);
    if (key === "domain") return setDomainFilter(value || "all");
    if (key === "sellerType") {
      const v = value || "all";
      if (v === "all" || v === "") {
        setSelectedTypes(DEFAULT_SELLER_TYPES);
        return setTypeFilter("all");
      }
      setSelectedTypes([v]);
      return setTypeFilter(v);
    }
    if (key === "rating") return setSelectedRating(value || "");
    if (key === "listings") return setSelectedListings(value || DEFAULT_LISTING_FILTER);
    if (key === "city") return setSelectedCity(value || "");
    if (key === "verifiedOnly") return setVerifiedOnly(!!value);
    if (key === "sort") return setSortBy(value || DEFAULT_SORT);
  };

  const handleReset = () => {
    resetFilters();
    setSearch("");
    setSelectedTypes(DEFAULT_SELLER_TYPES);
    setSelectedRating(DEFAULT_RATING_FILTER);
    setSelectedListings(DEFAULT_LISTING_FILTER);
    setSelectedCity(DEFAULT_CITY);
    setVerifiedOnly(false);
    setSortBy(DEFAULT_SORT);
  };

  return (
    <div className="w-full px-4 py-10">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
        <header className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Sellers</h1>
            <p className="mt-1 text-sm text-slate-500">
              {countLabel} with public pages
            </p>
          </div>

          <SellersFilter
            filters={sellerFilterState}
            options={sellerFilterOptions}
            onChange={handleSellerFilterChange}
            onReset={handleReset}
            total={filteredSellers.length}
            isLoading={false}
          />
        </header>

        {isPartsLoading && sellers.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-white px-4 py-6 text-sm text-slate-600">
            Loading sellers...
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-white px-4 py-6 text-sm text-slate-600">
            No sellers match the selected filters.
          </div>
        ) : (
          <SellersGrid
            sellers={filteredSellers}
            onSellerClick={(seller) =>
              navigate(`${SELLER_ROUTE_PREFIX}/${seller.id}`)
            }
          />
        )}
      </div>
    </div>
  );
}
