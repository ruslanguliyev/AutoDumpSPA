import { Globe, MessageCircle, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/shared/ui/Badge';
import Button from '@/shared/ui/button';

export default function ServiceStatus({
  isOpen,
  todaySchedule,
  contacts,
  hasSchedule = false,
  barCarriesContacts = false,
}) {
  const { t } = useTranslation('services');
  const phone = contacts?.phone?.trim() || null;
  const whatsapp = contacts?.whatsapp?.trim() || null;
  const website = contacts?.website?.trim() || null;
  const hasContacts = Boolean(phone || whatsapp || website);
  if (!hasSchedule && !hasContacts) return null;

  const hideOnMobile = barCarriesContacts ? 'max-lg:hidden' : '';
  const showPhone = Boolean(phone);
  const showWhatsapp = Boolean(whatsapp);
  const actionsHiddenOnMobile = barCarriesContacts && !website;
  const sectionHiddenOnMobile = !hasSchedule && actionsHiddenOnMobile;

  return (
    <section
      className={`rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] [overflow-wrap:anywhere] ${
        sectionHiddenOnMobile ? 'max-lg:hidden' : ''
      }`}
    >
      {hasSchedule ? (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {t('sidebar.status')}
            </p>
            <div className="mt-2">
              <Badge variant={isOpen ? 'openNow' : 'closed'}>
                {isOpen ? t('sidebar.openNow') : t('sidebar.closed')}
              </Badge>
            </div>
          </div>
          {todaySchedule && !todaySchedule.closed && todaySchedule.to ? (
            <div className="shrink-0 text-right">
              <p className="text-[12px] text-muted-foreground">{t('sidebar.closesAt')}</p>
              <p className="text-[15px] font-semibold text-foreground">{todaySchedule.to}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={`flex flex-col gap-2 ${hasSchedule ? 'mt-4' : ''}`}>
        {showPhone ? (
          <Button asChild variant="primary" className={`min-h-11 w-full justify-center gap-2 ${hideOnMobile}`}>
            <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>
              <Phone size={18} aria-hidden="true" />
              {t('sidebar.callNow')}
            </a>
          </Button>
        ) : null}
        {showWhatsapp || website ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            {showWhatsapp ? (
              <Button
                asChild
                variant="secondary"
                className={`min-h-11 min-w-0 flex-1 justify-center gap-2 ${hideOnMobile}`}
              >
                <a href={`https://wa.me/${whatsapp.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={18} aria-hidden="true" />
                  <span className="truncate">{t('sidebar.whatsapp')}</span>
                </a>
              </Button>
            ) : null}
            {website ? (
              <Button asChild variant="secondary" className="min-h-11 min-w-0 flex-1 justify-center gap-2">
                <a href={website} target="_blank" rel="noopener noreferrer">
                  <Globe size={18} aria-hidden="true" />
                  <span className="truncate">{t('sidebar.website')}</span>
                </a>
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
