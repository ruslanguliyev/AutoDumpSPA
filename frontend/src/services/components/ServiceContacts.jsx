import { Mail, MapPin, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ServiceContacts({ location, contacts }) {
  const { t } = useTranslation('services');
  if (!contacts?.phone && !contacts?.email && !location?.address) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <h3 className="text-[17px] font-semibold text-foreground">{t('sidebar.contactDetails')}</h3>
      <ul className="mt-3 space-y-3 text-[13px]">
        {contacts?.phone ? (
          <li className="flex gap-3">
            <Phone size={18} className="shrink-0 text-muted-foreground" aria-hidden />
            <div>
              <p className="text-muted-foreground">{t('sidebar.phone')}</p>
              <p className="font-semibold text-foreground">{contacts.phone}</p>
            </div>
          </li>
        ) : null}
        {contacts?.email ? (
          <li className="flex gap-3">
            <Mail size={18} className="shrink-0 text-muted-foreground" aria-hidden />
            <div>
              <p className="text-muted-foreground">{t('sidebar.email')}</p>
              <p className="font-semibold text-foreground">{contacts.email}</p>
            </div>
          </li>
        ) : null}
        {location?.address ? (
          <li className="flex gap-3">
            <MapPin size={18} className="shrink-0 text-muted-foreground" aria-hidden />
            <div>
              <p className="text-muted-foreground">{t('sidebar.address')}</p>
              <p className="text-foreground">{location.address}</p>
            </div>
          </li>
        ) : null}
      </ul>
    </section>
  );
}
