import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useCreateInquiry } from '@/features/inquiries/api/useInquiries';
import Button from '@/shared/ui/button';
import { ContactForm } from '@/shared/blocks/ContactForm';

type Props = {
  /** Listing the inquiry is about. When missing (e.g. mock data) the form is hidden. */
  listingId?: string | null;
  className?: string;
};

/** Thin wrapper: auth + inquiry API around shared `ContactForm`. */
export function ContactSellerForm({ listingId, className = '' }: Props) {
  const { t } = useTranslation('dashboard');
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const mutation = useCreateInquiry();
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');

  if (!listingId) return null;

  if (!isAuthenticated) {
    return (
      <ContactForm
        className={className}
        message=""
        onMessageChange={() => {}}
        onSubmit={() => {}}
        loginRequired={
          <>
            <p className="text-[15px] text-muted-foreground">{t('contact.loginRequired')}</p>
            <Button asChild variant="primary" className="mt-3 w-full">
              <Link to="/login" state={{ from: location }}>
                {t('contact.login')}
              </Link>
            </Button>
          </>
        }
      />
    );
  }

  return (
    <ContactForm
      className={className}
      sent={mutation.isSuccess}
      message={message}
      onMessageChange={setMessage}
      phone={phone}
      onPhoneChange={setPhone}
      onSubmit={() => {
        if (!message.trim()) return;
        mutation.mutate({ listingId, message: message.trim(), phone: phone.trim() || undefined });
      }}
      pending={mutation.isPending}
      error={mutation.isError ? mutation.error.message : null}
    />
  );
}

export default ContactSellerForm;
