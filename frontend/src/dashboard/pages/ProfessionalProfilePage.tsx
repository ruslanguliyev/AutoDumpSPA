import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { DashboardHeader } from '@/dashboard/components/DashboardHeader/DashboardHeader';
import { isValidPhone } from '@/features/addItem/utils/validateDraft';
import type {
  MyServiceCenter,
  MySpecialist,
  PriceItem,
  ServiceCenterFormValues,
  SpecialistFormValues,
} from '@/features/professional/api/professional.api';
import { useMyProfessional, useSaveServiceCenter, useSaveSpecialist } from '@/features/professional/hooks/useProfessional';
import { Specialization } from '@/specialists/types/specialist.types';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';

type Kind = 'specialist' | 'center';

const inputClass =
  'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground';

const csv = (value: string) =>
  value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** URL part of a new specialist profile: readable but always unique. */
const makeSlug = (name: string) => `${slugify(name) || 'master'}-${Math.random().toString(36).slice(2, 6)}`;

const numberOrNull = (value: string) => {
  const n = Number(value.replace(',', '.'));
  return value.trim() === '' || !Number.isFinite(n) || n < 0 ? null : n;
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function SaveBar({ pending, error, saved, label }: { pending: boolean; error?: string; saved: boolean; label: string }) {
  const { t } = useTranslation('dashboard');
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? t('settings.saving') : label}
      </button>
      {saved ? <span className="text-sm text-emerald-600">{t('professional.saved')}</span> : null}
      {error ? <span role="alert" className="text-sm text-destructive">{error}</span> : null}
    </div>
  );
}

function SpecialistForm({ existing }: { existing: MySpecialist | null }) {
  const { t } = useTranslation('dashboard');
  const { t: ts } = useTranslation('specialists');
  const save = useSaveSpecialist(Boolean(existing));
  const [name, setName] = useState(existing?.name ?? '');
  const [city, setCity] = useState(existing?.city ?? 'Baku');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [whatsapp, setWhatsapp] = useState(existing?.whatsapp ?? '');
  const [bio, setBio] = useState(existing?.bio ?? '');
  const [experience, setExperience] = useState(String(existing?.experience ?? 0));
  const [specs, setSpecs] = useState<string[]>(existing?.specializations ?? []);
  const [hourlyRate, setHourlyRate] = useState(existing?.hourlyRate?.toString() ?? '');
  const [priceFrom, setPriceFrom] = useState(existing?.priceFrom?.toString() ?? '');
  const [mobile, setMobile] = useState(existing?.mobileService ?? false);
  const [available, setAvailable] = useState(existing?.available ?? true);
  const [saved, setSaved] = useState(false);

  const phoneOk = isValidPhone(phone);
  const valid = name.trim().length >= 2 && city.trim().length >= 2 && phoneOk;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    const values: SpecialistFormValues = {
      name: name.trim(),
      city: city.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.replace(/[^\d]/g, ''),
      bio: bio.trim(),
      experience: Math.max(0, Math.min(60, Math.trunc(Number(experience) || 0))),
      specializations: specs,
      hourlyRate: numberOrNull(hourlyRate),
      priceFrom: numberOrNull(priceFrom),
      mobileService: mobile,
      available,
    };
    setSaved(false);
    save.mutate({ ...values, slug: makeSlug(values.name) }, { onSuccess: () => setSaved(true) });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('professional.name')}>
          <input className={inputClass} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={t('professional.city')}>
          <input className={inputClass} value={city} maxLength={60} onChange={(e) => setCity(e.target.value)} />
        </Field>
        <Field label={t('professional.phone')}>
          <input className={inputClass} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {phone.trim() && !phoneOk ? <p className="mt-1 text-xs text-destructive">{t('settings.seller.phoneInvalid')}</p> : null}
        </Field>
        <Field label={t('professional.whatsapp')}>
          <input className={inputClass} type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </Field>
        <Field label={t('professional.experience')}>
          <input className={inputClass} type="number" min={0} max={60} value={experience} onChange={(e) => setExperience(e.target.value)} />
        </Field>
        <Field label={t('professional.priceFrom')}>
          <input className={inputClass} type="number" min={0} value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} />
        </Field>
        <Field label={t('professional.hourlyRate')}>
          <input className={inputClass} type="number" min={0} value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
        </Field>
      </div>

      <Field label={t('professional.about')}>
        <textarea className={inputClass} rows={4} maxLength={2000} value={bio} onChange={(e) => setBio(e.target.value)} />
      </Field>

      <fieldset>
        <legend className={labelClass}>{t('professional.specializations')}</legend>
        <div className="flex flex-wrap gap-2">
          {Object.values(Specialization).map((value) => {
            const on = specs.includes(value);
            return (
              <label
                key={value}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${on ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={on}
                  onChange={() => setSpecs(on ? specs.filter((s) => s !== value) : [...specs, value])}
                />
                {ts(`specializations.${value}`)}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-6 text-sm text-foreground">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={mobile} onChange={(e) => setMobile(e.target.checked)} /> {t('professional.mobile')}
        </label>
        {existing ? (
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} /> {t('professional.accepting')}
          </label>
        ) : null}
      </div>

      <SaveBar
        pending={save.isPending}
        error={save.error?.message}
        saved={saved}
        label={existing ? t('professional.save') : t('professional.create')}
      />
      {existing ? (
        <p className="text-sm">
          <Link to={`/specialists/${existing.slug}`} className="font-semibold text-primary hover:underline">
            {t('professional.viewPublic')}
          </Link>
        </p>
      ) : null}
    </form>
  );
}

function CenterForm({ existing }: { existing: MyServiceCenter | null }) {
  const { t } = useTranslation('dashboard');
  const save = useSaveServiceCenter(Boolean(existing));
  const [name, setName] = useState(existing?.name ?? '');
  const [city, setCity] = useState(existing?.city ?? 'Baku');
  const [address, setAddress] = useState(existing?.address ?? '');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [whatsapp, setWhatsapp] = useState(existing?.whatsapp ?? '');
  const [website, setWebsite] = useState(existing?.website ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [categories, setCategories] = useState((existing?.categories ?? []).join(', '));
  const [brands, setBrands] = useState((existing?.supportedBrands ?? []).join(', '));
  const [active, setActive] = useState(existing?.isActive ?? true);
  const [items, setItems] = useState<Array<{ title: string; price: string }>>(
    (existing?.services ?? []).map((s) => ({ title: s.title, price: s.priceFrom?.toString() ?? '' })),
  );
  const [saved, setSaved] = useState(false);

  const phoneOk = isValidPhone(phone);
  const valid = name.trim().length >= 2 && city.trim().length >= 2 && phoneOk;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    const cats = csv(categories);
    const services: PriceItem[] = items
      .filter((i) => i.title.trim())
      .map((i, index) => ({
        code: `${slugify(i.title) || 'service'}-${index + 1}`,
        title: i.title.trim(),
        category: cats[0] ?? 'General',
        priceFrom: numberOrNull(i.price),
      }));
    const values: ServiceCenterFormValues = {
      name: name.trim(),
      city: city.trim(),
      address: address.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.replace(/[^\d]/g, ''),
      website: website.trim(),
      description: description.trim(),
      categories: cats,
      supportedBrands: csv(brands),
      isActive: active,
      services,
    };
    setSaved(false);
    save.mutate(values, { onSuccess: () => setSaved(true) });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('professional.centerName')}>
          <input className={inputClass} value={name} maxLength={100} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={t('professional.city')}>
          <input className={inputClass} value={city} maxLength={60} onChange={(e) => setCity(e.target.value)} />
        </Field>
        <Field label={t('professional.address')}>
          <input className={inputClass} value={address} maxLength={200} onChange={(e) => setAddress(e.target.value)} />
        </Field>
        <Field label={t('professional.phone')}>
          <input className={inputClass} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {phone.trim() && !phoneOk ? <p className="mt-1 text-xs text-destructive">{t('settings.seller.phoneInvalid')}</p> : null}
        </Field>
        <Field label={t('professional.whatsapp')}>
          <input className={inputClass} type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </Field>
        <Field label={t('professional.website')}>
          <input className={inputClass} type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
        </Field>
        <Field label={t('professional.categories')}>
          <input className={inputClass} value={categories} onChange={(e) => setCategories(e.target.value)} placeholder={t('professional.listHint')} />
        </Field>
        <Field label={t('professional.brands')}>
          <input className={inputClass} value={brands} onChange={(e) => setBrands(e.target.value)} placeholder={t('professional.listHint')} />
        </Field>
      </div>

      <Field label={t('professional.about')}>
        <textarea className={inputClass} rows={4} maxLength={2000} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>

      <fieldset className="space-y-2">
        <legend className={labelClass}>{t('professional.priceList')}</legend>
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-[1fr_8rem_auto] gap-2">
            <input
              className={inputClass}
              value={item.title}
              maxLength={100}
              placeholder={t('professional.serviceTitle')}
              aria-label={t('professional.serviceTitle')}
              onChange={(e) => setItems(items.map((it, i) => (i === index ? { ...it, title: e.target.value } : it)))}
            />
            <input
              className={inputClass}
              type="number"
              min={0}
              value={item.price}
              placeholder={t('professional.priceFromShort')}
              aria-label={t('professional.priceFromShort')}
              onChange={(e) => setItems(items.map((it, i) => (i === index ? { ...it, price: e.target.value } : it)))}
            />
            <button
              type="button"
              className="rounded-lg border border-border px-3 text-sm hover:bg-accent"
              onClick={() => setItems(items.filter((_, i) => i !== index))}
              aria-label={t('professional.remove')}
            >
              ×
            </button>
          </div>
        ))}
        {items.length < 30 ? (
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold hover:bg-accent"
            onClick={() => setItems([...items, { title: '', price: '' }])}
          >
            + {t('professional.addService')}
          </button>
        ) : null}
      </fieldset>

      {existing ? (
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> {t('professional.accepting')}
        </label>
      ) : null}

      <SaveBar
        pending={save.isPending}
        error={save.error?.message}
        saved={saved}
        label={existing ? t('professional.save') : t('professional.create')}
      />
      {existing ? (
        <p className="text-sm">
          <Link to={`/services/${existing.slug ?? existing.id}`} className="font-semibold text-primary hover:underline">
            {t('professional.viewPublic')}
          </Link>
        </p>
      ) : null}
    </form>
  );
}

/** Dashboard page where a user registers (and later edits) their specialist profile or service center. */
export function ProfessionalProfilePage() {
  const { t } = useTranslation('dashboard');
  const { specialist, serviceCenter, isLoading } = useMyProfessional();
  const [kind, setKind] = useState<Kind | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <DashboardHeader title={t('professional.pageTitle')} subtitle={t('professional.pageSubtitle')} />
        <CardWrapper className="py-16 text-center text-muted-foreground">{t('listings.loading')}</CardWrapper>
      </div>
    );
  }

  const active: Kind | null = kind ?? (specialist ? 'specialist' : serviceCenter ? 'center' : null);
  const has = (k: Kind) => (k === 'specialist' ? Boolean(specialist) : Boolean(serviceCenter));

  return (
    <div className="space-y-8">
      <DashboardHeader title={t('professional.pageTitle')} subtitle={t('professional.pageSubtitle')} />

      <div className="flex flex-wrap gap-2" role="tablist">
        {(['specialist', 'center'] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={active === k}
            onClick={() => setKind(k)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              active === k ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-accent'
            }`}
          >
            {t(`professional.kind.${k}`)}
            {has(k) ? ' ✓' : ''}
          </button>
        ))}
      </div>

      {active === null ? (
        <CardWrapper className="p-6 text-sm text-muted-foreground">{t('professional.choose')}</CardWrapper>
      ) : (
        <CardWrapper className="space-y-4 p-5 sm:p-6">
          <p className="text-sm text-muted-foreground">{t(`professional.intro.${active}`)}</p>
          {active === 'specialist' ? (
            <SpecialistForm existing={specialist} />
          ) : (
            <CenterForm existing={serviceCenter} />
          )}
        </CardWrapper>
      )}
    </div>
  );
}
