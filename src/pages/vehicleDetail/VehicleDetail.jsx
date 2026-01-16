import { lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import { Heart, MapPin, Phone, ShieldCheck, Star, Store } from "lucide-react";
import { autos } from "../../data/data";
import { useFavoritesStore } from "../../store/favoritesStore";
import { Link } from "react-router-dom";
import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";


import "./VehicleDetail.scss";

const MediaCarousel = lazy(() =>
    import("../../components/MediaCarousel/MediaCarousel")
);

const formatInt = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n);
};

const getCurrencySymbol = (currency) => {
    switch (currency) {
        case "USD":
            return "$";
        case "EUR":
            return "€";
        case "RUB":
            return "₽";
        default:
            return "";
    }
};

const formatPrice = (value, currency) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${formatInt(n)}`;
};

const VehicleSummaryCard = ({
    title,
    year,
    mileage,
    price,
    currency,
    location,
    isFavorite,
    onToggleFavorite,
}) => {
    return (
        <div className="vehicle-summary-card">
            <h2 className="car-title">{title}</h2>
            <p className="car-meta">
                {year} • {formatInt(mileage)} km
            </p>

            <div className="price-box">
                <p className="big-price">{formatPrice(price, currency)}</p>
            </div>

            <div className="car-location">
                <MapPin size={16} aria-hidden="true" />
                <span>{location}</span>
            </div>

            <button type="button" className="contact-btn">
                <Phone size={18} aria-hidden="true" />
                <span>Contact Seller</span>
            </button>

            <button
                type="button"
                className={`fav-btn ${isFavorite ? "active" : ""}`}
                onClick={onToggleFavorite}
            >
                <Heart size={18} aria-hidden="true" />
                <span>{isFavorite ? "Added to Favorites" : "Add to Favorites"}</span>
            </button>
        </div>
    );
};

const SellerCard = ({ seller, phone, location }) => {
    const content = (
        <div className="seller-card">
            <div className="seller-card__header">
                <h3 className="seller-card__title">Seller Information</h3>
            </div>

            <div className="seller-card__body">
                <div className="seller-card__main">
                    <div className="seller-card-left" aria-hidden="true">
                        <div className="seller-avatar">
                            <Store size={22} />
                        </div>
                    </div>

                    <div className="seller-card-right">
                        <h4 className="seller-card-name">{seller?.name ?? "—"}</h4>
                        <p className="seller-card-type">{seller?.type ?? "—"}</p>

                        <div className="seller-card-rating" aria-label="Seller rating">
                            <Star size={18} className="rating-star" aria-hidden="true" />
                            <span className="rating-value">{seller?.rating ?? "—"}</span>
                            <span className="seller-card-votes">
                                ({seller?.votes ?? 0} reviews)
                            </span>
                        </div>

                        <div className="seller-card-meta">
                            <div className="meta-row">
                                <Phone size={18} aria-hidden="true" />
                                <span>{phone}</span>
                            </div>
                            <div className="meta-row">
                                <MapPin size={18} aria-hidden="true" />
                                <span>{location}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (seller?.id) {
        return (
            <Link to={`/seller/${seller.id}`} className="seller-card-link">
                {content}
            </Link>
        );
    }

    return content;
};

const SafetyTipsCard = ({ tips }) => (
    <div className="safety-tips">
        <h3 className="section-title">
            <ShieldCheck size={18} aria-hidden="true" />
            Safety Tips
        </h3>
        <ul>
            {tips.map((tip) => (
                <li key={tip}>{tip}</li>
            ))}
        </ul>
    </div>
);


export default function VehicleDetail() {
    const { id } = useParams();
    const car = autos.find((c) => c.id == id);

    const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
    const isFavorite = useFavoritesStore((s) =>
        car ? s.isFavorited("vehicle", car.id) : false
    );

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

    const safetyTips = [
        "Meet the seller in a safe public location",
        "Inspect the car thoroughly before purchase",
        "Never pay in advance without seeing the car",
        "Check all documents carefully",
    ];

    const breadcrumbs = [
        { label: "Home", to: "/" },
        { label: "Cars", to: "/search" },
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
                    <Suspense fallback={<div>Loading images…</div>}>
                        <MediaCarousel
                            items={media}
                            ariaLabel={`${car.brand} ${car.model} gallery`}
                        />
                    </Suspense>

                    {/* ХАРАКТЕРИСТИКИ */}
                    <div className="vehicle-specs-section">
                        <h2>Характеристики</h2>

                        <div className="specs-grid">

                            <div className="spec-row">
                                <span className="spec-name">Марка:</span>
                                <span className="spec-value">{car.brand}</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Модель:</span>
                                <span className="spec-value">{car.model}</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Версия:</span>
                                <span className="spec-value">{car.version}</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Код авто:</span>
                                <span className="spec-value">{car.code}</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Год выпуска:</span>
                                <span className="spec-value">{car.year}</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Мотор:</span>
                                <span className="spec-value">{car.engine}</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Коробка передач:</span>
                                <span className="spec-value">{car.transmission}</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Привод:</span>
                                <span className="spec-value">{car.drive}</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Пробег:</span>
                                <span className="spec-value">{car.mileage} km</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Локация:</span>
                                <span className="spec-value">{car.location}</span>
                            </div>
                            <div className="spec-row">
                                <span className="spec-name">Количество владельцев:</span>
                                <span className="spec-value">{car.owners || "—"}</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">В кредите:</span>
                                <span className="spec-value">
                                    {car.isFinanced ? "Да" : "Нет"}
                                </span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Дата публикации:</span>
                                <span className="spec-value">
                                    {car.postedAt ? new Date(car.postedAt).toLocaleDateString() : "—"}
                                </span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Просмотры:</span>
                                <span className="spec-value">{car.views || 0}</span>
                            </div>

                        </div>

                    </div>

                    {car.sellerNote && (
                        <div className="owner-note">
                            <h3>Комментарий владельца</h3>
                            <p>{car.sellerNote}</p>
                        </div>
                    )}
                </div>

                {/* ПРАВАЯ ЧАСТЬ (sticky) */}
                <div className="vehicle-right">
                    <div className="vehicle-info">
                        <VehicleSummaryCard
                            title={`${car.brand} ${car.model}`}
                            year={car.year}
                            mileage={car.mileage}
                            price={car.price}
                            currency={currency}
                            location={car.location}
                            isFavorite={isFavorite}
                            onToggleFavorite={() =>
                                toggleFavorite({
                                    type: "vehicle",
                                    id: car.id,
                                    title: `${car.brand} ${car.model}`,
                                    thumbnail: Array.isArray(car.image) ? car.image[0] : car.image,
                                })
                            }
                        />

                        <SellerCard seller={car.seller} phone={sellerPhone} location={car.location} />
                        <SafetyTipsCard tips={safetyTips} />
                    </div>
                </div>
            </div>
        </div>
    );
}
