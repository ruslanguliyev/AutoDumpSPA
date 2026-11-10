import { Globe, MessageCircle, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import Button from '@/shared/ui/button';

export default function ServiceStatus({ isOpen, todaySchedule, contacts, hasSchedule = false }) {
  const { t } = useTranslation('services');
  const phone = contacts?.phone?.trim() || null;
  const whatsapp = contacts?.whatsapp?.trim() || null;
  const website = contacts?.website?.trim() || null;
  const hasContacts = Boolean(phone || whatsapp || website);
  if (!hasSchedule && !hasContacts) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      {hasSchedule ? (
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            {t('sidebar.status')}
          </p>
          <p className="mt-1 flex items-center gap-2 text-[15px] font-semibold text-foreground">
            <span
              className={`h-2.5 w-2.5 rounded-full ${isOpen ? 'bg-success' : 'bg-muted-foreground'}`}
              aria-hidden
            />
            {isOpen ? t('sidebar.openNow') : t('sidebar.closed')}
          </p>
        </div>
        {todaySchedule && !todaySchedule.closed && todaySchedule.to ? (
          <div className="text-right">
            <p className="text-[12px] text-muted-foreground">{t('sidebar.closesAt')}</p>
            <p className="text-[15px] font-semibold text-foreground">{todaySchedule.to}</p>
          </div>
        ) : null}
      </div>
      ) : null}

      <div className={`flex flex-col gap-2 ${hasSchedule ? 'mt-4' : ''}`}>
        {phone ? (
          <Button asChild variant="primary" className="min-h-11 w-full justify-center gap-2">
            <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>
              <Phone size={18} aria-hidden="true" />
              {t('sidebar.callNow')}
            </a>
          </Button>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row">
          {whatsapp ? (
            <Button asChild variant="secondary" className="min-h-11 flex-1 justify-center gap-2">
              <a href={`https://wa.me/${whatsapp.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={18} aria-hidden="true" />
                {t('sidebar.whatsapp')}
              </a>
            </Button>
          ) : null}
          {website ? (
            <Button asChild variant="secondary" className="min-h-11 flex-1 justify-center gap-2">
              <a href={website} target="_blank" rel="noopener noreferrer">
                <Globe size={18} aria-hidden="true" />
                {t('sidebar.website')}
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
