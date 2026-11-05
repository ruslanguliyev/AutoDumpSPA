import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DashboardHeader } from '@/dashboard/components/DashboardHeader/DashboardHeader';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import {
  useMarkInquiryRead,
  useReceivedInquiries,
  useSentInquiries,
} from '@/features/inquiries/api/useInquiries';
import type { Inquiry } from '@/features/inquiries/api/inquiries.api';

type Tab = 'received' | 'sent';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

function InquiryCard({ inquiry, mode }: { inquiry: Inquiry; mode: Tab }) {
  const { t } = useTranslation('dashboard');
  const markRead = useMarkInquiryRead();
  const isNew = mode === 'received' && inquiry.status === 'NEW';

  return (
    <CardWrapper className={`p-4 ${isNew ? 'border-primary/50' : ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{inquiry.listingTitle}</h3>
        <span className="text-xs text-muted-foreground">{formatDate(inquiry.createdAt)}</span>
      </div>

      {mode === 'received' ? (
        <p className="mt-1 text-xs text-muted-foreground">
          {inquiry.fromName} · {inquiry.fromEmail}
          {inquiry.phone ? ` · ${inquiry.phone}` : ''}
        </p>
      ) : inquiry.phone ? (
        <p className="mt-1 text-xs text-muted-foreground">{inquiry.phone}</p>
      ) : null}

      <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{inquiry.message}</p>

      {isNew ? (
        <div className="mt-3 flex items-center gap-3">
          <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {t('inquiries.new')}
          </span>
          <button
            type="button"
            disabled={markRead.isPending}
            onClick={() => markRead.mutate(inquiry.id)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent disabled:opacity-50"
          >
            {t('inquiries.markRead')}
          </button>
        </div>
      ) : null}
    </CardWrapper>
  );
}

export function InquiriesPage() {
  const { t } = useTranslation('dashboard');
  const [tab, setTab] = useState<Tab>('received');
  const received = useReceivedInquiries();
  const sent = useSentInquiries();
  const active = tab === 'received' ? received : sent;
  const items = active.data ?? [];

  return (
    <div className="space-y-8">
      <DashboardHeader title={t('inquiries.title')} subtitle={t('inquiries.subtitle')} />

      <div className="flex gap-2" role="tablist">
        {(['received', 'sent'] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === key ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-accent'
            }`}
          >
            {t(`inquiries.tabs.${key}`)}
          </button>
        ))}
      </div>

      {active.isLoading ? (
        <CardWrapper className="py-16 text-center text-muted-foreground">
          {t('listings.loading')}
        </CardWrapper>
      ) : active.error ? (
        <CardWrapper className="py-16 text-center text-destructive">
          {t('listings.error')}: {active.error.message}
        </CardWrapper>
      ) : items.length === 0 ? (
        <CardWrapper className="py-16 text-center text-muted-foreground">
          {t(`inquiries.empty.${tab}`)}
        </CardWrapper>
      ) : (
        <ul className="space-y-3">
          {items.map((i) => (
            <li key={i.id}>
              <InquiryCard inquiry={i} mode={tab} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
