import type { TFunction } from 'i18next';
import { MessageCircle, Phone } from 'lucide-react';

import type { DetailLayoutMobileBarProps } from '@/shared/blocks';
import Button from '@/shared/ui/button';

type Params = {
  t: TFunction;
  phone: string | null;
  whatsapp: string | null;
};

const compact = 'min-w-0 w-full justify-center gap-1.5 px-3!';

export function buildSpecialistMobileBar({ t, phone, whatsapp }: Params): DetailLayoutMobileBarProps {
  const tel = phone?.trim() || null;
  const wa = whatsapp?.trim() || null;
  const waHref = wa ? `https://wa.me/${wa.replace(/[^\d]/g, '')}` : null;

  return {
    iconAction: waHref ? (
      <Button asChild variant="icon" size="icon">
        <a href={waHref} target="_blank" rel="noopener noreferrer" aria-label={t('detail.sendMessage')}>
          <MessageCircle size={20} aria-hidden="true" />
        </a>
      </Button>
    ) : (
      <span className="inline-block min-h-11 min-w-11" aria-hidden />
    ),
    primaryAction: tel ? (
      <Button asChild variant="primary" className={compact}>
        <a href={`tel:${tel.replace(/[^\d+]/g, '')}`}>
          <Phone size={18} aria-hidden="true" />
          <span className="truncate">{t('detail.call')}</span>
        </a>
      </Button>
    ) : (
      <Button asChild variant="primary" className={compact}>
        <a href="#specialist-booking">{t('detail.bookVisit')}</a>
      </Button>
    ),
  };
}
