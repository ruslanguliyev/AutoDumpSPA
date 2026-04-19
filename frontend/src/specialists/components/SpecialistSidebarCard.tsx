import { Calendar, Clock3, MapPin, MessageCircle, PhoneCall, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SpecialistDetail } from '@/specialists/types/specialist.types';

const btnBase =
  'inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-6 text-base font-medium no-underline transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60';
const btnPrimary = 'bg-primary text-primary-foreground hover:bg-primary/90';
const btnOutline = 'border border-border bg-card text-foreground hover:bg-muted hover:bg-muted/80';
import type { ServiceProfile } from '@/services/types/service.types';

type SpecialistSidebarCardProps = {
  specialist: SpecialistDetail;
  primaryService?: ServiceProfile | null;
};

const sanitizePhone = (value: string) => value.replace(/\s/g, '');
const sanitizeWhatsApp = (value: string) => value.replace(/[^\d]/g, '');

const SpecialistSidebarCard = ({ specialist, primaryService }: SpecialistSidebarCardProps) => {
  const { t } = useTranslation('specialists');

  const priceFrom = Number.isFinite(specialist.priceFrom) ? Number(specialist.priceFrom) : null;
  const phone = specialist.phone?.trim() ?? null;
  const whatsapp = specialist.whatsapp?.trim() ?? null;

  const city =
    primaryService?.location?.city ??
    (specialist.location ? specialist.location : null);

  const address = primaryService?.location?.address ?? null;

  return (
    <div className="specialist-sidebar-card space-y-4">
      {/* Booking card */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow)] sm:p-6">
        {/* Price + availability */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-normal text-muted-foreground">
              {t('detail.startingAt')}
            </p>
            {priceFrom !== null ? (
              <p className="mt-0.5 text-3xl font-semibold text-foreground">
                ₼{priceFrom.toFixed(0)}
                <span className="ml-1 text-base font-medium text-muted-foreground"></span>
              </p>
            ) : (
              <p className="mt-0.5 text-base font-medium text-muted-foreground">
                {t('detail.priceOnRequest')}
              </p>
            )}
          </div>

          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary ring-1 ring-primary/20">
            {t('detail.available')}
          </span>
        </div>

        {/* Info rows */}
        <div className="mt-1 space-y-2 text-sm">
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Calendar size={15} className="shrink-0 text-primary" aria-hidden="true" />
            <span>
              <span className="font-medium text-foreground">{t('detail.nextSlot')}:</span>{' '}
              {t('detail.nextSlotValue')}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Video size={15} className="shrink-0 text-muted-foreground" aria-hidden="true" />
            <span>{t('detail.virtualConsultation')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-2">
          {phone ? (
            <a
              href={`tel:${sanitizePhone(phone)}`}
              aria-label={t('detail.bookConsultation')}
              className={`${btnBase} ${btnPrimary}`}
              style={{ textDecoration: 'none' }}
            >
              {t('detail.bookConsultation')}
            </a>
          ) : (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className={`${btnBase} ${btnPrimary}`}
            >
              {t('detail.bookConsultation')}
            </button>
          )}

          {whatsapp ? (
            <a
              href={`https://wa.me/${sanitizeWhatsApp(whatsapp)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('detail.sendMessage')}
              className={`${btnBase} ${btnOutline}`}
              style={{ textDecoration: 'none' }}
            >
              <MessageCircle size={16} aria-hidden="true" />
              {t('detail.sendMessage')}
            </a>
          ) : phone ? (
            <a
              href={`tel:${sanitizePhone(phone)}`}
              aria-label={t('detail.call')}
              className={`${btnBase} ${btnOutline}`}
              style={{ textDecoration: 'none' }}
            >
              <PhoneCall size={16} aria-hidden="true" />
              {t('detail.call')}
            </a>
          ) : (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className={`${btnBase} ${btnOutline}`}
            >
              {t('detail.sendMessage')}
            </button>
            )}

          <p className="m-0 text-center text-xs text-muted-foreground">
            {t('detail.noCharge')}
          </p>
        </div>
      </div>

      {/* Contact info card */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow)] sm:p-6">
        <h2 className="text-sm font-semibold text-foreground">{t('detail.contactInfo')}</h2>

        <div className="mt-4 space-y-5 text-sm text-muted-foreground">
          {(city || address) ? (
            <div className="flex gap-3">
              <div className="mt-1 text-primary/70">
                <MapPin size={18} aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium text-foreground mb-0">{specialist.name}</p>
                {address ? <p className="mt-0.5 mb-0">{address}</p> : null}
                {city ? <p className="mt-0.5 mb-0">{city}</p> : null}
                <button
                  type="button"
                  className="text-sm font-medium text-primary no-underline hover:no-underline"
                >
                  {t('detail.viewOnMap')}
                </button>
              </div>
            </div>
          ) : null}

          {(city || address || phone) ? (
            <div className="h-px w-full bg-border/60" aria-hidden="true" />
          ) : null}

          {phone ? (
            <div className="flex gap-3">
              <div className="mt-1 text-primary/70">
                <PhoneCall size={18} aria-hidden="true" />
              </div>
              <div>
                <a
                  href={`tel:${sanitizePhone(phone)}`}
                  className="text-primary"
                  style={{ textDecoration: 'none' }}
                >
                  {phone}
                </a>
              </div>
            </div>
          ) : null}

          <div className="flex gap-3">
            <div className="mt-1 text-primary/70">
              <Clock3 size={18} aria-hidden="true" />
            </div>
            <div>
              <p className="mt-0.5 mb-0 text-muted-foreground">Mon – Fri · 8:00 – 18:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialistSidebarCard;
