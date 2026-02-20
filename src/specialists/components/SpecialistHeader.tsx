import { BadgeCheck, MapPin, MessageCircle, PhoneCall, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '@/shared/ui/button';
import SpecialistBadge from '@/specialists/components/SpecialistBadge';
import type { SpecialistDetail } from '@/specialists/types/specialist.types';

type SpecialistHeaderProps = {
  specialist: SpecialistDetail;
  city?: string | null;
};

const getInitials = (name: string) => {
  const safe = name.trim();
  if (!safe) return '??';
  return safe.slice(0, 2).toUpperCase();
};

const sanitizePhone = (value: string) => value.replace(/\s/g, '');
const sanitizeWhatsApp = (value: string) => value.replace(/[^\d]/g, '');

const SpecialistHeader = ({ specialist, city }: SpecialistHeaderProps) => {
  const { t } = useTranslation('specialists');

  const ratingValue = Number.isFinite(specialist.rating) ? Number(specialist.rating) : 0;
  const reviewsCount = Number.isFinite(specialist.reviewsCount)
    ? Number(specialist.reviewsCount)
    : 0;

  const phone = specialist.phone?.trim();
  const whatsapp = specialist.whatsapp?.trim();

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative h-40 bg-muted sm:h-48">
        {specialist.coverImage ? (
          <img
            src={specialist.coverImage}
            alt={specialist.name}
            className="h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
      </div>

      <div className="flex flex-col gap-4 px-5 pb-5 pt-4 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:pb-6">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-end">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted sm:h-24 sm:w-24">
            {specialist.avatarUrl ? (
              <img
                src={specialist.avatarUrl}
                alt={specialist.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground">
                {getInitials(specialist.name)}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-foreground">{specialist.name}</h1>
              {specialist.verified ? (
                <SpecialistBadge
                  label={t('card.verified')}
                  variant="verified"
                  icon={<BadgeCheck size={14} aria-hidden="true" />}
                />
              ) : null}
              {specialist.mobileService ? (
                <SpecialistBadge label={t('card.mobileService')} variant="mobile" />
              ) : null}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {ratingValue > 0 ? (
                <span className="inline-flex items-center gap-1 text-foreground">
                  <Star size={14} className="text-warning" aria-hidden="true" />
                  <span className="font-medium">{ratingValue.toFixed(1)}</span>
                </span>
              ) : null}
              <span>{t('card.reviews', { count: reviewsCount })}</span>
              {city ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={14} aria-hidden="true" />
                  {city}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {phone ? (
            <Button asChild size="sm" className="rounded-xl">
              <a href={`tel:${sanitizePhone(phone)}`} aria-label={t('detail.call')}>
                <PhoneCall size={16} />
                {t('detail.call')}
              </a>
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="rounded-xl" disabled>
              <PhoneCall size={16} />
              {t('detail.call')}
            </Button>
          )}

          {whatsapp ? (
            <Button asChild size="sm" variant="outline" className="rounded-xl">
              <a
                href={`https://wa.me/${sanitizeWhatsApp(whatsapp)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('detail.whatsapp')}
              >
                <MessageCircle size={16} />
                {t('detail.whatsapp')}
              </a>
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="rounded-xl" disabled>
              <MessageCircle size={16} />
              {t('detail.whatsapp')}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default SpecialistHeader;
