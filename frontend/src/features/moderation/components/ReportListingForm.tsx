import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Flag } from 'lucide-react';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { moderationApi, REPORT_REASONS } from '@/features/moderation/api/moderation.api';
import type { ReportReason } from '@/features/moderation/api/moderation.api';
import { mapSubmitError } from '@/lib/formSubmitError';
import { ReportDialog } from '@/shared/blocks/ReportDialog';

type Props = {
  /** Listing being reported. When missing (e.g. mock data) nothing is rendered. */
  listingId?: string | null;
  className?: string;
};

/** Thin wrapper: auth + API around shared `ReportDialog`. */
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
    onSuccess: () => setOpen(false),
  });

  if (!listingId) return null;

  const reportError = report.isError
    ? /already reported/i.test(report.error instanceof Error ? report.error.message : '')
      ? { message: t('report.alreadyReported'), showLoginLink: false as const }
      : mapSubmitError(report.error, {
          network: t('contact.errors.network'),
          generic: t('contact.errors.generic'),
          loginRequired: t('contact.errors.loginToSend'),
        })
    : null;

  const reasonOptions = REPORT_REASONS.map((value) => ({
    value,
    label: t(`report.reasons.${value}`),
  }));

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        state={{ from: location }}
        className={`inline-flex min-h-11 items-center gap-2 text-[13px] font-medium text-muted-foreground transition hover:text-foreground ${className}`.trim()}
      >
        <Flag size={14} strokeWidth={1.5} aria-hidden="true" />
        {t('report.loginToReport')}
      </Link>
    );
  }

  return (
    <div className={className}>
      {report.isSuccess ? (
        <p className="text-[13px] font-medium text-foreground" role="status">
          {t('report.thanks')}
        </p>
      ) : (
        <ReportDialog
          open={open}
          onOpenChange={setOpen}
          reasonOptions={reasonOptions}
          reason={reason}
          onReasonChange={(value) => setReason(value as ReportReason)}
          details={details}
          onDetailsChange={setDetails}
          onSubmit={() => report.mutate()}
          pending={report.isPending}
          error={reportError?.message ?? null}
        />
      )}
    </div>
  );
}

export default ReportListingForm;
