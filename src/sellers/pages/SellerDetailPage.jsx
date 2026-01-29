import { useMemo, useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  BadgeCheck,
  Heart,
  Instagram,
  MapPin,
  Phone,
  Search,
  Share2,
} from "lucide-react";

import { useSellersData } from "@/sellers/hooks/useSellersData";
import { useFavoritesStore } from "@/shared/store/favoritesStore";
import AutoCard from "@/vehicles/components/AutoCardComponent/AutoCard";
import PartCard from "@/parts/components/PartCard/PartCard";
import Breadcrumbs from "@/shared/ui/Breadcrumbs/Breadcrumbs";
import "./SellerDetailPage.scss";

const DOMAIN_LABELS = { cars: "Cars", parts: "Parts" };
const TYPE_LABELS = { dealer: "Dealer", reseller: "Reseller", private: "Private" };

const getInitials = (name) => {
  const safe = String(name ?? "").trim();
  if (!safe) return "??";
  return safe.slice(0, 2).toUpperCase();
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function SellerDetailPage({ vehicles = [], parts = [] } = {}) {
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
    // Merge aggregated data with full seller data
    return { ...aggregated, ...fullSellerData };
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
  const dealsCount = seller?.dealsCount || null;

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
          title: seller?.name || "Seller",
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
  }, [seller?.name]);

  const handleFavoriteToggle = useCallback(() => {
    if (!seller?.id) return;
    toggleFavorite({
      type: "seller",
      id: seller.id,
      title: seller.name || "Seller",
      thumbnail: avatar || null,
    });
  }, [seller, toggleFavorite, avatar]);

  if (!sellerId) {
    return (
      <div className="seller-detail">
        <div className="seller-detail__container">
          <h1>Seller</h1>
          <p>Missing seller id.</p>
          <Link to="/sellers">← Back to sellers</Link>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="seller-detail">
        <div className="seller-detail__container">
          <h1>Seller not found</h1>
          <p>
            Seller <span>{sellerId}</span> is not available.
          </p>
          <Link to="/sellers">← Back to sellers</Link>
        </div>
      </div>
    );
  }

  const allListingsCount = sellerListings.vehicles.length + sellerListings.parts.length;

  const breadcrumbs = [
    { label: "Home", to: "/" },
    { label: "Продавцы", to: "/sellers" },
    { label: seller?.name || "Продавец" },
  ];

  return (
    <div className="seller-detail">
      {/* Cover Section */}
      <div
        className="seller-detail__cover"
        style={
          coverImage
            ? {
                backgroundImage: `url(${coverImage})`,
              }
            : {}
        }
      >
        <div className="seller-detail__cover-overlay" />
        <div className="seller-detail__cover-gradient" />
        
        {/* Breadcrumbs on cover */}
        <div className="seller-detail__cover-breadcrumbs">
          <Breadcrumbs items={breadcrumbs} />
        </div>
        
        <div className="seller-detail__cover-content">
          <div className="seller-detail__cover-inner">
            {/* Avatar */}
            <div className="seller-detail__avatar">
              {avatar ? (
                <img src={avatar} alt={seller.name || "Seller"} />
              ) : (
                <div className="seller-detail__avatar-placeholder">
                  {getInitials(seller.name)}
                </div>
              )}
            </div>

            {/* Name and Verified Badge */}
            <div className="seller-detail__header-info">
              <div className="seller-detail__name-row">
                <h1 className="seller-detail__name">{seller.name}</h1>
                {verified && (
                  <span className="seller-detail__verified-badge">
                    <BadgeCheck size={14} />
                    Проверенный продавец
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="seller-detail__container">
        <div className="seller-detail__content">
          {/* Info Row */}
          <div className="seller-detail__info-row">
            {ratingValue != null && (
              <div className="seller-detail__rating">
                <span className="seller-detail__rating-value">
                  Средняя оценка: {ratingValue.toFixed(1)}
                </span>
                {votesValue != null && (
                  <span className="seller-detail__rating-count">
                    ({votesValue} отзыва)
                  </span>
                )}
              </div>
            )}

            {city && (
              <button
                onClick={handleLocationClick}
                className="seller-detail__location"
                type="button"
              >
                <MapPin size={16} />
                <span>
                  {city}
                  {country && `, ${country}`}
                </span>
              </button>
            )}

            {memberSince && (
              <span className="seller-detail__membership">
                На avtoBAZ с {new Date(memberSince).getFullYear()} года
                {dealsCount != null && ` • ${dealsCount} сделок`}
              </span>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="seller-detail__description">{description}</p>
          )}

          {/* Contact Actions */}
          <div className="seller-detail__actions">
            {phone && (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="seller-detail__cta-button"
              >
                <Phone size={18} />
                Позвонить
              </a>
            )}

            {whatsapp ? (
              <a
                href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="seller-detail__cta-button"
              >
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                WhatsApp
              </a>
            ) : (
              <button
                disabled
                className="seller-detail__cta-button seller-detail__cta-button--disabled"
                aria-label="WhatsApp не указан"
                type="button"
              >
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                WhatsApp
              </button>
            )}

            <div className="seller-detail__action-icons">
              {instagramUrl ? (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="seller-detail__icon-button"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
              ) : (
                <button
                  disabled
                  className="seller-detail__icon-button seller-detail__icon-button--disabled"
                  aria-label="Instagram не указан"
                  type="button"
                >
                  <Instagram size={18} />
                </button>
              )}

              <button
                onClick={handleFavoriteToggle}
                className={`seller-detail__icon-button seller-detail__icon-button--favorite ${
                  isFavorite ? "active" : ""
                }`}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                type="button"
              >
                <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
              </button>

              <button
                onClick={handleShare}
                className="seller-detail__icon-button"
                aria-label="Share"
                type="button"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>

          {/* Tabs and Search */}
          <div className="seller-detail__tabs-row">
            <div className="seller-detail__tabs">
              <button
                onClick={() => setActiveTab("listings")}
                className={`seller-detail__tab ${
                  activeTab === "listings" ? "seller-detail__tab--active" : ""
                }`}
                type="button"
              >
                В продаже ({listingsCount ?? 0})
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`seller-detail__tab ${
                  activeTab === "reviews" ? "seller-detail__tab--active" : ""
                }`}
                type="button"
              >
                Отзывы ({votesValue ?? 0})
              </button>
            </div>

            {/* Search Bar */}
            {activeTab === "listings" && (
              <div className="seller-detail__search">
                <Search size={18} className="seller-detail__search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по авто продавца (BMW, Audi, X5...)"
                  className="seller-detail__search-input"
                />
              </div>
            )}
          </div>

          {/* Tab Content */}
          <div className="seller-detail__tab-content">
            {activeTab === "listings" && (
              <div className="seller-detail__listings">
                {allListingsCount > 0 ? (
                  <>
                    {/* Vehicles Grid */}
                    {sellerListings.vehicles.length > 0 && (
                      <div className="seller-detail__listings-section">
                        <div className="seller-detail__vehicles-grid">
                          {sellerListings.vehicles.map((vehicle) => (
                            <AutoCard key={vehicle.id} car={vehicle} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Parts Grid */}
                    {sellerListings.parts.length > 0 && (
                      <div className="seller-detail__listings-section">
                        {sellerListings.vehicles.length > 0 && (
                          <h2 className="seller-detail__listings-section-title">
                            Запчасти ({sellerListings.parts.length})
                          </h2>
                        )}
                        <div className="seller-detail__parts-grid">
                          {sellerListings.parts.map((part) => (
                            <PartCard key={part.id} part={part} />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="seller-detail__empty-state">
                    {debouncedSearchQuery.trim()
                      ? "Ничего не найдено"
                      : "Нет объявлений"}
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="seller-detail__reviews-placeholder">
                Отзывы скоро появятся
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}