import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { formatPrice } from '@/lib/format';
import { withLang } from '@/shared/constants/routes';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { ListingPhoto } from '@/shared/ui/ListingImagePlaceholder/ListingImagePlaceholder';
import RatingStars from '@/shared/ui/RatingStars/RatingStars';

import type { AiChatCard } from './aiChat.api';

type Props = {
  card: AiChatCard;
  language: string;
  onOpen?: () => void;
};

/** One found listing or profile. Shows only what the API returned and links to its own page. */
export function AiChatResultCard({ card, language, onOpen }: Props) {
  const { t } = useTranslation('aiChat');
  const amount = card.price != null ? formatPrice(card.price, card.currency ?? 'AZN') : null;
  const price = !amount
    ? null
    : card.priceUnit === 'FROM'
      ? t('price.from', { price: amount })
      : card.priceUnit === 'DAY'
        ? `${amount} ${t('price.perDay')}`
        : card.priceUnit === 'HOUR'
          ? `${amount} ${t('price.perHour')}`
          : amount;

  return (
    <CardWrapper
      as={Link}
      to={withLang(card.path, language)}
      onClick={onOpen}
      hover
      className="flex min-h-11 items-stretch gap-3 overflow-hidden p-2 [overflow-wrap:anywhere] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-[var(--radius)] bg-card-muted">
        <ListingPhoto src={card.imageUrl} className="h-full w-full object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          {t(`kind.${card.kind}`)}
        </span>
        <span className="truncate text-[15px] font-semibold text-foreground">{card.title}</span>
        {card.subtitle ? (
          <span className="truncate text-[13px] text-muted-foreground">{card.subtitle}</span>
        ) : null}
        <span className="flex flex-wrap items-center gap-x-2 text-[13px]">
          {price ? <span className="font-bold text-foreground">{price}</span> : null}
          {card.rating != null ? <RatingStars value={card.rating} showCaption={false} size={12} /> : null}
          {card.city ? <span className="text-muted-foreground">{card.city}</span> : null}
        </span>
      </div>
    </CardWrapper>
  );
}
