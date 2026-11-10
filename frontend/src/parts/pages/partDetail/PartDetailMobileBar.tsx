import type { TFunction } from 'i18next';
import { Heart, MessageSquare } from 'lucide-react';

import type { DetailLayoutMobileBarProps } from '@/shared/blocks';
import Button from '@/shared/ui/button';

type Params = {
  t: TFunction;
  hasContact: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

const compact = 'min-w-0 w-full justify-center gap-1.5 px-3!';

export function buildPartMobileBar({
  t,
  hasContact,
  isFavorite,
  onToggleFavorite,
}: Params): DetailLayoutMobileBarProps | undefined {
  if (!hasContact) return undefined;

  return {
    iconAction: (
      <Button
        type="button"
        variant="icon"
        size="icon"
        aria-label={
          isFavorite ? t('card.removeFromFavorites', { ns: 'part' }) : t('card.addToFavorites', { ns: 'part' })
        }
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
    ),
    primaryAction: (
      <Button asChild variant="primary" className={compact}>
        <a href="#contact-seller">
          <MessageSquare size={18} aria-hidden="true" />
          <span className="truncate">{t('purchase.contactSeller', { ns: 'part' })}</span>
        </a>
      </Button>
    ),
  };
}
