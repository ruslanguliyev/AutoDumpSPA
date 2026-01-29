import { Phone, Mail, MapPin } from 'lucide-react';

export default function ServiceContacts({ location, contacts }) {
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
            View Map
          </button>
        </div>
      )}

      {/* CONTACT DETAILS */}
      {(contacts?.phone || contacts?.email || location?.address) && (
        <div className="contact-details">
          <h3 className="contact-title">Contact Details</h3>
          <div>
            {contacts?.phone && (
              <div className="contact-item">
                <div className="contact-icon">
                  <Phone size={18} />
                </div>
                <div className="contact-info">
                  <p className="contact-label">Phone</p>
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
                  <p className="contact-label">Email</p>
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
                  <p className="contact-label">Address</p>
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
