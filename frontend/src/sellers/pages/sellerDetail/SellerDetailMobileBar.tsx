import type { TFunction } from 'i18next';
import { Heart, Phone, Share2 } from 'lucide-react';

import type { DetailLayoutMobileBarProps } from '@/shared/blocks';
import Button from '@/shared/ui/button';

type Params = {
  t: TFunction;
  phone: string | null;
  phoneVisible: boolean;
  onRevealPhone: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
};

const compact = 'min-w-0 w-full justify-center gap-1.5 px-3!';

export function buildSellerMobileBar({
  t,
  phone,
  phoneVisible,
  onRevealPhone,
  isFavorite,
  onToggleFavorite,
  onShare,
}: Params): DetailLayoutMobileBarProps {
  const tel = phone?.trim() || null;

  const iconAction = (
    <Button
      type="button"
      variant="icon"
      size="icon"
      aria-label={isFavorite ? t('card.removeFromFavorites') : t('card.addToFavorites')}
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

  if (!tel) {
    return {
      iconAction,
      primaryAction: (
        <Button type="button" variant="primary" className={compact} onClick={onShare}>
          <Share2 size={18} aria-hidden="true" />
          <span className="truncate">{t('card.share')}</span>
        </Button>
      ),
    };
  }

  const telHref = `tel:${tel.replace(/[^\d+]/g, '')}`;
  return {
    iconAction,
    primaryAction: phoneVisible ? (
      <Button asChild variant="primary" className={compact}>
        <a href={telHref}>
          <Phone size={18} aria-hidden="true" />
          <span className="truncate">{tel}</span>
        </a>
      </Button>
    ) : (
      <Button type="button" variant="primary" className={compact} onClick={onRevealPhone}>
        <Phone size={18} aria-hidden="true" />
        <span className="truncate">{t('card.showNumber')}</span>
      </Button>
    ),
  };
}
