import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { DashboardHeader } from '@/dashboard/components/DashboardHeader/DashboardHeader';
import { settingsApi } from '@/dashboard/api/settings.api';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { isValidPhone } from '@/features/addItem/utils/validateDraft';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';

const inputClass =
  'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60';
const labelClass =
  'mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground';
const buttonClass =
  'rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition hover:opacity-90 disabled:opacity-60';

const MIN_PASSWORD_LENGTH = 8;

/** Maps known backend messages to translated ones; anything else is shown as received. */
const useErrorText = () => {
  const { t } = useTranslation('dashboard');
  return (error: unknown): string | null => {
    if (!(error instanceof Error)) return null;
    const message = error.message;
    if (/current password is incorrect/i.test(message)) return t('settings.errors.currentIncorrect');
    if (/too many wrong attempts/i.test(message)) return t('settings.errors.tooManyAttempts');
    if (/must be different/i.test(message)) return t('settings.errors.samePassword');
    if (/at least \d+ characters/i.test(message)) return t('settings.password.tooShort', { min: MIN_PASSWORD_LENGTH });
    return message;
  };
};

const Section = ({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) => (
  <CardWrapper className="p-6">
    <h2 className="text-lg font-semibold text-foreground">{title}</h2>
    {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
    <div className="mt-5">{children}</div>
  </CardWrapper>
);

const Feedback = ({ error, success }: { error?: string | null; success?: string | null }) => (
  <>
    {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    {success ? <p role="status" className="text-sm text-emerald-600">{success}</p> : null}
  </>
);

function AccountSection() {
  const { t } = useTranslation('dashboard');
  const errorText = useErrorText();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const account = useQuery({ queryKey: ['settings', 'me'], queryFn: settingsApi.me });
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (account.data) setFullName(account.data.fullName);
  }, [account.data]);

  const save = useMutation({
    mutationFn: settingsApi.updateName,
    onSuccess: (updated) => {
      queryClient.setQueryData(['settings', 'me'], updated);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      const current = useAuthStore.getState().user;
      if (current) setUser({ ...current, fullName: updated.fullName });
    },
  });

  const trimmed = fullName.trim();
  const unchanged = trimmed === (account.data?.fullName ?? '');
  const invalid = trimmed.length === 0 || trimmed.length > 100;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!invalid && !unchanged) save.mutate(trimmed);
  };

  return (
    <Section title={t('settings.account.title')} subtitle={t('settings.account.subtitle')}>
      <form onSubmit={onSubmit} className="grid max-w-xl gap-4">
        <div>
          <label className={labelClass} htmlFor="settings-email">{t('settings.account.email')}</label>
          <input id="settings-email" className={inputClass} value={account.data?.email ?? ''} disabled readOnly />
        </div>
        <div>
          <label className={labelClass} htmlFor="settings-name">{t('settings.account.fullName')}</label>
          <input
            id="settings-name"
            className={inputClass}
            value={fullName}
            maxLength={100}
            onChange={(e) => {
              setFullName(e.target.value);
              save.reset();
            }}
            disabled={account.isLoading}
          />
        </div>
        <Feedback
          error={errorText(save.error) ?? errorText(account.error)}
          success={save.isSuccess ? t('settings.saved') : null}
        />
        <div>
          <button type="submit" className={buttonClass} disabled={save.isPending || invalid || unchanged}>
            {save.isPending ? t('settings.saving') : t('settings.save')}
          </button>
        </div>
      </form>
    </Section>
  );
}

function PasswordSection() {
  const { t } = useTranslation('dashboard');
  const errorText = useErrorText();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');

  const change = useMutation({
    mutationFn: () => settingsApi.changePassword(current, next),
    onSuccess: () => {
      setCurrent('');
      setNext('');
      setConfirm('');
    },
  });

  const tooShort = next.length > 0 && next.length < MIN_PASSWORD_LENGTH;
  const mismatch = confirm.length > 0 && confirm !== next;
  const ready = current.length > 0 && next.length >= MIN_PASSWORD_LENGTH && next === confirm;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (ready) change.mutate();
  };

  const edit = (setter: (value: string) => void) => (event: { target: { value: string } }) => {
    setter(event.target.value);
    if (change.isSuccess || change.isError) change.reset();
  };

  return (
    <Section title={t('settings.password.title')} subtitle={t('settings.password.hint', { min: MIN_PASSWORD_LENGTH })}>
      <form onSubmit={onSubmit} className="grid max-w-xl gap-4">
        <div>
          <label className={labelClass} htmlFor="settings-current">{t('settings.password.current')}</label>
          <input id="settings-current" type="password" autoComplete="current-password" className={inputClass} value={current} onChange={edit(setCurrent)} />
        </div>
        <div>
          <label className={labelClass} htmlFor="settings-new">{t('settings.password.new')}</label>
          <input id="settings-new" type="password" autoComplete="new-password" className={inputClass} value={next} onChange={edit(setNext)} />
          {tooShort ? <p className="mt-1 text-xs text-destructive">{t('settings.password.tooShort', { min: MIN_PASSWORD_LENGTH })}</p> : null}
        </div>
        <div>
          <label className={labelClass} htmlFor="settings-confirm">{t('settings.password.confirm')}</label>
          <input id="settings-confirm" type="password" autoComplete="new-password" className={inputClass} value={confirm} onChange={edit(setConfirm)} />
          {mismatch ? <p className="mt-1 text-xs text-destructive">{t('settings.password.mismatch')}</p> : null}
        </div>
        <Feedback error={errorText(change.error)} success={change.isSuccess ? t('settings.password.changed') : null} />
        <div>
          <button type="submit" className={buttonClass} disabled={change.isPending || !ready}>
            {change.isPending ? t('settings.saving') : t('settings.password.change')}
          </button>
        </div>
      </form>
    </Section>
  );
}

function SellerSection() {
  const { t } = useTranslation('dashboard');
  const errorText = useErrorText();
  const queryClient = useQueryClient();
  const seller = useQuery({ queryKey: ['settings', 'seller'], queryFn: settingsApi.mySeller });
  const [form, setForm] = useState({ name: '', city: '', phone: '', showPhone: true });

  useEffect(() => {
    if (seller.data) {
      setForm({
        name: seller.data.name,
        city: seller.data.city,
        phone: seller.data.phone ?? '',
        showPhone: seller.data.showPhone,
      });
    }
  }, [seller.data]);

  const save = useMutation({
    mutationFn: settingsApi.updateSeller,
    onSuccess: (updated) => {
      queryClient.setQueryData(['settings', 'seller'], updated);
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });

  if (seller.isLoading) return null;

  if (!seller.data) {
    return (
      <Section title={t('settings.seller.title')}>
        <p className="text-sm text-muted-foreground">{t('settings.seller.none')}</p>
        <Link to="/add" className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline">
          {t('settings.seller.createListing')}
        </Link>
      </Section>
    );
  }

  const phoneTrimmed = form.phone.trim();
  const phoneInvalid = phoneTrimmed.length > 0 && !isValidPhone(phoneTrimmed);
  const nameInvalid = form.name.trim().length === 0;
  const unchanged =
    form.name.trim() === seller.data.name &&
    form.city.trim() === seller.data.city &&
    phoneTrimmed === (seller.data.phone ?? '') &&
    form.showPhone === seller.data.showPhone;

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    save.reset();
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (phoneInvalid || nameInvalid || unchanged) return;
    save.mutate({
      name: form.name.trim(),
      city: form.city.trim(),
      phone: phoneTrimmed,
      showPhone: form.showPhone,
    });
  };

  return (
    <Section title={t('settings.seller.title')} subtitle={t('settings.seller.subtitle')}>
      <form onSubmit={onSubmit} className="grid max-w-xl gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="seller-name">{t('settings.seller.name')}</label>
          <input id="seller-name" className={inputClass} value={form.name} onChange={(e) => update('name', e.target.value)} />
        </div>
        <div>
          <label className={labelClass} htmlFor="seller-city">{t('settings.seller.city')}</label>
          <input id="seller-city" className={inputClass} value={form.city} onChange={(e) => update('city', e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="seller-phone">{t('settings.seller.phone')}</label>
          <input
            id="seller-phone"
            type="tel"
            className={inputClass}
            placeholder="+994 50 123 45 67"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
          />
          {phoneInvalid ? <p className="mt-1 text-xs text-destructive">{t('settings.seller.phoneInvalid')}</p> : null}
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground md:col-span-2">
          <input type="checkbox" checked={form.showPhone} onChange={(e) => update('showPhone', e.target.checked)} />
          {t('settings.seller.showPhone')}
        </label>
        <div className="space-y-3 md:col-span-2">
          <Feedback error={errorText(save.error)} success={save.isSuccess ? t('settings.saved') : null} />
          <button type="submit" className={buttonClass} disabled={save.isPending || phoneInvalid || nameInvalid || unchanged}>
            {save.isPending ? t('settings.saving') : t('settings.save')}
          </button>
        </div>
      </form>
    </Section>
  );
}

export function SettingsPage() {
  const { t } = useTranslation('dashboard');

  return (
    <div className="space-y-8">
      <DashboardHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />
      <AccountSection />
      <SellerSection />
      <PasswordSection />
    </div>
  );
}
