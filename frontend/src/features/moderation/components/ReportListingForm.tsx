import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Flag } from 'lucide-react';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { moderationApi, REPORT_REASONS } from '@/features/moderation/api/moderation.api';
import type { ReportReason } from '@/features/moderation/api/moderation.api';

type Props = {
  /** Listing being reported. When missing (e.g. mock data) nothing is rendered. */
  listingId?: string | null;
  className?: string;
};

/** Collapsed "Report this listing" link that expands into a small form. */
export function ReportListingForm({ listingId, className = '' }: Props) {
  const { t } = useTranslation('dashboard');
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>('SPAM');
  const [details, setDetails] = useState('');

  const report = useMutation({
    mutationFn: () =>
      moderationApi.report({ listingId: listingId!, reason, details: details.trim() || undefined }),
  });

  if (!listingId) return null;

  const trigger =
    'inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition hover:text-destructive';

  if (report.isSuccess) {
    return <p className={`text-xs text-muted-foreground ${className}`}>{t('report.thanks')}</p>;
  }

  if (!isAuthenticated) {
    return (
      <Link to="/login" state={{ from: location }} className={`${trigger} ${className}`}>
        <Flag size={14} aria-hidden="true" />
        {t('report.loginToReport')}
      </Link>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={`${trigger} ${className}`}>
        <Flag size={14} aria-hidden="true" />
        {t('report.open')}
      </button>
    );
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    report.mutate();
  };

  return (
    <form onSubmit={onSubmit} className={`rounded-2xl border border-border bg-card p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-foreground">{t('report.title')}</h3>
      <label className="mt-3 block text-xs font-semibold text-muted-foreground" htmlFor="report-reason">
        {t('report.reason')}
      </label>
      <select
        id="report-reason"
        value={reason}
        onChange={(e) => setReason(e.target.value as ReportReason)}
        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
      >
        {REPORT_REASONS.map((value) => (
          <option key={value} value={value}>
            {t(`report.reasons.${value}`)}
          </option>
        ))}
      </select>
      <label className="mt-3 block text-xs font-semibold text-muted-foreground" htmlFor="report-details">
        {t('report.details')}
      </label>
      <textarea
        id="report-details"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        maxLength={1000}
        rows={3}
        placeholder={t('report.detailsPlaceholder')}
        className="mt-1 w-full resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm"
      />
      {report.isError ? (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {/already reported/i.test(report.error.message) ? t('report.alreadyReported') : report.error.message}
        </p>
      ) : null}
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={report.isPending}
          className="rounded-xl bg-destructive px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {report.isPending ? t('settings.saving') : t('report.submit')}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-accent"
        >
          {t('report.cancel')}
        </button>
      </div>
    </form>
  );
}

export default ReportListingForm;
