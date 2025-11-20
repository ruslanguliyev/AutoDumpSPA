import './AutoCard.scss';

export default function AutoCard({ car }) {
    return (
        <div className="auto-card">
            <div className="auto-card__image-wrapper">
                <img 
                    src={car.image} 
                    alt={car.alt || `${car.brand} ${car.model}`}
                    className="auto-card__image"
                />
            </div>
            <div className="auto-card__content">
                <h3 className="auto-card__title">
                    {car.brand} {car.model}
                </h3>
                <p className="auto-card__description">
                    {car.description}
                </p>
            </div>
        </div>
    );
}
