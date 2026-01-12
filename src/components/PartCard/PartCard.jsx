import './PartCard.scss';
import { ShoppingCart } from 'lucide-react';
import RatingStars from '@components/RatingStars/RatingStars.jsx';
import { useCartStore } from '@store/cartStore';

export default function PartCard({ part }) {
    if (!part) return null;

    const addToCart = useCartStore((s) => s.addToCart);

    const hasDiscount = Number.isFinite(part.discountPercent);
    const oldPrice = hasDiscount
        ? part.price / (1 - part.discountPercent / 100)
        : null;

    const imageSrc = part.imageUrl || '/placeholder-part.svg';
    const ratingValue = Number.isFinite(part.rating) ? part.rating : 0;
    const reviewsCount = Number.isFinite(part.reviewsCount)
        ? part.reviewsCount
        : 0;

    return (
        <article className="part-card">
            {hasDiscount && (
                <span className="part-card__discount">
                    -{part.discountPercent}%
                </span>
            )}

            <div className="part-card__image-wrapper">
                <img
                    src={imageSrc}
                    alt={part.name}
                    className="part-card__image"
                />
            </div>

            <div className="part-card__content">
                <h3 className="part-card__title">{part.name}</h3>

                <div className="part-card__rating">
                    <RatingStars value={ratingValue} count={reviewsCount} />
                </div>

                <div className="part-card__stock">
                    {part.stock > 0
                        ? 'Auf Lager. Versandbereit in 1–2 Werktagen.'
                        : 'Nicht verfügbar'}
                </div>

                <div className="part-card__spacer" />

                <div className="part-card__price">
                    <span className="part-card__price-current">
                        {part.price.toFixed(2)} {part.currency}
                    </span>

                    {hasDiscount && (
                        <span className="part-card__price-old">
                            {oldPrice.toFixed(2)} {part.currency}
                        </span>
                    )}
                </div>

                <button
                    className="part-card__cart-btn"
                    onClick={() => addToCart(part)}
                >
                    <ShoppingCart size={18} />
                    In den Warenkorb
                </button>
            </div>
        </article>
    );
}
