import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { isValidPhone } from '@/features/addItem/utils/validateDraft';
import { useCreateInquiry } from '@/features/inquiries/api/useInquiries';
import { mapSubmitError } from '@/lib/formSubmitError';
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
  const [touched, setTouched] = useState(false);

  if (!listingId) return null;

  const phoneTrimmed = phone.trim();
  const phoneInvalid = phoneTrimmed.length > 0 && !isValidPhone(phoneTrimmed);
  const phoneError = touched && phoneInvalid ? t('settings.seller.phoneInvalid') : null;

  const submitError = mapSubmitError(mutation.error, {
    network: t('contact.errors.network'),
    generic: t('contact.errors.generic'),
    loginRequired: t('contact.errors.loginToSend'),
  });

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
      phoneError={phoneError}
      onSubmit={() => {
        setTouched(true);
        if (!message.trim() || phoneInvalid) return;
        mutation.mutate({ listingId, message: message.trim(), phone: phoneTrimmed || undefined });
      }}
      pending={mutation.isPending}
      error={submitError?.message ?? null}
      errorAction={
        submitError?.showLoginLink ? (
          <Button asChild variant="secondary" size="sm" className="w-full">
            <Link to="/login" state={{ from: location }}>
              {t('contact.login')}
            </Link>
          </Button>
        ) : null
      }
    />
  );
}

export default ContactSellerForm;
