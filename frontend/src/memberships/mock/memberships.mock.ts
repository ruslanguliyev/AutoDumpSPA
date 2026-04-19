import type { SpecialistServiceMembership } from '@/memberships/types/membership.types';

export const MEMBERSHIPS: SpecialistServiceMembership[] = [
  {
    id: 'mem-001',
    specialistId: 'spec-001',
    serviceId: '1',
    role: 'owner',
    isPrimary: true,
  },
  {
    id: 'mem-002',
    specialistId: 'spec-002',
    serviceId: '2',
    role: 'owner',
    isPrimary: true,
  },
  {
    id: 'mem-003',
    specialistId: 'spec-003',
    serviceId: '6',
    role: 'employee',
    isPrimary: true,
  },
  {
    id: 'mem-004',
    specialistId: 'spec-004',
    serviceId: '3',
    role: 'owner',
    isPrimary: true,
  },
  {
    id: 'mem-005',
    specialistId: 'spec-005',
    serviceId: '4',
    role: 'employee',
    isPrimary: true,
  },
  {
    id: 'mem-006',
    specialistId: 'spec-006',
    serviceId: '1',
    role: 'employee',
    isPrimary: false,
  },
  {
    id: 'mem-007',
    specialistId: 'spec-006',
    serviceId: '5',
    role: 'employee',
    isPrimary: true,
  },
];
