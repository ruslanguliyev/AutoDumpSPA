import { useUnreadInquiriesCount } from '@/features/inquiries/api/useInquiries';

/** Unread-inquiries counter shown next to the "Inquiries" nav item. */
export function InquiriesBadge() {
  const { data } = useUnreadInquiriesCount();
  if (!data) return null;
  return (
    <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold leading-5 text-primary-foreground">
      {data > 99 ? '99+' : data}
    </span>
  );
}
