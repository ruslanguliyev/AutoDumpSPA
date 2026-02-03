import { useState } from "react";
import { useParams } from "react-router-dom";
import { CalendarDays, Clock, Heart, MapPin, Phone } from "lucide-react";
import { useAutoDetails } from "@/vehicles/hooks/useAutoDetails";
import { useFavoritesStore } from "@/shared/store/favoritesStore";
import Breadcrumbs from "@/shared/ui/Breadcrumbs/Breadcrumbs";
import { SellerCard } from "@/shared/components/SellerCard/SellerCard";
import { TrustBlock } from "@/shared/blocks";

import VehicleGallery from "@/vehicles/pages/vehicleDetail/VehicleGallery";
import VehicleSpecs from "@/vehicles/pages/vehicleDetail/VehicleSpecs";
import VehicleSummaryCard from "@/vehicles/pages/vehicleDetail/VehicleSummaryCard";

import "@/shared/components/SellerCard/SellerCard.scss";
import "@/shared/blocks/TrustBlock/TrustBlock.scss";
import "./VehicleDetail.scss";

export default function VehicleDetail() {
    const { id } = useParams();
    const { data: car } = useAutoDetails(id);

    const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
    const isFavorite = useFavoritesStore((s) =>
        car ? s.isFavorited("vehicle", car.id) : false
    );

    const [showPhone, setShowPhone] = useState(false);

    if (!car) return <div>Not found</div>;

    // 🔁 адаптер данных
    const media = car.image.map((src, index) => ({
        id: `${car.id}-${index}`,
        src,
        alt: `${car.brand} ${car.model} image ${index + 1}`,
        type: "image",
    }));

    const currency = car?.currency ?? "EUR";
    const sellerPhone = car?.seller?.phone ?? "—";

    const preventCardNavigation = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const favoriteLabel = isFavorite ? "Added to Favorites" : "Add to Favorites";

    // Seller actions (phone button and favorite button)
    const sellerActions = (
        <>
            <div className="seller-card__meta">
                <div className="seller-card__metaRow">
                    <MapPin size={16} aria-hidden="true" />
                    <span>{car.location}</span>
                </div>
                <div className="seller-card__metaRow">
                    <CalendarDays size={16} aria-hidden="true" />
                    <span>Member since {car.seller?.memberSince ?? "—"}</span>
                </div>
                <div className="seller-card__metaRow">
                    <Clock size={16} aria-hidden="true" />
                    <span>Usually responds within {car.seller?.responseTime ?? "—"}</span>
                </div>
            </div>

            <div className="seller-card__actions">
                <button
                    type="button"
                    className="seller-card__primaryButton"
                    onClick={(e) => {
                        preventCardNavigation(e);
                        setShowPhone((v) => !v);
                    }}
                >
                    <Phone size={18} aria-hidden="true" />
                    {showPhone ? sellerPhone ?? "—" : "Show Phone Number"}
                </button>

                <button
                    type="button"
                    aria-pressed={isFavorite}
                    className={`seller-card__secondaryButton${isFavorite ? " seller-card__secondaryButton--active" : ""}`}
                    onClick={(e) => {
                        preventCardNavigation(e);
                        toggleFavorite({
                            type: "vehicle",
                            id: car.id,
                            title: `${car.brand} ${car.model}`,
                            thumbnail: Array.isArray(car.image) ? car.image[0] : car.image,
                        });
                    }}
                >
                    <Heart size={18} aria-hidden="true" />
                    {favoriteLabel}
                </button>
            </div>
        </>
    );

    const breadcrumbs = [
        { label: "Home", to: "/" },
        { label: "Cars", to: "/autosearch" },
        { label: `${car.brand} ${car.model}` },
    ];

    return (
        <div className="vehicle-page-wrapper">
            <div className="vehicle-grid">
                {/* ЛЕВАЯ ЧАСТЬ */}
                <div className="vehicle-left">
                    <Breadcrumbs items={breadcrumbs} />

                    {/* ФОТО */}
                    {/* <div className="vehicle-gallery">
                        <img className="main-image" src={car.image[0]} alt={car.alt} />

                        <div className="thumbs">
                            {car.image.map((img, i) => (
                                <img key={i} src={img} alt={`${car.model}-${i}`} />
                            ))}
                        </div>
                    </div> */}

                    {/* КАРУСЕЛЬ */}
                    <VehicleGallery
                        items={media}
                        ariaLabel={`${car.brand} ${car.model} gallery`}
                    />

                    <VehicleSummaryCard
                        title={`${car.brand} ${car.model}`}
                        year={car.year}
                        mileage={car.mileage}
                        price={car.price}
                        currency={currency}
                        engine={car.engine}
                        fuelType={car.fuel}
                        transmission={car.transmission}
                    />

                    <VehicleSpecs car={car} />
                </div>

                {/* ПРАВАЯ ЧАСТЬ (sticky) */}
                <div className="vehicle-right">
                    <div className="vehicle-info">
                        <SellerCard seller={car.seller} actions={sellerActions} />
                        <TrustBlock variant="car" />
                    </div>
                </div>
            </div>
        </div>
    );
}
