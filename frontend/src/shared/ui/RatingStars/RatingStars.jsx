import { Star } from 'lucide-react';

/**
 * Five stars, filled up to the rounded value with --star and left in
 * --subtle-foreground after it. A bare number next to a card tells you nothing at a
 * glance, so the stars always come with it.
 *
 * The `rating-stars` class names stay: page stylesheets still hook into them.
 */
export default function RatingStars({
  value = 0,
  count = undefined,
  /** The word after the count, e.g. "reviews". Translated by the caller. */
  label = undefined,
  size = 14,
  className = '',
}) {
  const safeValue = Number.isFinite(value) ? Math.min(Math.max(value, 0), 5) : 0;
  const filledCount = Math.round(safeValue);

  return (
    <div
      className={`rating-stars flex flex-row flex-nowrap items-center gap-1 leading-none whitespace-nowrap ${className}`.trim()}
      role="img"
      aria-label={`${safeValue.toFixed(1)} / 5`}
    >
      {[0, 1, 2, 3, 4].map((index) => {
        const filled = index < filledCount;
        return (
          <Star
            key={index}
            size={size}
            strokeWidth={1.5}
            aria-hidden="true"
            className={
              filled
                ? 'rating-stars__star shrink-0 fill-current text-star'
                : 'rating-stars__star shrink-0 text-subtle-foreground'
            }
          />
        );
      })}
      <span className="rating-stars__value ml-1.5 text-[13px] text-muted-foreground">
        {safeValue.toFixed(1)}
        {count === undefined || count === null ? null : ` (${count}${label ? ` ${label}` : ''})`}
      </span>
    </div>
  );
}
