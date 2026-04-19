import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarDays, Clock, Heart, MapPin, Phone } from "lucide-react";
import { useAutoDetails } from "@/vehicles/hooks/useAutoDetails";
import { useSpecialistsQuery } from "@/specialists/hooks/useSpecialists";
import SpecialistCard from "@/specialists/components/SpecialistCard";
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
    const { t } = useTranslation(["sellers", "vehicle", "specialists"]);
    const { id } = useParams();
    const { data: car } = useAutoDetails(id);

    const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
    const isFavorite = useFavoritesStore((s) =>
        car ? s.isFavorited("vehicle", car.id) : false
    );

    const [showPhone, setShowPhone] = useState(false);
    const vehicleFilters = useMemo(
        () => ({
            brand: car?.brand ?? null,
            model: car?.model ?? null,
            year: car?.year ? Number(car.year) : null,
        }),
        [car?.brand, car?.model, car?.year]
    );

    const {
        specialists: matchingSpecialists,
        isLoading: isMatchingLoading,
        error: matchingError,
    } = useSpecialistsQuery(vehicleFilters, { enabled: Boolean(car) });

    const topSpecialists = useMemo(() => {
        if (!matchingSpecialists?.length) return [];
        return [...matchingSpecialists]
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 3);
    }, [matchingSpecialists]);

    if (!car) return <div>{t("details.notFound", { ns: "vehicle" })}</div>;

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

    const favoriteLabel = isFavorite ? t("vehicle.addedToFavorites") : t("vehicle.addToFavorites");

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
                    <span>{t("vehicle.memberSince", { date: car.seller?.memberSince ?? "—" })}</span>
                </div>
                <div className="seller-card__metaRow">
                    <Clock size={16} aria-hidden="true" />
                    <span>{t("vehicle.respondsWithin", { time: car.seller?.responseTime ?? "—" })}</span>
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
                    {showPhone ? sellerPhone ?? "—" : t("vehicle.showPhoneNumber")}
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
        { label: t("breadcrumbs.home", { ns: "vehicle" }), to: "/" },
        { label: t("breadcrumbs.cars", { ns: "vehicle" }), to: "/autosearch" },
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
                        ariaLabel={t("gallery.galleryAria", { ns: "vehicle", name: `${car.brand} ${car.model}` })}
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

                    <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
                        <h2 className="text-lg font-semibold text-foreground">
                            {t("match.title", { ns: "specialists" })}
                        </h2>

                        {isMatchingLoading ? (
                            <div className="mt-4 rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
                                {t("match.loading", { ns: "specialists" })}
                            </div>
                        ) : matchingError ? (
                            <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-6 text-sm text-destructive">
                                {t("match.errorFailed", { ns: "specialists" })}
                            </div>
                        ) : topSpecialists.length ? (
                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                {topSpecialists.map((specialist) => (
                                    <SpecialistCard key={specialist.id} specialist={specialist} />
                                ))}
                            </div>
                        ) : (
                            <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-6 text-sm text-muted-foreground">
                                {t("match.empty", { ns: "specialists" })}
                            </div>
                        )}
                    </section>
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
