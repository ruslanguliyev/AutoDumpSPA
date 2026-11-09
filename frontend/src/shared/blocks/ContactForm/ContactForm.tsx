import type { FormEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/shared/ui/button';
import { controlClass, FieldLabel } from '@/shared/ui/field';

type ContactFormProps = {
  title?: string;
  sent?: boolean;
  sentMessage?: string;
  message: string;
  onMessageChange: (value: string) => void;
  phone?: string;
  onPhoneChange?: (value: string) => void;
  showPhoneField?: boolean;
  onSubmit: () => void;
  pending?: boolean;
  error?: string | null;
  loginRequired?: ReactNode;
  className?: string;
  submitLabel?: string;
  sendingLabel?: string;
};

/** Sidebar contact form with optional phone and a “message sent” state. */
export function ContactForm({
  title,
  sent = false,
  sentMessage,
  message,
  onMessageChange,
  phone = '',
  onPhoneChange,
  showPhoneField = true,
  onSubmit,
  pending = false,
  error = null,
  loginRequired = null,
  className = '',
  submitLabel,
  sendingLabel,
}: ContactFormProps) {
  const { t } = useTranslation('dashboard');
  const box = `rounded-2xl border border-border bg-card p-4 ${className}`.trim();
  const heading = title ?? t('contact.title');

  if (loginRequired) {
    return (
      <section className={box}>
        <h3 className="text-[18px] font-semibold text-foreground">{heading}</h3>
        <div className="mt-3">{loginRequired}</div>
      </section>
    );
  }

  if (sent) {
    return (
      <section className={box}>
        <p className="text-[15px] font-semibold text-foreground">{sentMessage ?? t('contact.sent')}</p>
      </section>
    );
  }

  const onFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    onSubmit();
  };

  return (
    <section className={box}>
      <h3 className="text-[18px] font-semibold text-foreground">{heading}</h3>
      <form onSubmit={onFormSubmit} className="mt-4 flex flex-col gap-3">
        <div>
          <FieldLabel htmlFor="contact-form-message" hidden>
            {t('contact.messagePlaceholder')}
          </FieldLabel>
          <textarea
            id="contact-form-message"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            maxLength={2000}
            rows={4}
            required
            placeholder={t('contact.messagePlaceholder')}
            className={`${controlClass('md')} resize-y py-2.5`}
          />
        </div>
        {showPhoneField && onPhoneChange ? (
          <div>
            <FieldLabel htmlFor="contact-form-phone" hidden>
              {t('contact.phonePlaceholder')}
            </FieldLabel>
            <input
              id="contact-form-phone"
              type="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder={t('contact.phonePlaceholder')}
              className={controlClass('md')}
            />
          </div>
        ) : null}
        {error ? (
          <p role="alert" className="text-[13px] text-destructive">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={pending || !message.trim()} className="w-full">
          {pending ? sendingLabel ?? t('contact.sending') : submitLabel ?? t('contact.send')}
        </Button>
      </form>
    </section>
  );
}

export default ContactForm;
