import { gqlRequest } from '@/lib/graphql';

export type RentalStatus = 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'CANCELLED';

export type RentalBooking = {
  id: string;
  listingId: string;
  listingTitle: string;
  vehicleId: string | null;
  thumbnail: string | null;
  startDate: string;
  endDate: string;
  days: number;
  pricePerDay: number;
  totalPrice: number;
  deposit: number | null;
  currency: string;
  message: string | null;
  phone: string | null;
  status: RentalStatus;
  createdAt: string;
  decidedAt: string | null;
  renterName: string;
  renterEmail: string | null;
  sellerName: string;
  sellerPhone: string | null;
};

export type UnavailableRange = {
  startDate: string;
  endDate: string;
  reason: 'BOOKED' | 'BLOCKED';
};

export type RentalBlock = {
  id: string;
  listingId: string;
  startDate: string;
  endDate: string;
  note: string | null;
};

const BOOKING_FIELDS = `
  id listingId listingTitle vehicleId thumbnail startDate endDate days pricePerDay totalPrice
  deposit currency message phone status createdAt decidedAt renterName renterEmail sellerName sellerPhone
`;

export const rentalsApi = {
  availability: (listingId: string, from?: string, to?: string) =>
    gqlRequest<{ rentalAvailability: UnavailableRange[] }>(
      `query($listingId: String!, $from: String, $to: String) {
        rentalAvailability(listingId: $listingId, from: $from, to: $to) { startDate endDate reason }
      }`,
      { listingId, from, to },
    ).then((d) => d.rentalAvailability),

  request: (input: { listingId: string; startDate: string; endDate: string; message?: string; phone?: string }) =>
    gqlRequest<{ requestRental: RentalBooking }>(
      `mutation($input: RequestRentalInput!) { requestRental(input: $input) { ${BOOKING_FIELDS} } }`,
      { input },
    ).then((d) => d.requestRental),

  decide: (id: string, confirm: boolean) =>
    gqlRequest<{ decideRental: RentalBooking }>(
      `mutation($id: String!, $confirm: Boolean!) { decideRental(id: $id, confirm: $confirm) { ${BOOKING_FIELDS} } }`,
      { id, confirm },
    ).then((d) => d.decideRental),

  cancel: (id: string) =>
    gqlRequest<{ cancelRental: RentalBooking }>(
      `mutation($id: String!) { cancelRental(id: $id) { ${BOOKING_FIELDS} } }`,
      { id },
    ).then((d) => d.cancelRental),

  incoming: () =>
    gqlRequest<{ incomingRentals: RentalBooking[] }>(`query { incomingRentals { ${BOOKING_FIELDS} } }`).then(
      (d) => d.incomingRentals,
    ),

  mine: () =>
    gqlRequest<{ myRentals: RentalBooking[] }>(`query { myRentals { ${BOOKING_FIELDS} } }`).then((d) => d.myRentals),

  pendingCount: () =>
    gqlRequest<{ pendingRentalRequestsCount: number }>(`query { pendingRentalRequestsCount }`).then(
      (d) => d.pendingRentalRequestsCount,
    ),

  blocks: (listingId: string) =>
    gqlRequest<{ rentalBlocks: RentalBlock[] }>(
      `query($listingId: String!) { rentalBlocks(listingId: $listingId) { id listingId startDate endDate note } }`,
      { listingId },
    ).then((d) => d.rentalBlocks),

  addBlock: (listingId: string, startDate: string, endDate: string, note?: string) =>
    gqlRequest<{ addRentalBlock: RentalBlock }>(
      `mutation($listingId: String!, $startDate: String!, $endDate: String!, $note: String) {
        addRentalBlock(listingId: $listingId, startDate: $startDate, endDate: $endDate, note: $note) {
          id listingId startDate endDate note
        }
      }`,
      { listingId, startDate, endDate, note },
    ).then((d) => d.addRentalBlock),

  removeBlock: (id: string) =>
    gqlRequest(`mutation($id: String!) { removeRentalBlock(id: $id) }`, { id }),
};

/** "YYYY-MM-DD" of today in the marketplace's time zone (Baku). */
export const todayString = (): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Baku' }).format(new Date());

const DAY_MS = 86_400_000;
const toTime = (day: string) => new Date(`${day}T00:00:00Z`).getTime();

/** Number of days in [start, end], both included. Returns 0 for invalid or reversed ranges. */
export const daysInclusive = (start: string, end: string): number => {
  if (!start || !end) return 0;
  const n = Math.round((toTime(end) - toTime(start)) / DAY_MS) + 1;
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/** Do the two inclusive ranges share at least one day? */
export const rangesOverlap = (aStart: string, aEnd: string, bStart: string, bEnd: string): boolean =>
  aStart <= bEnd && bStart <= aEnd;
