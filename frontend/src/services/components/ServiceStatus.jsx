import { Phone, MessageCircle, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ServiceStatus({ isOpen, todaySchedule, contacts }) {
  const { t } = useTranslation('services');
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow)] sm:rounded-2xl sm:p-6">
      <div className="status-section">
        <div className="status-row">
          <div className="status-left">
            <p className="status-label">{t('sidebar.status')}</p>
            <div className={`status-value ${isOpen ? 'open' : 'closed'}`}>
              <span className={`status-dot ${isOpen ? 'open' : 'closed'}`} />
              {isOpen ? t('sidebar.openNow') : t('sidebar.closed')}
            </div>
          </div>
          {todaySchedule && !todaySchedule.closed && todaySchedule.to && (
            <div className="status-right">
              <p className="closes-label">{t('sidebar.closesAt')}</p>
              <p className="closes-time">{todaySchedule.to}</p>
            </div>
          )}
        </div>
      </div>

      <div className="cta-buttons">
        {contacts?.phone && (
          <a
            href={`tel:${contacts.phone}`}
            className="cta-primary call"
          >
            <Phone size={18} strokeWidth={2.5} />
            {t('sidebar.callNow')}
          </a>
        )}
        <div className="cta-secondary">
          {contacts?.whatsapp && (
            <a
              href={`https://wa.me/${contacts.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button whatsapp"
            >
              <MessageCircle size={18} strokeWidth={2.5} />
              {t('sidebar.whatsapp')}
            </a>
          )}
          {contacts?.website && contacts.website.trim() && (
            <a
              href={contacts.website}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button website"
            >
              <Globe size={18} strokeWidth={2.5} />
              {t('sidebar.website')}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
