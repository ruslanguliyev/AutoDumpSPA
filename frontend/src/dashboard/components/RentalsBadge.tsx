import { usePendingRentalRequestsCount } from '@/features/rentals/hooks/useRentals';

/** Number of rental requests waiting for the owner's decision, shown next to the "Rentals" nav item. */
export function RentalsBadge() {
  const { data } = usePendingRentalRequestsCount();
  if (!data) return null;
  return (
    <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold leading-5 text-primary-foreground">
      {data > 99 ? '99+' : data}
    </span>
  );
}
