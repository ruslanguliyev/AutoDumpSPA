import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Flag, X } from 'lucide-react';

import Button from '@/shared/ui/button';
import { Select } from '@/shared/ui/Select';
import { controlClass } from '@/shared/ui/controlClass';
import { FieldLabel } from '@/shared/ui/field';

export type ReportReasonOption = { value: string; label: string };

type ReportDialogProps = {
  reasonOptions: ReportReasonOption[];
  reason: string;
  onReasonChange: (value: string) => void;
  details: string;
  onDetailsChange: (value: string) => void;
  onSubmit: () => void;
  pending?: boolean;
  error?: string | null;
  successMessage?: string | null;
  /** When set, the trigger is not rendered — dialog is controlled by `open`. */
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  loginFallback?: ReactNode;
  className?: string;
};

/**
 * “Report listing” dialog — reason select + optional details (design/components.md).
 */
export function ReportDialog({
  reasonOptions,
  reason,
  onReasonChange,
  details,
  onDetailsChange,
  onSubmit,
  pending = false,
  error = null,
  successMessage = null,
  trigger,
  open: controlledOpen,
  onOpenChange,
  loginFallback = null,
  className = '',
}: ReportDialogProps) {
  const { t } = useTranslation('dashboard');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const titleId = useId();
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  if (successMessage) {
    return <p className={`text-[13px] text-muted-foreground ${className}`.trim()}>{successMessage}</p>;
  }

  if (loginFallback) {
    return <div className={className}>{loginFallback}</div>;
  }

  const onFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  const defaultTrigger = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="inline-flex min-h-11 items-center gap-2 text-[13px] font-medium text-muted-foreground transition hover:text-foreground"
    >
      <Flag size={14} strokeWidth={1.5} aria-hidden="true" />
      {t('report.open')}
    </button>
  );

  return (
    <div className={className}>
      {trigger ?? defaultTrigger}

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-black/50 open:flex open:items-center open:justify-center"
        onClose={() => setOpen(false)}
      >
        <form onSubmit={onFormSubmit} className="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between gap-3">
            <h2 id={titleId} className="text-[18px] font-semibold text-foreground">
              {t('report.title')}
            </h2>
            <Button
              type="button"
              variant="icon"
              size="icon"
              aria-label={t('report.cancel')}
              onClick={() => setOpen(false)}
            >
              <X size={20} strokeWidth={1.5} aria-hidden="true" />
            </Button>
          </div>

          <div className="mt-4 space-y-4">
            <Select
              label={t('report.reason')}
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              options={reasonOptions.map((option) => ({ value: option.value, label: option.label }))}
            />
            <div>
              <FieldLabel htmlFor="report-dialog-details">{t('report.details')}</FieldLabel>
              <textarea
                id="report-dialog-details"
                value={details}
                onChange={(e) => onDetailsChange(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder={t('report.detailsPlaceholder')}
                className={`${controlClass('md')} resize-y py-2.5`}
              />
            </div>
            {error ? (
              <p role="alert" className="text-[13px] text-destructive">
                {error}
              </p>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              type="submit"
              disabled={pending}
              className="min-w-[7rem] bg-destructive text-destructive-foreground hover:brightness-95"
            >
              {pending ? t('settings.saving') : t('report.submit')}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t('report.cancel')}
            </Button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

export default ReportDialog;
