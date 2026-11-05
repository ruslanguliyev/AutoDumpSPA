import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useCreateInquiry } from '@/features/inquiries/api/useInquiries';

type Props = {
  /** Listing the inquiry is about. When missing (e.g. mock data) the form is hidden. */
  listingId?: string | null;
  className?: string;
};

/** "Write to the seller" form shown on vehicle and part detail pages. */
export function ContactSellerForm({ listingId, className = '' }: Props) {
  const { t } = useTranslation('dashboard');
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const mutation = useCreateInquiry();
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');

  if (!listingId) return null;

  const box = `rounded-2xl border border-border bg-card p-4 ${className}`;

  if (!isAuthenticated) {
    return (
      <section className={box}>
        <h3 className="text-base font-semibold">{t('contact.title')}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{t('contact.loginRequired')}</p>
        <Link
          to="/login"
          state={{ from: location }}
          className="mt-3 inline-flex rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90"
        >
          {t('contact.login')}
        </Link>
      </section>
    );
  }

  if (mutation.isSuccess) {
    return (
      <section className={box}>
        <p className="text-sm font-semibold text-foreground">{t('contact.sent')}</p>
      </section>
    );
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    mutation.mutate({ listingId, message: message.trim(), phone: phone.trim() || undefined });
  };

  return (
    <section className={box}>
      <h3 className="text-base font-semibold">{t('contact.title')}</h3>
      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          rows={4}
          required
          placeholder={t('contact.messagePlaceholder')}
          className="w-full resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('contact.phonePlaceholder')}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
        />
        {mutation.isError ? (
          <p className="text-sm text-destructive">{mutation.error.message}</p>
        ) : null}
        <button
          type="submit"
          disabled={mutation.isPending || !message.trim()}
          className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60"
        >
          {mutation.isPending ? t('contact.sending') : t('contact.send')}
        </button>
      </form>
    </section>
  );
}

export default ContactSellerForm;
