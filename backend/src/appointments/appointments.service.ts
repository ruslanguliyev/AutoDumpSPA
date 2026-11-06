import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { formatDay, parseDay, todayString } from '../rentals/rentals.service';
import { ReviewTargetType } from '../reviews/review.types';
import { normalizePhone } from '../sellers/sellers.service';
import { AppointmentObject, RequestAppointmentInput } from './appointment.types';

const DAY_MS = 86_400_000;
const MAX_DAYS_AHEAD = 90;
const MAX_MESSAGE = 1000;
const MAX_VEHICLE = 100;
const MAX_REQUESTS_PER_DAY = 10;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const include = {
  customer: { select: { fullName: true, email: true } },
  specialist: { select: { id: true, userId: true, name: true, slug: true, phone: true } },
  serviceCenter: { select: { id: true, userId: true, name: true, slug: true, phone: true } },
} satisfies Prisma.AppointmentInclude;

type Row = Prisma.AppointmentGetPayload<{ include: typeof include }>;

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private toObject(row: Row): AppointmentObject {
    const specialist = row.specialist;
    const target = (specialist ?? row.serviceCenter)!;
    return {
      id: row.id,
      status: row.status,
      date: formatDay(row.date),
      time: row.time,
      vehicle: row.vehicle,
      message: row.message,
      phone: row.phone,
      targetType: specialist ? ReviewTargetType.SPECIALIST : ReviewTargetType.SERVICE_CENTER,
      targetId: target.id,
      targetName: target.name,
      targetSlug: target.slug,
      targetPhone: row.status === AppointmentStatus.CONFIRMED ? target.phone : null,
      customerName: row.customer.fullName,
      customerEmail: row.customer.email,
      createdAt: row.createdAt,
      decidedAt: row.decidedAt,
    };
  }

  /** The profile owner's user id, for either kind of target. */
  private ownerOf(row: Row): string {
    return (row.specialist ?? row.serviceCenter)!.userId;
  }

  async request(userId: string, input: RequestAppointmentInput): Promise<AppointmentObject> {
    if (input.targetType === ReviewTargetType.SELLER) {
      throw new BadRequestException('Appointments are for specialists and service centers');
    }

    const date = parseDay(input.date, 'date');
    const today = parseDay(todayString(), 'today');
    if (date < today) throw new BadRequestException('The date cannot be in the past');
    if (date.getTime() - today.getTime() > MAX_DAYS_AHEAD * DAY_MS) {
      throw new BadRequestException(`The date must be within ${MAX_DAYS_AHEAD} days`);
    }

    const time = (input.time ?? '').trim() || null;
    if (time && !TIME_PATTERN.test(time)) throw new BadRequestException('Time must look like 14:30');

    const phone = normalizePhone(input.phone);
    if (!phone) throw new BadRequestException('A phone number is required');

    const message = (input.message ?? '').trim();
    if (message.length > MAX_MESSAGE) throw new BadRequestException(`Message must be at most ${MAX_MESSAGE} characters`);
    const vehicle = (input.vehicle ?? '').trim();
    if (vehicle.length > MAX_VEHICLE) throw new BadRequestException(`Vehicle must be at most ${MAX_VEHICLE} characters`);

    const isSpecialist = input.targetType === ReviewTargetType.SPECIALIST;
    const column = isSpecialist ? 'specialistId' : 'serviceCenterId';
    const target = isSpecialist
      ? await this.prisma.specialist.findUnique({ where: { id: input.targetId }, select: { userId: true, available: true } })
      : await this.prisma.serviceCenter.findUnique({ where: { id: input.targetId }, select: { userId: true, isActive: true } });
    if (!target) throw new NotFoundException(isSpecialist ? 'Specialist not found' : 'Service center not found');
    if (target.userId === userId) throw new ForbiddenException('You cannot book yourself');
    const accepting = 'available' in target ? target.available : target.isActive;
    if (!accepting) throw new BadRequestException('This profile is not accepting appointments right now');

    const [open, recent] = await Promise.all([
      this.prisma.appointment.count({
        where: { customerId: userId, [column]: input.targetId, status: AppointmentStatus.PENDING },
      }),
      this.prisma.appointment.count({
        where: { customerId: userId, createdAt: { gte: new Date(Date.now() - DAY_MS) } },
      }),
    ]);
    if (open > 0) throw new ConflictException('You already have a pending request to this profile');
    if (recent >= MAX_REQUESTS_PER_DAY) throw new BadRequestException('Too many requests, try again tomorrow');

    const row = await this.prisma.appointment.create({
      data: {
        customerId: userId,
        [column]: input.targetId,
        date,
        time,
        vehicle: vehicle || null,
        message: message || null,
        phone,
      } as Prisma.AppointmentUncheckedCreateInput,
      include,
    });
    return this.toObject(row);
  }

  /** Appointments the signed-in user asked for. */
  async mine(userId: string): Promise<AppointmentObject[]> {
    const rows = await this.prisma.appointment.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
      include,
    });
    return rows.map((r) => this.toObject(r));
  }

  /** Appointments addressed to the user's own specialist profile and/or service center. */
  async incoming(userId: string): Promise<AppointmentObject[]> {
    const rows = await this.prisma.appointment.findMany({
      where: { OR: [{ specialist: { userId } }, { serviceCenter: { userId } }] },
      orderBy: [{ status: 'asc' }, { date: 'asc' }],
      include,
    });
    return rows.map((r) => this.toObject(r));
  }

  pendingCount(userId: string): Promise<number> {
    return this.prisma.appointment.count({
      where: {
        status: AppointmentStatus.PENDING,
        date: { gte: parseDay(todayString(), 'today') },
        OR: [{ specialist: { userId } }, { serviceCenter: { userId } }],
      },
    });
  }

  private async load(id: string): Promise<Row> {
    const row = await this.prisma.appointment.findUnique({ where: { id }, include });
    if (!row) throw new NotFoundException('Appointment not found');
    return row;
  }

  async decide(userId: string, id: string, confirm: boolean): Promise<AppointmentObject> {
    const row = await this.load(id);
    if (this.ownerOf(row) !== userId) throw new ForbiddenException('Only the profile owner can answer a request');
    if (row.status !== AppointmentStatus.PENDING) throw new BadRequestException('This request has already been answered');
    if (row.date < parseDay(todayString(), 'today')) throw new BadRequestException('This date has already passed');

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: confirm ? AppointmentStatus.CONFIRMED : AppointmentStatus.DECLINED, decidedAt: new Date() },
      include,
    });
    return this.toObject(updated);
  }

  /** The customer can withdraw a request; the owner can cancel a confirmed visit. */
  async cancel(userId: string, id: string): Promise<AppointmentObject> {
    const row = await this.load(id);
    if (row.customerId !== userId && this.ownerOf(row) !== userId) {
      throw new ForbiddenException('You cannot cancel this appointment');
    }
    if (row.status !== AppointmentStatus.PENDING && row.status !== AppointmentStatus.CONFIRMED) {
      throw new BadRequestException('This appointment can no longer be cancelled');
    }
    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CANCELLED, decidedAt: new Date() },
      include,
    });
    return this.toObject(updated);
  }
}
