import { MapPin, MessageCircle, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatPrice, intlLocale } from '@/lib/format';
import { AppointmentRequestCard } from '@/features/appointments/components/AppointmentRequestCard';
import type { ServiceProfile } from '@/services/types/service.types';
import type { SpecialistDetail } from '@/specialists/types/specialist.types';
import { Badge } from '@/shared/ui/Badge';
import Button from '@/shared/ui/button';

type SpecialistSidebarCardProps = {
  specialist: SpecialistDetail;
  primaryService?: ServiceProfile | null;
};

const digits = (value: string) => value.replace(/[^\d]/g, '');
const telHref = (value: string) => `tel:${value.replace(/[^\d+]/g, '')}`;

const SpecialistSidebarCard = ({ specialist, primaryService }: SpecialistSidebarCardProps) => {
  const { t, i18n } = useTranslation('specialists');
  const locale = intlLocale(i18n.language);

  const priceFrom = Number.isFinite(specialist.priceFrom) ? Number(specialist.priceFrom) : null;
  const phone = specialist.phone?.trim() || null;
  const whatsapp = specialist.whatsapp?.trim() || null;
  const available = specialist.available !== false;

  const city = primaryService?.location?.city ?? specialist.location ?? null;
  const address = primaryService?.location?.address ?? null;
  const showContact = Boolean(city || address || phone);

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] [overflow-wrap:anywhere]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {priceFrom !== null ? t('detail.startingAt') : t('detail.priceOnRequest')}
            </p>
            {priceFrom !== null ? (
              <p className="mt-1 text-[28px] font-bold leading-none text-primary-text">
                {formatPrice(priceFrom, 'AZN', locale)}
              </p>
            ) : null}
          </div>
          <Badge variant={available ? 'openNow' : 'closed'}>
            {available ? t('detail.available') : t('detail.unavailable')}
          </Badge>
        </div>

        {phone || whatsapp ? (
          <div className="mt-4 hidden flex-col gap-2 lg:flex">
            {phone ? (
              <Button asChild variant="primary" className="w-full justify-center gap-2">
                <a href={telHref(phone)}>
                  <Phone size={18} aria-hidden="true" />
                  {t('detail.call')}
                </a>
              </Button>
            ) : null}
            {whatsapp ? (
              <Button asChild variant="secondary" className="w-full justify-center gap-2">
                <a href={`https://wa.me/${digits(whatsapp)}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={18} aria-hidden="true" />
                  {t('detail.whatsapp')}
                </a>
              </Button>
            ) : null}
          </div>
        ) : null}
      </section>

      <div id="specialist-booking" className="scroll-mt-24">
        <AppointmentRequestCard targetType="SPECIALIST" targetId={specialist.id} accepting={available} />
      </div>

      {showContact ? (
        <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] [overflow-wrap:anywhere]">
          <h2 className="text-[17px] font-semibold text-foreground">{t('detail.contactInfo')}</h2>
          <ul className="mt-3 space-y-3 text-[13px]">
            {city || address ? (
              <li className="flex gap-3">
                <MapPin size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{specialist.name}</p>
                  {address ? <p className="mt-0.5 text-muted-foreground">{address}</p> : null}
                  {city ? <p className="mt-0.5 text-muted-foreground">{city}</p> : null}
                </div>
              </li>
            ) : null}
            {phone ? (
              <li className="flex gap-3">
                <Phone size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <a href={telHref(phone)} className="font-semibold text-primary-text no-underline">
                  {phone}
                </a>
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}
    </div>
  );
};

export default SpecialistSidebarCard;
