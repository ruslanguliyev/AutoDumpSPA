import type { TFunction } from 'i18next';
import { Heart, MessageSquare, Phone } from 'lucide-react';

import type { DetailLayoutMobileBarProps } from '@/shared/blocks';
import Button from '@/shared/ui/button';

type Params = {
  t: TFunction;
  /** Message form and booking card are anchored on the page; no listing id means neither exists. */
  hasContactForm: boolean;
  /** Rent listing with terms: the primary action becomes “Book now”. */
  hasBooking: boolean;
  phone: string | null;
  phoneVisible: boolean;
  onRevealPhone: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

// Compact padding: three controls share 358px at 390px wide. `!` beats the size's own px-5.
const compact = 'min-w-0 justify-center gap-1.5 px-3!';

/**
 * Contents of the sticky bottom bar of the car page (below `lg`).
 *
 *   sale  with phone  → [♥] [Message]  [Call → number → tel: link]
 *   sale  no phone    → [♥] [Message — primary]
 *   rent              → [♥] [Message]  [Book now]
 *
 * Returns undefined when there is nothing to scroll to (no listing id) — the sidebar then
 * keeps every action visible on mobile.
 */
export function buildVehicleMobileBar({
  t,
  hasContactForm,
  hasBooking,
  phone,
  phoneVisible,
  onRevealPhone,
  isFavorite,
  onToggleFavorite,
}: Params): DetailLayoutMobileBarProps | undefined {
  if (!hasContactForm) return undefined;

  const iconAction = (
    <Button
      type="button"
      variant="icon"
      size="icon"
      aria-label={isFavorite ? t('card.removeFromFavoritesAria') : t('card.addToFavoritesAria')}
      aria-pressed={isFavorite}
      onClick={onToggleFavorite}
    >
      <Heart
        size={20}
        strokeWidth={1.5}
        aria-hidden="true"
        className={isFavorite ? 'fill-destructive text-destructive' : undefined}
      />
    </Button>
  );

  const messageLabel = t('vehicle.writeMessage', { ns: 'sellers' });
  const messageButton = (variant: 'primary' | 'secondary') => (
    <Button asChild variant={variant} className={variant === 'primary' ? 'w-full' : compact}>
      <a href="#contact-seller">
        <MessageSquare size={18} aria-hidden="true" />
        <span className="truncate">{messageLabel}</span>
      </a>
    </Button>
  );

  if (hasBooking) {
    return {
      iconAction,
      secondaryAction: messageButton('secondary'),
      primaryAction: (
        <Button asChild variant="primary" className={`w-full ${compact}`}>
          <a href="#rental-booking">
            <span className="truncate">{t('vehicle.requestBooking', { ns: 'sellers' })}</span>
          </a>
        </Button>
      ),
    };
  }

  if (!phone) {
    return { iconAction, primaryAction: messageButton('primary') };
  }

  const telHref = `tel:${phone.replace(/[^\d+]/g, '')}`;
  return {
    iconAction,
    secondaryAction: messageButton('secondary'),
    primaryAction: phoneVisible ? (
      <Button asChild variant="primary" className={`w-full ${compact}`}>
        <a href={telHref} aria-label={`${t('vehicle.callSeller', { ns: 'sellers' })} ${phone}`}>
          <Phone size={18} aria-hidden="true" />
          <span className="truncate">{phone}</span>
        </a>
      </Button>
    ) : (
      <Button type="button" variant="primary" className={`w-full ${compact}`} onClick={onRevealPhone}>
        <Phone size={18} aria-hidden="true" />
        <span className="truncate">{t('vehicle.callSeller', { ns: 'sellers' })}</span>
      </Button>
    ),
  };
}
