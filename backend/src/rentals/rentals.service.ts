import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ListingPurpose, ListingStatus, Prisma, RentalStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { normalizePhone } from '../sellers/sellers.service';
import { RentalTermsInput, RequestRentalInput } from './rental.types';

const TIME_ZONE = 'Asia/Baku';
const DAY_MS = 86_400_000;
const MAX_RENTAL_DAYS = 365;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_REQUESTS_PER_DAY = 10;

/** Today's date in the marketplace's time zone, as "YYYY-MM-DD". */
export function todayString(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(now);
}

/** Strict "YYYY-MM-DD" (a real calendar day) -> Date at UTC midnight. */
export function parseDay(value: string, field: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) {
    throw new BadRequestException(`${field} must be a date like 2026-12-31`);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new BadRequestException(`${field} is not a valid date`);
  }
  return date;
}

export const formatDay = (date: Date): string => date.toISOString().slice(0, 10);

/** Number of days in [start, end], both included. */
export const daysInclusive = (start: Date, end: Date): number =>
  Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;

const bookingInclude = {
  renter: { select: { fullName: true, email: true } },
  listing: {
    include: {
      seller: { select: { name: true, phone: true, showPhone: true, userId: true } },
      vehicles: { select: { id: true, imageUrls: true }, take: 1 },
    },
  },
} satisfies Prisma.RentalBookingInclude;

type BookingRow = Prisma.RentalBookingGetPayload<{ include: typeof bookingInclude }>;

@Injectable()
export class RentalsService {
  constructor(private readonly prisma: PrismaService) {}

  // ------------------------------------------------------------------ terms

  /** The owner of a rental listing sets the conditions (deposit, minimum days ...). */
  async setTerms(userId: string, listingId: string, input: RentalTermsInput) {
    const listing = await this.getOwnedListing(userId, listingId);
    if (listing.purpose !== ListingPurpose.RENT) {
      throw new BadRequestException('Rental terms can only be set on rental listings');
    }

    const minDays = input.minDays ?? 1;
    if (!Number.isInteger(minDays) || minDays < 1 || minDays > MAX_RENTAL_DAYS) {
      throw new BadRequestException(`minDays must be between 1 and ${MAX_RENTAL_DAYS}`);
    }
    const maxDays = input.maxDays ?? null;
    if (maxDays !== null && (!Number.isInteger(maxDays) || maxDays < minDays || maxDays > MAX_RENTAL_DAYS)) {
      throw new BadRequestException('maxDays must be at least minDays and at most 365');
    }
    const deposit = input.deposit ?? null;
    if (deposit !== null && !(deposit >= 0 && deposit <= 1_000_000)) {
      throw new BadRequestException('deposit must be zero or a positive amount');
    }
    const kmPerDay = input.kmPerDay ?? null;
    if (kmPerDay !== null && (!Number.isInteger(kmPerDay) || kmPerDay < 1 || kmPerDay > 5000)) {
      throw new BadRequestException('kmPerDay must be between 1 and 5000 (omit for unlimited)');
    }
    const minDriverAge = input.minDriverAge ?? null;
    if (minDriverAge !== null && (!Number.isInteger(minDriverAge) || minDriverAge < 16 || minDriverAge > 100)) {
      throw new BadRequestException('minDriverAge must be between 16 and 100');
    }

    const data = { deposit, minDays, maxDays, kmPerDay, minDriverAge };
    await this.prisma.rentalTerms.upsert({
      where: { listingId },
      create: { listingId, ...data },
      update: data,
    });
    return true;
  }

  // ------------------------------------------------------------ availability

  /** Days that cannot be booked: confirmed bookings and days blocked by the owner. */
  async availability(listingId: string, from?: string, to?: string) {
    const start = from ? parseDay(from, 'from') : parseDay(todayString(), 'from');
    const end = to ? parseDay(to, 'to') : new Date(start.getTime() + MAX_RENTAL_DAYS * DAY_MS);
    if (end < start) throw new BadRequestException('to must not be before from');

    const overlap = { startDate: { lte: end }, endDate: { gte: start } };
    const [bookings, blocks] = await Promise.all([
      this.prisma.rentalBooking.findMany({
        where: { listingId, status: RentalStatus.CONFIRMED, ...overlap },
        select: { startDate: true, endDate: true },
      }),
      this.prisma.rentalBlock.findMany({
        where: { listingId, ...overlap },
        select: { startDate: true, endDate: true },
      }),
    ]);
    return [
      ...bookings.map((b) => ({ startDate: formatDay(b.startDate), endDate: formatDay(b.endDate), reason: 'BOOKED' })),
      ...blocks.map((b) => ({ startDate: formatDay(b.startDate), endDate: formatDay(b.endDate), reason: 'BLOCKED' })),
    ].sort((a, b) => a.startDate.localeCompare(b.startDate));
  }

  private async hasConflict(
    tx: Prisma.TransactionClient | PrismaService,
    listingId: string,
    start: Date,
    end: Date,
    excludeBookingId?: string,
  ): Promise<boolean> {
    const overlap = { startDate: { lte: end }, endDate: { gte: start } };
    const [booked, blocked] = await Promise.all([
      tx.rentalBooking.count({
        where: {
          listingId,
          status: RentalStatus.CONFIRMED,
          ...overlap,
          ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
        },
      }),
      tx.rentalBlock.count({ where: { listingId, ...overlap } }),
    ]);
    return booked + blocked > 0;
  }

  // ---------------------------------------------------------------- bookings

  async request(renterId: string, input: RequestRentalInput) {
    const start = parseDay(input.startDate, 'startDate');
    const end = parseDay(input.endDate, 'endDate');
    if (start < parseDay(todayString(), 'today')) {
      throw new BadRequestException('startDate cannot be in the past');
    }
    if (end < start) throw new BadRequestException('endDate must not be before startDate');
    const days = daysInclusive(start, end);
    if (days > MAX_RENTAL_DAYS) {
      throw new BadRequestException(`A rental can be at most ${MAX_RENTAL_DAYS} days`);
    }

    const message = input.message?.trim() || null;
    if (message && message.length > MAX_MESSAGE_LENGTH) {
      throw new BadRequestException(`message must be at most ${MAX_MESSAGE_LENGTH} characters`);
    }
    const phone = normalizePhone(input.phone);

    const listing = await this.prisma.listing.findUnique({
      where: { id: input.listingId },
      include: {
        seller: { select: { userId: true } },
        rentalTerms: true,
        vehicles: { select: { currency: true }, take: 1 },
      },
    });
    if (!listing || listing.status !== ListingStatus.ACTIVE || listing.purpose !== ListingPurpose.RENT) {
      throw new NotFoundException('Rental listing not found');
    }
    if (listing.seller.userId === renterId) {
      throw new ForbiddenException('You cannot rent your own car');
    }
    const terms = listing.rentalTerms;
    if (!terms) throw new NotFoundException('Rental listing not found');
    if (days < terms.minDays) {
      throw new BadRequestException(`The minimum rental period is ${terms.minDays} day(s)`);
    }
    if (terms.maxDays && days > terms.maxDays) {
      throw new BadRequestException(`The maximum rental period is ${terms.maxDays} day(s)`);
    }

    if (await this.hasConflict(this.prisma, listing.id, start, end)) {
      throw new ConflictException('The car is not available for these dates');
    }

    const overlap = { startDate: { lte: end }, endDate: { gte: start } };
    const duplicate = await this.prisma.rentalBooking.count({
      where: {
        listingId: listing.id,
        renterId,
        status: { in: [RentalStatus.PENDING, RentalStatus.CONFIRMED] },
        ...overlap,
      },
    });
    if (duplicate > 0) {
      throw new ConflictException('You already have a request for these dates');
    }

    const recent = await this.prisma.rentalBooking.count({
      where: { renterId, createdAt: { gte: new Date(Date.now() - DAY_MS) } },
    });
    if (recent >= MAX_REQUESTS_PER_DAY) {
      throw new BadRequestException('Too many requests today, please try again tomorrow');
    }

    const pricePerDay = listing.price;
    const row = await this.prisma.rentalBooking.create({
      data: {
        listingId: listing.id,
        renterId,
        startDate: start,
        endDate: end,
        days,
        pricePerDay,
        totalPrice: pricePerDay.mul(days),
        deposit: terms.deposit,
        currency: listing.vehicles[0]?.currency ?? 'AZN',
        message,
        phone,
      },
      include: bookingInclude,
    });
    return this.toObject(row, renterId);
  }

  /** Owner confirms or declines a pending request. Confirming declines overlapping pending requests. */
  async decide(ownerUserId: string, bookingId: string, confirm: boolean) {
    const booking = await this.getBooking(bookingId);
    if (booking.listing.seller.userId !== ownerUserId) {
      throw new ForbiddenException('This is not a request for your car');
    }
    if (booking.status !== RentalStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be decided');
    }

    if (!confirm) {
      const declined = await this.prisma.rentalBooking.update({
        where: { id: bookingId },
        data: { status: RentalStatus.DECLINED, decidedAt: new Date() },
        include: bookingInclude,
      });
      return this.toObject(declined, ownerUserId);
    }

    const confirmed = await this.prisma.$transaction(
      async (tx) => {
        if (await this.hasConflict(tx, booking.listingId, booking.startDate, booking.endDate, bookingId)) {
          throw new ConflictException('These dates were booked or blocked in the meantime');
        }
        const updated = await tx.rentalBooking.update({
          where: { id: bookingId },
          data: { status: RentalStatus.CONFIRMED, decidedAt: new Date() },
          include: bookingInclude,
        });
        await tx.rentalBooking.updateMany({
          where: {
            listingId: booking.listingId,
            id: { not: bookingId },
            status: RentalStatus.PENDING,
            startDate: { lte: booking.endDate },
            endDate: { gte: booking.startDate },
          },
          data: { status: RentalStatus.DECLINED, decidedAt: new Date() },
        });
        return updated;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    return this.toObject(confirmed, ownerUserId);
  }

  /** The renter or the owner cancels a pending or confirmed booking that has not ended yet. */
  async cancel(userId: string, bookingId: string) {
    const booking = await this.getBooking(bookingId);
    const isOwner = booking.listing.seller.userId === userId;
    if (booking.renterId !== userId && !isOwner) {
      throw new ForbiddenException('This is not your booking');
    }
    if (booking.status !== RentalStatus.PENDING && booking.status !== RentalStatus.CONFIRMED) {
      throw new BadRequestException('This booking can no longer be cancelled');
    }
    if (booking.endDate < parseDay(todayString(), 'today')) {
      throw new BadRequestException('This rental is already over');
    }
    const cancelled = await this.prisma.rentalBooking.update({
      where: { id: bookingId },
      data: { status: RentalStatus.CANCELLED, decidedAt: new Date() },
      include: bookingInclude,
    });
    return this.toObject(cancelled, userId);
  }

  /** Requests for the cars of the current user, newest first. */
  async incoming(ownerUserId: string) {
    const rows = await this.prisma.rentalBooking.findMany({
      where: { listing: { seller: { userId: ownerUserId } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: bookingInclude,
    });
    return rows.map((r) => this.toObject(r, ownerUserId));
  }

  /** Bookings made by the current user, newest first. */
  async mine(renterId: string) {
    const rows = await this.prisma.rentalBooking.findMany({
      where: { renterId },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: bookingInclude,
    });
    return rows.map((r) => this.toObject(r, renterId));
  }

  async pendingCount(ownerUserId: string): Promise<number> {
    return this.prisma.rentalBooking.count({
      where: { status: RentalStatus.PENDING, listing: { seller: { userId: ownerUserId } } },
    });
  }

  // ------------------------------------------------------------------ blocks

  async blocks(userId: string, listingId: string) {
    await this.getOwnedListing(userId, listingId);
    const rows = await this.prisma.rentalBlock.findMany({
      where: { listingId },
      orderBy: { startDate: 'asc' },
    });
    return rows.map((b) => this.blockObject(b));
  }

  async addBlock(userId: string, listingId: string, startDate: string, endDate: string, noteRaw?: string) {
    const listing = await this.getOwnedListing(userId, listingId);
    if (listing.purpose !== ListingPurpose.RENT) {
      throw new BadRequestException('Dates can only be blocked on rental listings');
    }
    const start = parseDay(startDate, 'startDate');
    const end = parseDay(endDate, 'endDate');
    if (end < start) throw new BadRequestException('endDate must not be before startDate');
    if (daysInclusive(start, end) > MAX_RENTAL_DAYS) {
      throw new BadRequestException(`A block can be at most ${MAX_RENTAL_DAYS} days`);
    }
    const note = noteRaw?.trim() || null;
    if (note && note.length > 200) throw new BadRequestException('note must be at most 200 characters');

    const confirmed = await this.prisma.rentalBooking.count({
      where: {
        listingId,
        status: RentalStatus.CONFIRMED,
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });
    if (confirmed > 0) {
      throw new ConflictException('A confirmed booking exists in this period: cancel it first');
    }

    const row = await this.prisma.rentalBlock.create({
      data: { listingId, startDate: start, endDate: end, note },
    });
    return this.blockObject(row);
  }

  async removeBlock(userId: string, blockId: string): Promise<boolean> {
    const block = await this.prisma.rentalBlock.findUnique({
      where: { id: blockId },
      include: { listing: { include: { seller: { select: { userId: true } } } } },
    });
    if (!block) throw new NotFoundException('Block not found');
    if (block.listing.seller.userId !== userId) throw new ForbiddenException('This is not your listing');
    await this.prisma.rentalBlock.delete({ where: { id: blockId } });
    return true;
  }

  // ----------------------------------------------------------------- helpers

  private async getOwnedListing(userId: string, listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: { select: { userId: true } } },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.seller.userId !== userId) throw new ForbiddenException('You do not own this listing');
    return listing;
  }

  private async getBooking(id: string): Promise<BookingRow> {
    const booking = await this.prisma.rentalBooking.findUnique({ where: { id }, include: bookingInclude });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  private blockObject(b: { id: string; listingId: string; startDate: Date; endDate: Date; note: string | null }) {
    return {
      id: b.id,
      listingId: b.listingId,
      startDate: formatDay(b.startDate),
      endDate: formatDay(b.endDate),
      note: b.note,
    };
  }

  /** `viewerId` decides which contact details are included. */
  private toObject(row: BookingRow, viewerId: string) {
    const viewerIsOwner = row.listing.seller.userId === viewerId;
    const sellerPhoneVisible = row.status === RentalStatus.CONFIRMED || row.listing.seller.showPhone;
    return {
      id: row.id,
      listingId: row.listingId,
      listingTitle: row.listing.title,
      vehicleId: row.listing.vehicles[0]?.id ?? null,
      thumbnail: row.listing.vehicles[0]?.imageUrls?.[0] ?? null,
      startDate: formatDay(row.startDate),
      endDate: formatDay(row.endDate),
      days: row.days,
      pricePerDay: Number(row.pricePerDay),
      totalPrice: Number(row.totalPrice),
      deposit: row.deposit === null ? null : Number(row.deposit),
      currency: row.currency,
      message: row.message,
      phone: viewerIsOwner || row.renterId === viewerId ? row.phone : null,
      status: row.status,
      createdAt: row.createdAt,
      decidedAt: row.decidedAt,
      renterName: row.renter.fullName,
      renterEmail: viewerIsOwner ? row.renter.email : null,
      sellerName: row.listing.seller.name,
      sellerPhone: !viewerIsOwner && sellerPhoneVisible ? row.listing.seller.phone : null,
    };
  }
}
