import type { FormEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/shared/ui/button';
import { controlClass, FieldError, FieldLabel } from '@/shared/ui/field';

type ContactFormProps = {
  title?: string;
  sent?: boolean;
  sentMessage?: string;
  /** Replaces the one-line sentMessage when the success state needs a title, text or a link. */
  sentContent?: ReactNode;
  message: string;
  onMessageChange: (value: string) => void;
  phone?: string;
  onPhoneChange?: (value: string) => void;
  showPhoneField?: boolean;
  onSubmit: () => void;
  pending?: boolean;
  error?: string | null;
  /** Shown under the error line (e.g. a login link after 401). */
  errorAction?: ReactNode;
  /** Optional field validation — standard invalid control + error text. */
  phoneError?: string | null;
  loginRequired?: ReactNode;
  className?: string;
  /** Anchor id of the card, for in-page links (e.g. the mobile bottom bar). */
  id?: string;
  /** Extra fields (dates, …) rendered above the message. */
  children?: ReactNode;
  /** The message is optional for a booking request. Defaults to true. */
  messageRequired?: boolean;
  messagePlaceholder?: string;
  submitLabel?: string;
  sendingLabel?: string;
};

/** Sidebar contact form with optional phone and a “message sent” state. */
export function ContactForm({
  title,
  sent = false,
  sentMessage,
  sentContent,
  message,
  onMessageChange,
  phone = '',
  onPhoneChange,
  showPhoneField = true,
  onSubmit,
  pending = false,
  error = null,
  errorAction = null,
  phoneError = null,
  loginRequired = null,
  className = '',
  id,
  children,
  messageRequired = true,
  messagePlaceholder,
  submitLabel,
  sendingLabel,
}: ContactFormProps) {
  const { t } = useTranslation('dashboard');
  const box = `rounded-2xl border border-border bg-card p-4 ${className}`.trim();
  const heading = title ?? t('contact.title');
  const placeholder = messagePlaceholder ?? t('contact.messagePlaceholder');

  if (loginRequired) {
    return (
      <section id={id} className={box}>
        <h3 className="text-[18px] font-semibold text-foreground">{heading}</h3>
        <div className="mt-3">{loginRequired}</div>
      </section>
    );
  }

  if (sent) {
    return (
      <section id={id} className={box}>
        {sentContent ?? (
          <p className="text-[15px] font-semibold text-foreground">{sentMessage ?? t('contact.sent')}</p>
        )}
      </section>
    );
  }

  const onFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (messageRequired && !message.trim()) return;
    onSubmit();
  };

  return (
    <section id={id} className={box}>
      <h3 className="text-[18px] font-semibold text-foreground">{heading}</h3>
      <form onSubmit={onFormSubmit} noValidate className="mt-4 flex flex-col gap-3">
        {children}
        <div>
          <FieldLabel htmlFor="contact-form-message" hidden>
            {placeholder}
          </FieldLabel>
          <textarea
            id="contact-form-message"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            maxLength={2000}
            rows={4}
            required={messageRequired}
            placeholder={placeholder}
            className={`${controlClass('md')} h-auto! min-h-24 resize-y py-2.5`}
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
              aria-invalid={Boolean(phoneError)}
              className={controlClass('md', Boolean(phoneError))}
            />
            {phoneError ? <FieldError id="contact-form-phone-error">{phoneError}</FieldError> : null}
          </div>
        ) : null}
        {error ? (
          <div role="alert" className="text-[13px] text-destructive">
            <p>{error}</p>
            {errorAction ? <div className="mt-2">{errorAction}</div> : null}
          </div>
        ) : null}
        <Button type="submit" disabled={pending || (messageRequired && !message.trim())} className="w-full">
          {pending ? sendingLabel ?? t('contact.sending') : submitLabel ?? t('contact.send')}
        </Button>
      </form>
    </section>
  );
}

export default ContactForm;
