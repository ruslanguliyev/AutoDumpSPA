import { Star } from 'lucide-react';

/**
 * Five stars filled to the nearest half with --star, the rest --subtle-foreground.
 *
 * A fraction under .25 rounds down, .25 to .74 draws a half star, .75 and over rounds
 * up — so 4.2 reads as four, 4.4 and 4.5 as four and a half, 4.8 as five. A bare number
 * next to a card tells you nothing at a glance, so the stars always come with it.
 *
 * The `rating-stars` class names stay: page stylesheets still hook into them.
 */

const HalfStar = ({ size }) => (
  <span
    className="rating-stars__star rating-stars__star--half relative inline-flex shrink-0"
    style={{ width: size, height: size }}
    aria-hidden="true"
  >
    <Star size={size} strokeWidth={1.5} className="absolute inset-0 text-subtle-foreground" />
    {/* The filled half is clipped rather than drawn as a second shape, so both halves
        keep the same outline and the seam falls exactly down the middle. */}
    <span
      className="absolute inset-y-0 left-0 overflow-hidden"
      style={{ width: size / 2 }}
    >
      <Star size={size} strokeWidth={1.5} className="fill-current text-star" />
    </span>
  </span>
);

export default function RatingStars({
  value = 0,
  count = undefined,
  /** The word after the count, e.g. "reviews". Only right for languages with one plural form. */
  label = undefined,
  /** The whole pluralised phrase, e.g. "87 отзывов". Translated by the caller; wins over count + label. */
  countLabel = undefined,
  size = 14,
  className = '',
}) {
  const safeValue = Number.isFinite(value) ? Math.min(Math.max(value, 0), 5) : 0;
  const whole = Math.floor(safeValue);
  const fraction = safeValue - whole;
  const fullCount = fraction >= 0.75 ? whole + 1 : whole;
  const hasHalf = fraction >= 0.25 && fraction < 0.75;

  return (
    <div
      className={`rating-stars flex flex-row flex-wrap items-center gap-x-1 gap-y-1 leading-none ${className}`.trim()}
      role="img"
      aria-label={`${safeValue.toFixed(1)} / 5`}
    >
      {[0, 1, 2, 3, 4].map((index) => {
        if (index < fullCount) {
          return (
            <Star
              key={index}
              size={size}
              strokeWidth={1.5}
              aria-hidden="true"
              className="rating-stars__star rating-stars__star--filled shrink-0 fill-current text-star"
            />
          );
        }

        if (index === fullCount && hasHalf) {
          return <HalfStar key={index} size={size} />;
        }

        return (
          <Star
            key={index}
            size={size}
            strokeWidth={1.5}
            aria-hidden="true"
            className="rating-stars__star shrink-0 text-subtle-foreground"
          />
        );
      })}
      <span className="rating-stars__value ml-1.5 whitespace-nowrap text-[13px] text-muted-foreground">
        {safeValue.toFixed(1)}
        {countLabel
          ? ` (${countLabel})`
          : count === undefined || count === null
            ? null
            : ` (${count}${label ? ` ${label}` : ''})`}
      </span>
    </div>
  );
}
