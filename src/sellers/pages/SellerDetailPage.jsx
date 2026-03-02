import { useMemo, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BadgeCheck,
  Calendar,
  Heart,
  Instagram,
  MapPin,
  Phone,
  Search,
  Share2,
} from "lucide-react";

import { useSellersData } from "@/sellers/hooks/useSellersData";
import { useFavoritesStore } from "@/shared/store/favoritesStore";
import { useDebounce } from "@/shared/hooks/useDebounce";
import Breadcrumbs from "@/shared/ui/Breadcrumbs/Breadcrumbs";
import AutoCard from "@/vehicles/components/AutoCardComponent/AutoCard";
import PartCard from "@/parts/components/PartCard/PartCard";
import "./SellerDetailPage.scss";

const getInitials = (name) => {
  const safe = String(name ?? "").trim();
  if (!safe) return "??";
  return safe.slice(0, 2).toUpperCase();
};

/** Returns years active or null if invalid. */
const getYearsActive = (memberSince) => {
  if (!memberSince) return null;
  const date = new Date(memberSince);
  if (Number.isNaN(date.getTime())) return null;
  const years = new Date().getFullYear() - date.getFullYear();
  return Number.isFinite(years) && years >= 0 ? years : null;
};

export default function SellerDetailPage({
  vehicles = [],
  parts = [],
  isLoading = false,
  error = null,
} = {}) {
  const { t } = useTranslation("sellers");
  const params = useParams();
  const sellerId = String(params?.sellerId ?? "").trim();

  const [activeTab, setActiveTab] = useState("listings");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 350);

  const sellers = useSellersData({ vehicles, parts });

  // Get full seller data from original vehicles/parts
  const fullSellerData = useMemo(() => {
    if (!sellerId) return null;

    // Try to find seller in vehicles first
    const vehicleSeller = vehicles.find(
      (v) => v?.seller?.id && String(v.seller.id) === sellerId
    )?.seller;

    if (vehicleSeller) return vehicleSeller;

    // Try to find seller in parts
    const partSeller = parts.find(
      (p) => p?.seller?.id && String(p.seller.id) === sellerId
    )?.seller;

    return partSeller ?? null;
  }, [vehicles, parts, sellerId]);

  const seller = useMemo(() => {
    if (!sellerId) return null;
    const aggregated = sellers.find((s) => String(s.id) === sellerId) ?? null;
    if (!aggregated || !fullSellerData) return aggregated;
    // Merge: fullSellerData overwrites, but preserve aggregated.listingsCount (not in raw seller)
    return {
      ...aggregated,
      ...fullSellerData,
      listingsCount: aggregated.listingsCount,
    };
  }, [sellers, sellerId, fullSellerData]);

  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) =>
    seller ? s.isFavorited("seller", seller.id) : false
  );

  const ratingNumber = Number(seller?.rating);
  const ratingValue = Number.isFinite(ratingNumber) ? ratingNumber : null;
  const votesNumber = Number(seller?.votes);
  const votesValue = Number.isFinite(votesNumber) ? votesNumber : null;

  const city =
    typeof seller?.city === "string" && seller.city.trim() ? seller.city.trim() : null;
  const country = seller?.country ?? "Germany";

  const listingsCount = Number.isFinite(seller?.listingsCount)
    ? seller.listingsCount
    : null;

  const avatar = seller?.logo || seller?.avatarUrl || null;
  const coverImage = seller?.coverImage || null;
  const description = seller?.description || null;
  const phone = seller?.phone || null;
  const whatsapp = seller?.whatsapp || seller?.whatsappUrl || null;
  const instagramUrl = seller?.instagramUrl || null;
  const verified = seller?.verified !== false && seller?.hasPublicPage === true;
  const memberSince = seller?.memberSince || null;
  const yearsActive = getYearsActive(memberSince);
  const isPartsSeller = seller?.domain === "parts";

  // Get seller's listings (vehicles/parts)
  const sellerListings = useMemo(() => {
    if (!sellerId) return { vehicles: [], parts: [] };
    const sellerVehicles = vehicles.filter(
      (v) => v?.seller?.id && String(v.seller.id) === sellerId
    );
    const sellerParts = parts.filter(
      (p) => p?.seller?.id && String(p.seller.id) === sellerId
    );

    if (!debouncedSearchQuery.trim()) {
      return { vehicles: sellerVehicles, parts: sellerParts };
    }

    const query = debouncedSearchQuery.toLowerCase().trim();
    const filteredVehicles = sellerVehicles.filter((item) => {
      const brand = item?.brand?.toLowerCase() || "";
      const model = item?.model?.toLowerCase() || "";
      return brand.includes(query) || model.includes(query);
    });
    const filteredParts = sellerParts.filter((item) => {
      const name = item?.name?.toLowerCase() || "";
      const brand = item?.brand?.toLowerCase() || "";
      const model = item?.model?.toLowerCase() || "";
      return name.includes(query) || brand.includes(query) || model.includes(query);
    });

    return { vehicles: filteredVehicles, parts: filteredParts };
  }, [vehicles, parts, sellerId, debouncedSearchQuery]);

  const handleLocationClick = useCallback(() => {
    if (!city) return;
    const locationQuery = `${city}, ${country}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      locationQuery
    )}`;
    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  }, [city, country]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: seller?.name || t("detail.fallbackName"),
          url,
        });
      } catch (err) {
        // User cancelled or error occurred
        if (err.name !== "AbortError") {
          try {
            await navigator.clipboard.writeText(url);
          } catch {
            // Fallback failed
          }
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        // Clipboard API not available
      }
    }
  }, [seller?.name, t]);

  const handleFavoriteToggle = useCallback(() => {
    if (!seller?.id) return;
    toggleFavorite({
      type: "seller",
      id: seller.id,
      title: seller.name || t("detail.fallbackName"),
      thumbnail: avatar || null,
    });
  }, [seller, toggleFavorite, avatar, t]);

  if (!sellerId) {
    return (
      <div className="seller-detail">
        <div className="seller-detail__container">
          <h1>{t("detail.fallbackName")}</h1>
          <p>{t("detail.missingId")}</p>
          <Link to="/sellers">{t("detail.backToSellers")}</Link>
        </div>
      </div>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : String(error);
    return (
      <div className="seller-detail">
        <div className="seller-detail__container">
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-sm text-destructive">
            <div className="font-semibold">{t("errors.loadFailed")}</div>
            <div className="mt-1">{message}</div>
          </div>
          <Link to="/sellers" className="mt-4 inline-block text-sm underline">
            {t("detail.backToSellers")}
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="seller-detail">
        <div className="seller-detail__container">
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            {t("detail.loading")}
          </div>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="seller-detail">
        <div className="seller-detail__container">
          <h1>{t("detail.notFound")}</h1>
          <p>{t("detail.notAvailable", { id: sellerId })}</p>
          <Link to="/sellers">{t("detail.backToSellers")}</Link>
        </div>
      </div>
    );
  }

  const allListingsCount = sellerListings.vehicles.length + sellerListings.parts.length;

  const breadcrumbs = [
    { label: t("detail.breadcrumbs.home"), to: "/" },
    { label: t("detail.breadcrumbs.sellers"), to: "/sellers" },
    { label: seller?.name || t("detail.fallbackName") },
  ];

  const searchPlaceholder = isPartsSeller
    ? t("detail.searchPlaceholderParts")
    : t("detail.searchPlaceholder");
  const stockTabLabel = isPartsSeller ? t("detail.tabs.parts") : t("detail.tabs.stock");
  const verifiedLabel = isPartsSeller
    ? t("card.verifiedPartsSeller")
    : t("card.verifiedDealer");
  const displayDescription =
    description || (isPartsSeller ? t("detail.descriptionPlaceholderParts") : null);
  const emptyListingsKey = isPartsSeller ? "detail.empty.noParts" : "detail.empty.noListings";

  return (
    <div className="seller-detail" data-seller-domain={seller?.domain ?? undefined}>
      {/* Hero Section */}
      <section
        className={`seller-hero ${isPartsSeller ? "seller-hero--parts" : ""}`}
        style={
          coverImage
            ? {
              backgroundImage: `url(${coverImage})`,
            }
            : {}
        }
      >
        <div className="seller-hero__overlay" />
      </section>

      {/* Seller Info Card */}
      <div className="seller-card-wrapper">
        <div className="seller-card">
          <div className="seller-card__header">
            <div className="seller-card__identity">
              <div className="seller-card__avatar">
                  {avatar ? (
                  <img src={avatar} alt={seller.name || t("detail.fallbackName")} />
                ) : (
                  <div className="seller-card__avatar-placeholder">
                    {getInitials(seller.name)}
                  </div>
                )}
              </div>

              <div className="seller-card__info">
                <div className="seller-card__name-row">
                  <h1 className="seller-card__name">{seller.name}</h1>
                  {verified && (
                    <span className="seller-card__verified">
                      <BadgeCheck size={14} />
                      {verifiedLabel}
                    </span>
                  )}
                </div>

                <div className="seller-card__meta-row">
                  {ratingValue != null && (
                    <div className="seller-card__meta-item seller-card__meta-item--rating">
                      <div className="seller-card__meta-icon">
                        <span className="seller-card__rating-star">★</span>
                      </div>
                      <div className="seller-card__meta-content">
                        <div className="seller-card__meta-value">
                          {ratingValue.toFixed(1)}
                        </div>
                          {votesValue != null && (
                          <div className="seller-card__meta-label">
                            <span className="seller-card__meta-label-desktop">
                              ({t("card.reviews", { count: votesValue })})
                            </span>
                            <span className="seller-card__meta-label-mobile">
                              {t("card.reviews", { count: votesValue })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {city && (
                    <div className="seller-card__meta-item seller-card__meta-item--location">
                      <div className="seller-card__meta-icon">
                        <MapPin size={18} />
                      </div>
                      <div className="seller-card__meta-content">
                        <div className="seller-card__meta-value">
                          <span className="seller-card__meta-value-desktop">
                            {city}
                            {country && `, ${country}`}
                          </span>
                          <span className="seller-card__meta-value-mobile">
                            {city}
                          </span>
                        </div>
                        <div className="seller-card__meta-label">
                          <span className="seller-card__meta-label-mobile-only">
                            {country || t("card.location")}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {yearsActive != null && (
                    <div className="seller-card__meta-item seller-card__meta-item--member">
                      <div className="seller-card__meta-icon">
                        <Calendar size={18} />
                      </div>
                      <div className="seller-card__meta-content">
                        <div className="seller-card__meta-value">
                          {yearsActive} {t("card.yrs")}
                        </div>
                        <div className="seller-card__meta-label">
                          {t("card.activeSeller")}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {displayDescription && (
                  <div className="seller-card__description">
                    <p className="seller-card__description-text">{displayDescription}</p>
                  </div>
                )}
              </div>
            </div>


            <div className="seller-actions">
              <div className="seller-actions__content">
                <div className="seller-actions__buttons">
                  {phone && (
                    <a
                      href={`tel:${phone.replace(/\s/g, "")}`}
                      className="seller-actions__button seller-actions__button--phone"
                    >
                      <Phone size={16} />
                      {t("card.showNumber")}
                    </a>
                  )}

                  {whatsapp ? (
                    <a
                      href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="seller-actions__button seller-actions__button--whatsapp"
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      {t("card.whatsapp")}
                    </a>
                  ) : null}
                </div>

                <div className="seller-actions__icons">
                <button
                  onClick={handleFavoriteToggle}
                  className={`seller-actions__icon ${isFavorite ? "seller-actions__icon--active" : ""
                    }`}
                  aria-label={isFavorite ? t("card.removeFromFavorites") : t("card.addToFavorites")}
                  type="button"
                >
                  <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                </button>

                <button
                  onClick={handleShare}
                  className="seller-actions__icon"
                  aria-label={t("card.share")}
                  type="button"
                >
                  <Share2 size={18} />
                </button>

                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="seller-actions__icon"
                    aria-label={t("card.instagram")}
                  >
                    <Instagram size={18} />
                  </a>
                )}
              </div>
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* Main Content */}
      <div className="seller-detail__container">
        <Breadcrumbs items={breadcrumbs} />
        {/* Tabs and Search */}
        <div className="seller-tabs">
          <div className="seller-tabs__container">
            <div className="seller-tabs__list">
              <button
                onClick={() => setActiveTab("listings")}
                className={`seller-tabs__item ${activeTab === "listings" ? "seller-tabs__item--active" : ""
                  }`}
                type="button"
              >
                {stockTabLabel} ({listingsCount ?? 0})
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`seller-tabs__item ${activeTab === "reviews" ? "seller-tabs__item--active" : ""
                  }`}
                type="button"
              >
                {t("detail.tabs.reviews")} ({votesValue ?? 0})
              </button>
              <button
                onClick={() => setActiveTab("about")}
                className={`seller-tabs__item ${activeTab === "about" ? "seller-tabs__item--active" : ""
                  }`}
                type="button"
              >
                {t("detail.tabs.about")}
              </button>
            </div>

            {/* Search Bar */}
            {activeTab === "listings" && (
              <div className="seller-tabs__search">
                <Search size={18} className="seller-tabs__search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="seller-tabs__search-input"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="seller-listings">
          {activeTab === "listings" && (
            <>
              {allListingsCount > 0 ? (
                <>
                  {/* Vehicles Grid */}
                  {sellerListings.vehicles.length > 0 && (
                    <div className="seller-listings__grid">
                      {sellerListings.vehicles.map((vehicle) => (
                        <AutoCard key={vehicle.id} car={vehicle} />
                      ))}
                    </div>
                  )}

                  {/* Parts Grid */}
                  {sellerListings.parts.length > 0 && (
                    <div className="seller-listings__grid">
                      {sellerListings.parts.map((part) => (
                        <PartCard key={part.id} part={part} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="seller-listings__empty">
                  {debouncedSearchQuery.trim()
                    ? t("detail.empty.nothingFound")
                    : t(emptyListingsKey)}
                </div>
              )}
            </>
          )}

          {activeTab === "reviews" && (
            <div className="seller-listings__empty">{t("detail.empty.reviewsSoon")}</div>
          )}

          {activeTab === "about" && (
            <div className="seller-listings__empty">{t("detail.empty.aboutSoon")}</div>
          )}
        </div>
      </div>
    </div>
  );
}