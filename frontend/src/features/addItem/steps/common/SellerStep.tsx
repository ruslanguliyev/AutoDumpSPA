import { useTranslation } from 'react-i18next';

import { useAddItemStore } from '@/features/addItem/store/useAddItemStore';

const inputClass =
  'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const SellerStep = () => {
  const { t } = useTranslation('addItem');
  const draft = useAddItemStore((state) => state.draft);
  const setSellerField = useAddItemStore((state) => state.setSellerField);

  if (!draft) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow)]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">{t('form.sellerTitle')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('form.sellerHint')}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`rounded-full px-4 py-2 text-xs font-semibold ${
            draft.seller.type === 'private'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
          onClick={() => setSellerField('type', 'private')}
        >
          {t('form.privateSeller')}
        </button>
        <button
          type="button"
          className={`rounded-full px-4 py-2 text-xs font-semibold ${
            draft.seller.type === 'dealer'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
          onClick={() => setSellerField('type', 'dealer')}
        >
          {t('form.dealer')}
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.name')}
          </label>
          <input
            className={inputClass}
            placeholder={t('form.sellerNamePlaceholder')}
            value={draft.seller.name}
            onChange={(event) => setSellerField('name', event.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.phone')}
          </label>
          <input
            className={inputClass}
            placeholder={t('form.phonePlaceholder')}
            value={draft.seller.phone}
            onChange={(event) => setSellerField('phone', event.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.email')}
          </label>
          <input
            className={inputClass}
            placeholder={t('form.emailPlaceholder')}
            value={draft.seller.email}
            onChange={(event) => setSellerField('email', event.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.location')}
          </label>
          <input
            className={inputClass}
            placeholder={t('form.locationPlaceholder')}
            value={draft.seller.location}
            onChange={(event) => setSellerField('location', event.target.value)}
          />
        </div>
      </div>

      <label className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-3 text-sm">
        <input
          type="checkbox"
          className="h-4 w-4 accent-primary"
          checked={draft.seller.showPhone}
          onChange={(event) => setSellerField('showPhone', event.target.checked)}
        />
        {t('form.showPhoneOnListing')}
      </label>
    </div>
  );
};

export default SellerStep;
