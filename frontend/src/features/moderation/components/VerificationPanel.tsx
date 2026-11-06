import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck } from 'lucide-react';

import { moderationApi } from '@/features/moderation/api/moderation.api';
import type { ProfileKind } from '@/features/moderation/api/moderation.api';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';

const KINDS: ProfileKind[] = ['SPECIALIST', 'SERVICE_CENTER', 'SELLER'];

const publicPath = (kind: ProfileKind, id: string, slug: string | null) => {
  if (kind === 'SPECIALIST') return slug ? `/specialists/${slug}` : null;
  if (kind === 'SERVICE_CENTER') return `/services/${slug ?? id}`;
  return `/sellers/${id}`;
};

/** Administrators mark trusted sellers, specialists and service centers as verified. */
export function VerificationPanel() {
  const { t } = useTranslation('dashboard');
  const queryClient = useQueryClient();
  const [kind, setKind] = useState<ProfileKind>('SPECIALIST');
  const [search, setSearch] = useState('');
  const term = useDebounce(search, 300);

  const profiles = useQuery({
    queryKey: ['moderation', 'profiles', kind, term],
    queryFn: () => moderationApi.profiles(kind, term),
    placeholderData: keepPreviousData,
  });
  const toggle = useMutation({
    mutationFn: ({ id, verified }: { id: string; verified: boolean }) => moderationApi.setVerified(kind, id, verified),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['moderation', 'profiles'] }),
  });

  const items = profiles.data ?? [];

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">{t('moderation.verification.hint')}</p>

      <div className="flex flex-wrap items-center gap-2">
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={kind === k}
            onClick={() => setKind(k)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              kind === k ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-accent'
            }`}
          >
            {t(`moderation.verification.kind.${k}`)}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('moderation.verification.search')}
          aria-label={t('moderation.verification.search')}
          className="ml-auto w-full rounded-xl border border-border bg-background px-3 py-2 text-sm sm:w-64"
        />
      </div>

      {profiles.isLoading ? (
        <CardWrapper className="py-16 text-center text-muted-foreground">{t('listings.loading')}</CardWrapper>
      ) : profiles.error ? (
        <CardWrapper className="py-16 text-center text-destructive">{profiles.error.message}</CardWrapper>
      ) : items.length === 0 ? (
        <CardWrapper className="py-16 text-center text-muted-foreground">{t('moderation.verification.empty')}</CardWrapper>
      ) : (
        <ul className="space-y-2">
          {items.map((p) => {
            const href = publicPath(kind, p.id, p.slug);
            return (
              <li key={p.id}>
                <CardWrapper className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <span className="truncate">{p.name}</span>
                      {p.verified ? <BadgeCheck size={16} className="shrink-0 text-emerald-600" aria-label={t('moderation.verification.verified')} /> : null}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.city} · ★ {p.rating.toFixed(1)} ({p.reviewsCount})
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {href ? (
                      <Link to={href} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent">
                        {t('listings.view')}
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      disabled={toggle.isPending}
                      onClick={() => toggle.mutate({ id: p.id, verified: !p.verified })}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:bg-accent disabled:opacity-50 ${
                        p.verified ? 'border-destructive/40 text-destructive' : 'border-emerald-500/50 text-emerald-600'
                      }`}
                    >
                      {p.verified ? t('moderation.verification.revoke') : t('moderation.verification.grant')}
                    </button>
                  </div>
                </CardWrapper>
              </li>
            );
          })}
        </ul>
      )}
      {toggle.error ? <p role="alert" className="text-xs text-destructive">{toggle.error.message}</p> : null}
    </div>
  );
}
