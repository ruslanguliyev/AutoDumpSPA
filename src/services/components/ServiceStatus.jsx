import { Phone, MessageCircle, Globe } from 'lucide-react';

export default function ServiceStatus({ isOpen, todaySchedule, contacts }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
      <div className="status-section">
        <div className="status-row">
          <div className="status-left">
            <p className="status-label">Status</p>
            <div className={`status-value ${isOpen ? 'open' : 'closed'}`}>
              <span className={`status-dot ${isOpen ? 'open' : 'closed'}`} />
              {isOpen ? 'Open Now' : 'Closed'}
            </div>
          </div>
          {todaySchedule && !todaySchedule.closed && todaySchedule.to && (
            <div className="status-right">
              <p className="closes-label">Closes at</p>
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
            Call Now
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
              WhatsApp
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
              Website
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
