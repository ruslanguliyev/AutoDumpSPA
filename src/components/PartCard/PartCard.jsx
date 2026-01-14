import './PartCard.scss';
import { Heart, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import RatingStars from '@components/RatingStars/RatingStars.jsx';
import { useCartStore } from '@store/cartStore';
import { useFavoritesStore } from '@store/favoritesStore';

export default function PartCard({ part }) {
    if (!part) return null;

    const addToCart = useCartStore((s) => s.addToCart);
    const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

    const hasDiscount = Number.isFinite(part.discountPercent);
    const oldPrice = hasDiscount
        ? part.price / (1 - part.discountPercent / 100)
        : null;

    const imageSrc = part.imageUrl || '/placeholder-part.svg';
    const ratingValue = Number.isFinite(part.rating) ? part.rating : 0;
    const reviewsCount = Number.isFinite(part.reviewsCount)
        ? part.reviewsCount
        : 0;

    const partId = part.id ?? part._id ?? part.sku ?? part.code ?? part.name;
    const favActive = useFavoritesStore((s) =>
        partId != null ? s.isFavorited('part', partId) : false
    );

    return (
        <article className="part-card">
            {hasDiscount && (
                <span className="part-card__discount">
                    -{part.discountPercent}%
                </span>
            )}

            <div className="part-card__image-wrapper">
                {part?.id ? (
                    <Link to={`/parts/${part.id}`} aria-label={`Open ${part.name}`}>
                        <img
                            src={imageSrc}
                            alt={part.name}
                            className="part-card__image"
                        />
                    </Link>
                ) : (
                    <img
                        src={imageSrc}
                        alt={part.name}
                        className="part-card__image"
                    />
                )}

                <button
                    type="button"
                    className={`part-card__fav-btn ${favActive ? 'active' : ''}`}
                    aria-label={favActive ? 'Remove from favorites' : 'Add to favorites'}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (partId == null) return;
                        toggleFavorite({
                            type: 'part',
                            id: partId,
                            title: part.name,
                            thumbnail: imageSrc,
                        });
                    }}
                >
                    <Heart
                        className="part-card__fav-icon"
                        strokeWidth={1.7}
                        fill={favActive ? 'currentColor' : 'none'}
                    />
                </button>
            </div>

            <div className="part-card__content">
                {part?.id ? (
                    <Link to={`/parts/${part.id}`} className="part-card__title">
                        {part.name}
                    </Link>
                ) : (
                    <h3 className="part-card__title">{part.name}</h3>
                )}

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
                    onClick={() => addToCart(part, 1)}
                >
                    <ShoppingCart size={18} />
                    In den Warenkorb
                </button>
            </div>
        </article>
    );
}
