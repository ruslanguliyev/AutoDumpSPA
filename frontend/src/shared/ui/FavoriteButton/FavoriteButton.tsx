import { Heart } from 'lucide-react';

type FavoriteButtonProps = {
  active: boolean;
  onToggle: () => void;
  /** Translated. The caller knows whether this adds or removes. */
  label: string;
  className?: string;
};

/**
 * The heart on a card. The icon is 17px because the design draws it that way, but the
 * button is a full 44px target — a control people miss is a control that does not exist.
 *
 * It sits above the card's stretched link, so clicking it never opens the listing.
 */
export function FavoriteButton({ active, onToggle, label, className = '' }: FavoriteButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
      // No position class here: the caller places it, and a `relative` baked in would
      // beat the caller's `absolute` whatever order the class list is written in.
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`.trim()}
    >
      <Heart
        size={17}
        strokeWidth={1.5}
        aria-hidden="true"
        className={active ? 'fill-current text-destructive' : ''}
      />
    </button>
  );
}

export default FavoriteButton;
