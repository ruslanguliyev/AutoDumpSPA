import { useReceivedInquiries } from '@/features/inquiries/api/useInquiries';

/** Unread-inquiries counter shown next to the "Inquiries" nav item. */
export function InquiriesBadge() {
  const { data } = useReceivedInquiries();
  const count = (data ?? []).filter((inquiry) => inquiry.status === 'NEW').length;
  if (!count) return null;
  return (
    <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold leading-5 text-primary-foreground">
      {count > 99 ? '99+' : count}
    </span>
  );
}
