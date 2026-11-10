import type { TFunction } from 'i18next';
import { MessageCircle, Phone } from 'lucide-react';

import type { DetailLayoutMobileBarProps } from '@/shared/blocks';
import Button from '@/shared/ui/button';

type Params = {
  t: TFunction;
  phone: string | null;
  whatsapp: string | null;
  bookingHref: string;
};

const compact = 'min-w-0 justify-center gap-1.5 px-3!';

export function buildServiceMobileBar({
  t,
  phone,
  whatsapp,
  bookingHref,
}: Params): DetailLayoutMobileBarProps | undefined {
  const tel = phone?.trim() || null;
  const wa = whatsapp?.trim() || null;
  if (!tel && !wa) {
    return {
      iconAction: <span className="inline-block min-h-11 min-w-11" aria-hidden />,
      primaryAction: (
        <Button asChild variant="primary" className={`w-full ${compact}`}>
          <a href={bookingHref}>{t('sidebar.bookVisit')}</a>
        </Button>
      ),
    };
  }

  const waHref = wa ? `https://wa.me/${wa.replace(/[^\d]/g, '')}` : null;

  return {
    iconAction: waHref ? (
      <Button asChild variant="icon" size="icon" className="shrink-0">
        <a href={waHref} target="_blank" rel="noopener noreferrer" aria-label={t('sidebar.whatsapp')}>
          <MessageCircle size={20} aria-hidden="true" />
        </a>
      </Button>
    ) : (
      <span className="inline-block min-h-11 min-w-11 shrink-0" aria-hidden />
    ),
    primaryAction: tel ? (
      <Button asChild variant="primary" className={`w-full ${compact}`}>
        <a href={`tel:${tel.replace(/[^\d+]/g, '')}`}>
          <Phone size={18} aria-hidden="true" />
          <span className="truncate">{t('sidebar.callNow')}</span>
        </a>
      </Button>
    ) : (
      <Button asChild variant="primary" className={`w-full ${compact}`}>
        <a href={bookingHref}>{t('sidebar.bookVisit')}</a>
      </Button>
    ),
  };
}
