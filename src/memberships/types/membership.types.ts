export type MembershipRole = 'owner' | 'employee';

export interface SpecialistServiceMembership {
  id: string;
  specialistId: string;
  serviceId: string;
  role: MembershipRole;
  isPrimary: boolean;
}
