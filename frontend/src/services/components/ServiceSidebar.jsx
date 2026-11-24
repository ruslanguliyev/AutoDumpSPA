import ServiceStatus from './ServiceStatus';
import OpeningHours from './OpeningHours';
import ServiceContacts from './ServiceContacts';
import { AppointmentRequestCard } from '@/features/appointments/components/AppointmentRequestCard';
import {
  getCurrentDaySchedule,
  isServiceOpen,
  normalizeServiceSchedule,
} from '@/services/utils/serviceSchedule.utils';

export default function ServiceSidebar({
  serviceId,
  accepting = true,
  schedule,
  contacts,
  location,
  barCarriesContacts = false,
}) {
  const normalized = normalizeServiceSchedule(schedule);
  const todaySchedule = normalized ? getCurrentDaySchedule(normalized) : null;
  const isOpen = normalized ? isServiceOpen(normalized) : false;

  return (
    <div className="flex flex-col gap-4">
      <ServiceStatus
        isOpen={isOpen}
        todaySchedule={todaySchedule}
        contacts={contacts}
        hasSchedule={Boolean(normalized)}
        barCarriesContacts={barCarriesContacts}
      />
      <OpeningHours schedule={normalized} />
      <ServiceContacts location={location} contacts={contacts} />
      <div id="service-booking" className="scroll-mt-24">
        <AppointmentRequestCard targetType="SERVICE_CENTER" targetId={serviceId} accepting={accepting} />
      </div>
    </div>
  );
}
