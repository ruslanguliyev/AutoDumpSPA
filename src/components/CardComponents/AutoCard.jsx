import './AutoCard.scss';
import { Link } from 'react-router-dom';

export default function AutoCard({ car }) {
    const mainImage = Array.isArray(car.image) ? car.image[0] : car.image;

    return (
        <Link to={`/vehicles/${car.id}`} className="auto-card">

            {/* IMAGE */}
            <div className="auto-card__image-wrapper">
                <img src={mainImage}
                    alt={`${car.brand} ${car.model}`}
                    className="auto-card__image" />

                {car.isHot && <span className="auto-card__badge">HOT</span>}
            </div>

            {/* CONTENT */}
            <div className="auto-card__content">

                {/* PRICE */}
                <div className="auto-card__price">
                    €{car.price.toLocaleString()}
                </div>

                {/* TITLE */}
                <h3 className="auto-card__title">
                    {car.brand} {car.model}
                    {car.version && (
                        <span className="auto-card__version"> • {car.version}</span>
                    )}
                </h3>

                {/* SPECS */}
                <p className="auto-card__details">
                    {car.year} • {car.engine} • {car.mileage} km • {car.transmission}
                </p>

                {/* LOCATION */}
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
