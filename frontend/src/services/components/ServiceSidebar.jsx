import ServiceStatus from './ServiceStatus';
import OpeningHours from './OpeningHours';
import ServiceContacts from './ServiceContacts';
import { AppointmentRequestCard } from '@/features/appointments/components/AppointmentRequestCard';
import { getCurrentDaySchedule, isServiceOpen } from '@/services/utils/serviceSchedule.utils';

export default function ServiceSidebar({ serviceId, accepting = true, schedule, contacts, location }) {
  const todaySchedule = schedule ? getCurrentDaySchedule(schedule) : null;
  const isOpen = schedule ? isServiceOpen(schedule) : false;

  return (
    <div className="service-detail-page__sidebar space-y-6 lg:sticky lg:top-6 lg:self-start">
      <AppointmentRequestCard targetType="SERVICE_CENTER" targetId={serviceId} accepting={accepting} />
      <ServiceStatus
        isOpen={isOpen}
        todaySchedule={todaySchedule}
        contacts={contacts}
      />
      <OpeningHours schedule={schedule} />
      <ServiceContacts location={location} contacts={contacts} />
    </div>
  );
}
