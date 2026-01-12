// components/RatingStars.jsx
import { Star } from 'lucide-react';
import './RatingStars.scss';

export default function RatingStars({ value, count }) {
    const fullStars = Math.floor(value);
    const hasHalf = value - fullStars >= 0.5;

    return (
        <div className="rating-stars">
            {[...Array(5)].map((_, i) => {
                const filled =
                    i < fullStars || (i === fullStars && hasHalf);

                return (
                    <Star
                        key={i}
                        size={14}
                        className={
                            filled
                                ? 'rating-stars__star rating-stars__star--filled'
                                : 'rating-stars__star'
                        }
                    />
                );
            })}
            <span className="rating-stars__value">
                {value.toFixed(2)} ({count})
            </span>
        </div>
    );
}
