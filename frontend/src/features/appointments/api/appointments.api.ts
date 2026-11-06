import { gqlRequest } from '@/lib/graphql';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'CANCELLED';
export type AppointmentTargetType = 'SPECIALIST' | 'SERVICE_CENTER';

export type Appointment = {
  id: string;
  status: AppointmentStatus;
  date: string;
  time: string | null;
  vehicle: string | null;
  message: string | null;
  phone: string;
  targetType: AppointmentTargetType;
  targetId: string;
  targetName: string;
  targetSlug: string | null;
  targetPhone: string | null;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  decidedAt: string | null;
};

const FIELDS =
  'id status date time vehicle message phone targetType targetId targetName targetSlug targetPhone customerName customerEmail createdAt decidedAt';

export const appointmentsApi = {
  request: (input: {
    targetType: AppointmentTargetType;
    targetId: string;
    date: string;
    time?: string;
    vehicle?: string;
    message?: string;
    phone: string;
  }) =>
    gqlRequest<{ requestAppointment: Appointment }>(
      `mutation($input: RequestAppointmentInput!) { requestAppointment(input: $input) { ${FIELDS} } }`,
      { input },
    ).then((d) => d.requestAppointment),

  mine: () => gqlRequest<{ myAppointments: Appointment[] }>(`{ myAppointments { ${FIELDS} } }`).then((d) => d.myAppointments),

  incoming: () =>
    gqlRequest<{ incomingAppointments: Appointment[] }>(`{ incomingAppointments { ${FIELDS} } }`).then(
      (d) => d.incomingAppointments,
    ),

  pendingCount: () =>
    gqlRequest<{ pendingAppointmentsCount: number }>(`{ pendingAppointmentsCount }`).then(
      (d) => d.pendingAppointmentsCount,
    ),

  decide: (id: string, confirm: boolean) =>
    gqlRequest<{ decideAppointment: Appointment }>(
      `mutation($id: String!, $confirm: Boolean!) { decideAppointment(id: $id, confirm: $confirm) { ${FIELDS} } }`,
      { id, confirm },
    ).then((d) => d.decideAppointment),

  cancel: (id: string) =>
    gqlRequest<{ cancelAppointment: Appointment }>(
      `mutation($id: String!) { cancelAppointment(id: $id) { ${FIELDS} } }`,
      { id },
    ).then((d) => d.cancelAppointment),
};
