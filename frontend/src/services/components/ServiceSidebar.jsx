import ServiceStatus from './ServiceStatus';
import OpeningHours from './OpeningHours';
import ServiceContacts from './ServiceContacts';
import { AppointmentRequestCard } from '@/features/appointments/components/AppointmentRequestCard';
import { getCurrentDaySchedule, isServiceOpen } from '@/services/utils/serviceSchedule.utils';

export default function ServiceSidebar({ serviceId, accepting = true, schedule, contacts, location }) {
  const todaySchedule = schedule ? getCurrentDaySchedule(schedule) : null;
  const isOpen = schedule ? isServiceOpen(schedule) : false;

  return (
    <div className="flex flex-col gap-4">
      <ServiceStatus isOpen={isOpen} todaySchedule={todaySchedule} contacts={contacts} />
      <OpeningHours schedule={schedule} />
      <ServiceContacts location={location} contacts={contacts} />
      <div id="service-booking" className="scroll-mt-24">
        <AppointmentRequestCard targetType="SERVICE_CENTER" targetId={serviceId} accepting={accepting} />
      </div>
    </div>
  );
}
