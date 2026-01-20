import './AutoCard.scss';
import { Link } from 'react-router-dom';
import { Heart } from "lucide-react";
import { useFavoritesStore } from "@/shared/store/favoritesStore";

export default function AutoCard({ car }) {
    const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
    const isFav = useFavoritesStore((s) => s.isFavorited("vehicle", car.id));

    const mainImage = Array.isArray(car.image) ? car.image[0] : car.image;

    return (
        <Link to={`/vehicles/${car.id}`} className="auto-card">

            <div className="auto-card__image-wrapper">
                <img
                    src={mainImage}
                    alt={`${car.brand} ${car.model}`}
                    className="auto-card__image"
                />

                {car.isHot && <span className="auto-card__badge">HOT</span>}

                {/* HEART BUTTON */}
                <button
                    className="auto-card__fav-btn"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite({
                            type: "vehicle",
                            id: car.id,
                            title: `${car.brand} ${car.model}`,
                            thumbnail: mainImage,
                        });
                    }}
                >
                    <Heart
                        className={`fav-icon ${isFav ? "active" : ""}`}
                        strokeWidth={1.7}
                        fill={isFav ? "currentColor" : "none"}
                    />
                </button>
            </div>

            <div className="auto-card__content">

                <div className="auto-card__price">
                    €{car.price.toLocaleString()}
                </div>

                <h3 className="auto-card__title">
                    {car.brand} {car.model}
                    {car.version && (
                        <span className="auto-card__version"> • {car.version}</span>
                    )}
                </h3>

                <p className="auto-card__details">
                    {car.year} • {car.engine} • {car.mileage} km • {car.transmission}
                </p>

                <div className="auto-card__location">
                    <svg xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="location-icon">
                        <path strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.5-7.5 11.5S4.5 
                                 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span>{car.location}</span>
                </div>

            </div>
        </Link>
    );
}
