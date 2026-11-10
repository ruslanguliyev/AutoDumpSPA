import { todayString } from '@/features/rentals/api/rentals.api';
import { useIncomingAppointments } from '@/features/appointments/hooks/useAppointments';

/** Number of visit requests waiting for the owner's answer, shown next to the "Appointments" nav item. */
export function AppointmentsBadge() {
  const { data } = useIncomingAppointments();
  const today = todayString();
  const count = (data ?? []).filter((a) => a.status === 'PENDING' && a.date >= today).length;
  if (!count) return null;
  return (
    <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold leading-5 text-primary-foreground">
      {count > 99 ? '99+' : count}
    </span>
  );
}
