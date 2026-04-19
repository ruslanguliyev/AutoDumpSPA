import { Phone, Mail, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ServiceContacts({ location, contacts }) {
  const { t } = useTranslation('services');
  if (!location && !contacts) return null;

  return (
    <section className="map-section">
      {/* MAP */}
      {location && (
        <div className="map-container">
          <div className="map-placeholder">
            <MapPin size={32} />
          </div>
          <button type="button" className="map-button">
            <MapPin size={18} />
            {t('sidebar.viewMap')}
          </button>
        </div>
      )}

      {/* CONTACT DETAILS */}
      {(contacts?.phone || contacts?.email || location?.address) && (
        <div className="contact-details">
          <h3 className="contact-title">{t('sidebar.contactDetails')}</h3>
          <div>
            {contacts?.phone && (
              <div className="contact-item">
                <div className="contact-icon">
                  <Phone size={18} />
                </div>
                <div className="contact-info">
                  <p className="contact-label">{t('sidebar.phone')}</p>
                  <p className="contact-value contact-value-bold">{contacts.phone}</p>
                </div>
              </div>
            )}
            {contacts?.email && (
              <div className="contact-item">
                <div className="contact-icon">
                  <Mail size={18} />
                </div>
                <div className="contact-info">
                  <p className="contact-label">{t('sidebar.email')}</p>
                  <p className="contact-value contact-value-bold">{contacts.email}</p>
                </div>
              </div>
            )}
            {location?.address && (
              <div className="contact-item">
                <div className="contact-icon">
                  <MapPin size={18} />
                </div>
                <div className="contact-info">
                  <p className="contact-label">{t('sidebar.address')}</p>
                  <p className="contact-value contact-value-regular">{location.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
