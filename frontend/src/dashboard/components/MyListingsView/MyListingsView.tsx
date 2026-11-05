import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, Heart, MessageSquare, Plus } from 'lucide-react';

import type { ListingKind, MyListing } from '@/dashboard/api/listings.api';
import { useListingActions, useMyListings } from '@/dashboard/hooks/useMyListings';
import { DashboardHeader } from '@/dashboard/components/DashboardHeader/DashboardHeader';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { formatPrice } from '@/lib/format';
import { resolveMediaUrl } from '@/lib/mediaUrl';

type Props = {
  kind: ListingKind;
  /** i18n key group inside the `dashboard` namespace. */
  section: 'vehicles' | 'parts' | 'services';
};

const STATUS_STYLES: Record<MyListing['status'], string> = {
  ACTIVE: 'bg-emerald-500/15 text-emerald-600',
  DRAFT: 'bg-amber-500/15 text-amber-600',
  SOLD: 'bg-muted text-muted-foreground',
};

const publicPath = (l: MyListing): string | null => {
  if (!l.itemId) return null;
  if (l.kind === 'vehicle') return `/vehicles/${l.itemId}`;
  if (l.kind === 'part') return `/parts/${l.itemId}`;
  return null;
};

type ActionButtonProps = {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
};

const ActionButton = ({ children, onClick, disabled, danger }: ActionButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:bg-accent disabled:opacity-50 ${
      danger ? 'border-destructive/40 text-destructive' : 'border-border text-foreground'
    }`}
  >
    {children}
  </button>
);

export function MyListingsView({ kind, section }: Props) {
  const { t } = useTranslation('dashboard');
  const { items, isLoading, error } = useMyListings(kind);
  const actions = useListingActions();
  const busy = Object.values(actions).some((m) => m.isPending);
  const actionError =
    actions.publish.error ??
    actions.unpublish.error ??
    actions.close.error ??
    actions.remove.error;

  const confirmRemove = (l: MyListing) => {
    if (window.confirm(t('listings.confirmDelete', { title: l.title }))) {
      actions.remove.mutate(l.id);
    }
  };

  return (
    <div className="space-y-8">
      <DashboardHeader title={t(`${section}.title`)} subtitle={t(`${section}.subtitle`)} />

      <div className="flex justify-end">
        <Link
          to="/add"
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90"
        >
          <Plus size={16} aria-hidden="true" />
          {t('listings.add')}
        </Link>
      </div>

      {isLoading ? (
        <CardWrapper className="py-16 text-center text-muted-foreground">
          {t('listings.loading')}
        </CardWrapper>
      ) : error ? (
        <CardWrapper className="py-16 text-center text-destructive">
          {t('listings.error')}: {error.message}
        </CardWrapper>
      ) : items.length === 0 ? (
        <CardWrapper className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground">{t(`${section}.empty`)}</p>
        </CardWrapper>
      ) : (
        <ul className="space-y-3">
          {items.map((l) => {
            const href = publicPath(l);
            const thumb = resolveMediaUrl(l.thumbnail);
            return (
              <li key={l.id}>
                <CardWrapper className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {thumb ? (
                      <img src={thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-foreground">{l.title}</h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[l.status]}`}
                      >
                        {t(`listings.status.${l.status}`)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatPrice(l.price, l.currency ?? 'AZN')}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span
                        className="inline-flex items-center gap-1"
                        title={t('listings.inquiries')}
                      >
                        <MessageSquare size={14} aria-hidden="true" /> {l.inquiriesCount}
                      </span>
                      <span
                        className="inline-flex items-center gap-1"
                        title={t('listings.favorites')}
                      >
                        <Heart size={14} aria-hidden="true" /> {l.favoritesCount}
                      </span>
                      {href && l.status !== 'DRAFT' ? (
                        <Link to={href} className="inline-flex items-center gap-1 hover:text-foreground">
                          <Eye size={14} aria-hidden="true" /> {t('listings.view')}
                        </Link>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    {l.status === 'DRAFT' ? (
                      <ActionButton disabled={busy} onClick={() => actions.publish.mutate(l.id)}>
                        {t('listings.publish')}
                      </ActionButton>
                    ) : null}
                    {l.status === 'ACTIVE' ? (
                      <>
                        <ActionButton disabled={busy} onClick={() => actions.close.mutate(l.id)}>
                          {t('listings.markSold')}
                        </ActionButton>
                        <ActionButton disabled={busy} onClick={() => actions.unpublish.mutate(l.id)}>
                          {t('listings.unpublish')}
                        </ActionButton>
                      </>
                    ) : null}
                    {l.status === 'SOLD' ? (
                      <ActionButton disabled={busy} onClick={() => actions.publish.mutate(l.id)}>
                        {t('listings.republish')}
                      </ActionButton>
                    ) : null}
                    <ActionButton danger disabled={busy} onClick={() => confirmRemove(l)}>
                      {t('listings.delete')}
                    </ActionButton>
                  </div>
                </CardWrapper>
              </li>
            );
          })}
        </ul>
      )}

      {actionError ? <p className="text-sm text-destructive">{actionError.message}</p> : null}
    </div>
  );
}
