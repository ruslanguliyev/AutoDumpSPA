import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { DashboardHeader } from '@/dashboard/components/DashboardHeader/DashboardHeader';
import { moderationApi } from '@/features/moderation/api/moderation.api';
import { VerificationPanel } from '@/features/moderation/components/VerificationPanel';
import type { Report, ReportStatus } from '@/features/moderation/api/moderation.api';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';

const TABS: ReportStatus[] = ['OPEN', 'ACTIONED', 'DISMISSED'];

const buttonClass =
  'rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:bg-accent disabled:opacity-50';

const publicPath = (r: Report): string | null => {
  if (!r.itemId) return null;
  if (r.kind === 'vehicle') return `/vehicles/${r.itemId}`;
  if (r.kind === 'part') return `/parts/${r.itemId}`;
  return null;
};

function ReportCard({ report, onChanged }: { report: Report; onChanged: () => void }) {
  const { t } = useTranslation('dashboard');
  const [blocking, setBlocking] = useState(false);
  const [reason, setReason] = useState('');

  const dismiss = useMutation({ mutationFn: () => moderationApi.dismiss(report.id), onSuccess: onChanged });
  const block = useMutation({
    mutationFn: () => moderationApi.block(report.listingId, reason.trim()),
    onSuccess: () => {
      setBlocking(false);
      onChanged();
    },
  });
  const unblock = useMutation({ mutationFn: () => moderationApi.unblock(report.listingId), onSuccess: onChanged });

  const href = publicPath(report);
  const busy = dismiss.isPending || block.isPending || unblock.isPending;
  const error = dismiss.error ?? block.error ?? unblock.error;

  return (
    <CardWrapper className="space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">{report.listingTitle}</h3>
          <p className="text-xs text-muted-foreground">
            {t('moderation.seller')}: {report.sellerName} · {t(`listings.status.${report.listingStatus}`)}
          </p>
        </div>
        <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
          {t(`report.reasons.${report.reason}`)}
        </span>
      </div>

      {report.details ? <p className="whitespace-pre-wrap text-sm text-foreground">{report.details}</p> : null}

      <p className="text-xs text-muted-foreground">
        {t('moderation.reportedBy', { email: report.reporterEmail })} · {new Date(report.createdAt).toLocaleString()}
        {report.status === 'OPEN' && report.openReportsForListing > 1
          ? ` · ${t('moderation.moreReports', { count: report.openReportsForListing - 1 })}`
          : ''}
      </p>

      {blocking ? (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-muted-foreground" htmlFor={`block-${report.id}`}>
            {t('moderation.blockReason')}
          </label>
          <textarea
            id={`block-${report.id}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            maxLength={500}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            placeholder={t('moderation.blockReasonPlaceholder')}
          />
          <div className="flex gap-2">
            <button
              type="button"
              className={`${buttonClass} border-destructive/40 text-destructive`}
              disabled={busy || reason.trim().length === 0}
              onClick={() => block.mutate()}
            >
              {t('moderation.confirmBlock')}
            </button>
            <button type="button" className={`${buttonClass} border-border`} onClick={() => setBlocking(false)}>
              {t('report.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {href ? (
            <Link to={href} className={`${buttonClass} border-border`}>
              {t('listings.view')}
            </Link>
          ) : null}
          {report.status === 'OPEN' ? (
            <>
              <button type="button" className={`${buttonClass} border-border`} disabled={busy} onClick={() => dismiss.mutate()}>
                {t('moderation.dismiss')}
              </button>
              {report.listingStatus !== 'BLOCKED' ? (
                <button type="button" className={`${buttonClass} border-destructive/40 text-destructive`} disabled={busy} onClick={() => setBlocking(true)}>
                  {t('moderation.block')}
                </button>
              ) : null}
            </>
          ) : null}
          {report.listingStatus === 'BLOCKED' ? (
            <button type="button" className={`${buttonClass} border-border`} disabled={busy} onClick={() => unblock.mutate()}>
              {t('moderation.unblock')}
            </button>
          ) : null}
        </div>
      )}

      {error ? <p role="alert" className="text-xs text-destructive">{error.message}</p> : null}
    </CardWrapper>
  );
}

export function ModerationPage() {
  const { t } = useTranslation('dashboard');
  const queryClient = useQueryClient();
  const [section, setSection] = useState<'reports' | 'verification'>('reports');
  const [tab, setTab] = useState<ReportStatus>('OPEN');
  const reports = useQuery({ queryKey: ['moderation', 'reports', tab], queryFn: () => moderationApi.reports(tab) });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['moderation'] });
  const items = reports.data ?? [];

  return (
    <div className="space-y-8">
      <DashboardHeader title={t('moderation.title')} subtitle={t('moderation.subtitle')} />

      <div className="flex gap-6 border-b border-border" role="tablist">
        {(['reports', 'verification'] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={section === key}
            onClick={() => setSection(key)}
            className={`-mb-px border-b-2 px-1 pb-3 text-sm font-semibold transition ${
              section === key ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(`moderation.sections.${key}`)}
          </button>
        ))}
      </div>

      {section === 'verification' ? <VerificationPanel /> : null}

      <div className={`flex flex-wrap gap-2 ${section === 'reports' ? '' : 'hidden'}`} role="tablist">
        {TABS.map((status) => (
          <button
            key={status}
            type="button"
            role="tab"
            aria-selected={tab === status}
            onClick={() => setTab(status)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === status ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-accent'
            }`}
          >
            {t(`moderation.tabs.${status}`)}
          </button>
        ))}
      </div>

      {section !== 'reports' ? null : reports.isLoading ? (
        <CardWrapper className="py-16 text-center text-muted-foreground">{t('listings.loading')}</CardWrapper>
      ) : reports.error ? (
        <CardWrapper className="py-16 text-center text-destructive">
          {/administrator|forbidden/i.test(reports.error.message) ? t('moderation.noAccess') : reports.error.message}
        </CardWrapper>
      ) : items.length === 0 ? (
        <CardWrapper className="py-16 text-center text-muted-foreground">{t(`moderation.empty.${tab}`)}</CardWrapper>
      ) : (
        <ul className="space-y-3">
          {items.map((report) => (
            <li key={report.id}>
              <ReportCard report={report} onChanged={refresh} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
