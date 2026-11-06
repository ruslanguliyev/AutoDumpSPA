import { formatDay, parseDay, todayString } from '../src/rentals/rentals.service';
import { createTestContext, TestContext } from './helpers';

/** "YYYY-MM-DD" for today + offset days, in the marketplace's time zone. */
const day = (offset: number): string => {
  const base = parseDay(todayString(), 'today');
  return formatDay(new Date(base.getTime() + offset * 86_400_000));
};

describe('car rental', () => {
  let ctx: TestContext;
  let owner: string;
  let renter: string;
  let other: string;

  beforeAll(async () => {
    ctx = await createTestContext();
    owner = await ctx.registerSeller('Rent owner', '+994 50 111 22 33');
    renter = await ctx.registerUser('Renter');
    other = await ctx.registerUser('Other renter');
  });
  afterAll(() => ctx.close());

  const REQUEST = `mutation($l: String!, $s: String!, $e: String!, $m: String, $p: String) {
    requestRental(input: { listingId: $l, startDate: $s, endDate: $e, message: $m, phone: $p }) {
      id status days pricePerDay totalPrice deposit currency startDate endDate renterName renterEmail sellerPhone phone
    }
  }`;
  const DECIDE = `mutation($id: String!, $c: Boolean!) { decideRental(id: $id, confirm: $c) { id status } }`;
  const CANCEL = `mutation($id: String!) { cancelRental(id: $id) { id status } }`;
  const AVAILABILITY = `query($l: String!, $f: String, $t: String) { rentalAvailability(listingId: $l, from: $f, to: $t) { startDate endDate reason } }`;
  const TERMS = { deposit: 200, minDays: 2, maxDays: 10, kmPerDay: 300, minDriverAge: 21 };

  const car = (opts: Parameters<TestContext['createRentalListing']>[1] = {}) =>
    ctx.createRentalListing(owner, { terms: TERMS, publish: true, ...opts });

  describe('listing a car for rent', () => {
    it('creates rental listings only with terms and keeps them out of the sales catalogue', async () => {
      const draft = await ctx.createRentalListing(owner, { brand: 'CatalogRent' });
      const noTerms = await ctx.gql(`mutation($id: String!) { publishListing(id: $id) { status } }`, { id: draft.listingId }, owner);
      expect(noTerms.errors?.[0].message).toMatch(/rental terms/i);

      await ctx.gql(`mutation($l: String!) { setRentalTerms(listingId: $l, input: { minDays: 1 }) }`, { l: draft.listingId }, owner);
      expect((await ctx.gql(`mutation($id: String!) { publishListing(id: $id) { status } }`, { id: draft.listingId }, owner)).data.publishListing.status).toBe('ACTIVE');

      const sale = await ctx.createVehicleListing(owner, { brand: 'CatalogRent', publish: true });
      const q = (purpose: string) =>
        ctx.gql(`query($p: ListingPurpose) { vehicles(filter: { brand: "CatalogRent", purpose: $p }) { items { id purpose rental { minDays } } } }`, { p: purpose });

      const defaultSearch = await ctx.gql(`{ vehicles(filter: { brand: "CatalogRent" }) { items { id purpose } } }`);
      expect(defaultSearch.data.vehicles.items.map((v: any) => v.id)).toEqual([sale.vehicleId]);
      const rentSearch = await q('RENT');
      expect(rentSearch.data.vehicles.items).toEqual([{ id: draft.vehicleId, purpose: 'RENT', rental: { minDays: 1 } }]);
      expect((await q('SALE')).data.vehicles.items.map((v: any) => v.id)).toEqual([sale.vehicleId]);

      // a seller's own page lists everything, parts never include rentals
      const sellerId = (await ctx.gql('{ mySeller { id } }', undefined, owner)).data.mySeller.id;
      const both = await ctx.gql(`query($s: String!) { vehicles(filter: { sellerId: $s, brand: "CatalogRent" }) { total } }`, { s: sellerId });
      expect(both.data.vehicles.total).toBe(2);
      expect((await ctx.gql('{ myListings { id purpose } }', undefined, owner)).data.myListings.find((l: any) => l.id === draft.listingId).purpose).toBe('RENT');
    });

    it('validates the terms and only lets the owner of a rental listing set them', async () => {
      const rental = await ctx.createRentalListing(owner);
      const sale = await ctx.createVehicleListing(owner);
      const set = (listingId: string, input: object, token = owner) =>
        ctx.gql(`mutation($l: String!, $i: RentalTermsInput!) { setRentalTerms(listingId: $l, input: $i) }`, { l: listingId, i: input }, token);

      expect((await set(sale.listingId, { minDays: 1 })).errors?.[0].message).toMatch(/only be set on rental/i);
      expect((await set(rental.listingId, { minDays: 1 }, renter)).errors).toBeDefined();
      expect((await set(rental.listingId, { minDays: 0 })).errors?.[0].message).toMatch(/minDays/);
      expect((await set(rental.listingId, { minDays: 5, maxDays: 3 })).errors?.[0].message).toMatch(/maxDays/);
      expect((await set(rental.listingId, { deposit: -1 })).errors?.[0].message).toMatch(/deposit/);
      expect((await set(rental.listingId, { minDriverAge: 10 })).errors?.[0].message).toMatch(/minDriverAge/);
      expect((await set(rental.listingId, { minDays: 2, maxDays: 14, deposit: 100 })).data.setRentalTerms).toBe(true);
    });
  });

  describe('requesting a rental', () => {
    it('validates dates, rental length, ownership and contact details', async () => {
      const { listingId } = await car();
      const sale = await ctx.createVehicleListing(owner, { publish: true });
      const draft = await ctx.createRentalListing(owner, { terms: TERMS });

      const ask = (l: string, s: string, e: string, token = renter, extra: any = {}) =>
        ctx.gql(REQUEST, { l, s, e, ...extra }, token);

      expect((await ctx.gql(REQUEST, { l: listingId, s: day(5), e: day(7) })).errors).toBeDefined(); // anonymous
      expect((await ask(listingId, '2026-02-31', day(7))).errors?.[0].message).toMatch(/not a valid date/i);
      expect((await ask(listingId, 'tomorrow', day(7))).errors?.[0].message).toMatch(/must be a date/i);
      expect((await ask(listingId, day(-1), day(3))).errors?.[0].message).toMatch(/in the past/i);
      expect((await ask(listingId, day(7), day(5))).errors?.[0].message).toMatch(/must not be before/i);
      expect((await ask(listingId, day(5), day(5))).errors?.[0].message).toMatch(/minimum rental period is 2/i);
      expect((await ask(listingId, day(5), day(20))).errors?.[0].message).toMatch(/maximum rental period is 10/i);
      expect((await ask(listingId, day(5), day(7), owner)).errors?.[0].message).toMatch(/your own car/i);
      expect((await ask(sale.listingId, day(5), day(7))).errors?.[0].message).toMatch(/not found/i);
      expect((await ask(draft.listingId, day(5), day(7))).errors?.[0].message).toMatch(/not found/i);
      expect((await ask(listingId, day(5), day(7), renter, { p: 'abc' })).errors?.[0].message).toMatch(/invalid phone/i);
      expect((await ask(listingId, day(5), day(7), renter, { m: 'x'.repeat(1001) })).errors?.[0].message).toMatch(/at most 1000/i);
    });

    it('prices the booking per day, shows the owner who asked and hides the owner details from strangers', async () => {
      const { listingId } = await car({ pricePerDay: 80 });
      const res = await ctx.gql(REQUEST, { l: listingId, s: day(10), e: day(13), m: 'Need it for a trip', p: '+994 55 000 11 22' }, renter);
      expect(res.errors).toBeUndefined();
      expect(res.data.requestRental).toMatchObject({
        status: 'PENDING',
        days: 4,
        pricePerDay: 80,
        totalPrice: 320,
        deposit: 200,
        currency: 'AZN',
        startDate: day(10),
        endDate: day(13),
        renterEmail: null, // the renter does not get their own email echoed back as a "contact"
        sellerPhone: '+994 50 111 22 33',
      });

      const incoming = (await ctx.gql('{ incomingRentals { id status renterName renterEmail phone message } }', undefined, owner)).data.incomingRentals;
      const row = incoming.find((b: any) => b.id === res.data.requestRental.id);
      expect(row.renterEmail).toMatch(/@test\.local$/);
      expect(row.phone).toBe('+994 55 000 11 22');

      const mine = (await ctx.gql('{ myRentals { id renterEmail } }', undefined, renter)).data.myRentals;
      expect(mine.some((b: any) => b.id === res.data.requestRental.id)).toBe(true);
      expect((await ctx.gql('{ incomingRentals { id } }', undefined, other)).data.incomingRentals).toHaveLength(0);
      expect((await ctx.gql('{ myRentals { id } }', undefined, other)).data.myRentals).toHaveLength(0);
      expect((await ctx.gql('{ pendingRentalRequestsCount }', undefined, owner)).data.pendingRentalRequestsCount).toBeGreaterThanOrEqual(1);
    });

    it('does not accept two overlapping requests from the same person', async () => {
      const { listingId } = await car();
      expect((await ctx.gql(REQUEST, { l: listingId, s: day(20), e: day(23) }, renter)).errors).toBeUndefined();
      const again = await ctx.gql(REQUEST, { l: listingId, s: day(22), e: day(25) }, renter);
      expect(again.errors?.[0].message).toMatch(/already have a request/i);
      // somebody else may ask for the same dates: the owner decides
      expect((await ctx.gql(REQUEST, { l: listingId, s: day(22), e: day(25) }, other)).errors).toBeUndefined();
    });
  });

  describe('deciding and availability', () => {
    it('keeps pending requests open, blocks days on confirmation and declines competing requests', async () => {
      const { listingId } = await car();
      const first = (await ctx.gql(REQUEST, { l: listingId, s: day(30), e: day(33) }, renter)).data.requestRental.id;
      const competing = (await ctx.gql(REQUEST, { l: listingId, s: day(32), e: day(35) }, other)).data.requestRental.id;
      const later = (await ctx.gql(REQUEST, { l: listingId, s: day(40), e: day(42) }, other)).data.requestRental.id;

      expect((await ctx.gql(AVAILABILITY, { l: listingId })).data.rentalAvailability).toEqual([]); // pending blocks nothing
      expect((await ctx.gql(DECIDE, { id: first, c: true }, renter)).errors?.[0].message).toMatch(/not a request for your car/i);

      const confirmed = await ctx.gql(DECIDE, { id: first, c: true }, owner);
      expect(confirmed.data.decideRental.status).toBe('CONFIRMED');

      expect((await ctx.gql(AVAILABILITY, { l: listingId })).data.rentalAvailability).toEqual([
        { startDate: day(30), endDate: day(33), reason: 'BOOKED' },
      ]);
      const states = Object.fromEntries(
        (await ctx.gql('{ incomingRentals { id status } }', undefined, owner)).data.incomingRentals.map((b: any) => [b.id, b.status]),
      );
      expect(states[first]).toBe('CONFIRMED');
      expect(states[competing]).toBe('DECLINED'); // overlapped the confirmed booking
      expect(states[later]).toBe('PENDING'); // different dates: untouched

      expect((await ctx.gql(DECIDE, { id: first, c: false }, owner)).errors?.[0].message).toMatch(/only pending/i);
      expect((await ctx.gql(REQUEST, { l: listingId, s: day(33), e: day(36) }, renter)).errors?.[0].message).toMatch(/not available/i);
      expect((await ctx.gql(REQUEST, { l: listingId, s: day(34), e: day(36) }, renter)).errors).toBeUndefined();

      expect((await ctx.gql(DECIDE, { id: later, c: false }, owner)).data.decideRental.status).toBe('DECLINED');
    });

    it('shows the seller phone to the renter once the booking is confirmed, even if hidden publicly', async () => {
      const shy = await ctx.registerSeller('Shy owner', '+994 70 000 00 00');
      await ctx.gql(`mutation { updateSeller(input: { showPhone: false }) { id } }`, undefined, shy);
      const { listingId } = await ctx.createRentalListing(shy, { terms: TERMS, publish: true });

      const booking = (await ctx.gql(REQUEST, { l: listingId, s: day(50), e: day(52) }, renter)).data.requestRental;
      expect(booking.sellerPhone).toBeNull();
      await ctx.gql(DECIDE, { id: booking.id, c: true }, shy);
      const mine = (await ctx.gql('{ myRentals { id status sellerPhone } }', undefined, renter)).data.myRentals.find((b: any) => b.id === booking.id);
      expect(mine).toMatchObject({ status: 'CONFIRMED', sellerPhone: '+994 70 000 00 00' });
    });
  });

  describe('cancelling', () => {
    it('lets the renter or the owner cancel, frees the days and rejects strangers', async () => {
      const { listingId } = await car();
      const booking = (await ctx.gql(REQUEST, { l: listingId, s: day(60), e: day(63) }, renter)).data.requestRental.id;
      await ctx.gql(DECIDE, { id: booking, c: true }, owner);
      expect((await ctx.gql(AVAILABILITY, { l: listingId })).data.rentalAvailability).toHaveLength(1);

      expect((await ctx.gql(CANCEL, { id: booking }, other)).errors?.[0].message).toMatch(/not your booking/i);
      expect((await ctx.gql(CANCEL, { id: booking }, renter)).data.cancelRental.status).toBe('CANCELLED');
      expect((await ctx.gql(AVAILABILITY, { l: listingId })).data.rentalAvailability).toEqual([]);
      expect((await ctx.gql(CANCEL, { id: booking }, renter)).errors?.[0].message).toMatch(/no longer be cancelled/i);

      const second = (await ctx.gql(REQUEST, { l: listingId, s: day(60), e: day(63) }, other)).data.requestRental.id;
      await ctx.gql(DECIDE, { id: second, c: true }, owner);
      expect((await ctx.gql(CANCEL, { id: second }, owner)).data.cancelRental.status).toBe('CANCELLED');
    });
  });

  describe('owner blocked days and availability search', () => {
    it('lets the owner block and unblock days, which then cannot be booked', async () => {
      const { listingId } = await car();
      const add = (s: string, e: string, token = owner, note = 'In service') =>
        ctx.gql(`mutation($l: String!, $s: String!, $e: String!, $n: String) { addRentalBlock(listingId: $l, startDate: $s, endDate: $e, note: $n) { id startDate endDate note } }`, { l: listingId, s, e, n: note }, token);

      expect((await add(day(70), day(72), renter)).errors?.[0].message).toMatch(/do not own/i);
      expect((await add(day(72), day(70))).errors?.[0].message).toMatch(/must not be before/i);
      const block = (await add(day(70), day(72))).data.addRentalBlock;
      expect(block).toMatchObject({ startDate: day(70), endDate: day(72), note: 'In service' });

      expect((await ctx.gql(AVAILABILITY, { l: listingId })).data.rentalAvailability).toEqual([
        { startDate: day(70), endDate: day(72), reason: 'BLOCKED' },
      ]);
      expect((await ctx.gql(REQUEST, { l: listingId, s: day(71), e: day(74) }, renter)).errors?.[0].message).toMatch(/not available/i);
      expect((await ctx.gql(`query($l: String!) { rentalBlocks(listingId: $l) { id } }`, { l: listingId }, renter)).errors).toBeDefined();
      expect((await ctx.gql(`query($l: String!) { rentalBlocks(listingId: $l) { id } }`, { l: listingId }, owner)).data.rentalBlocks).toHaveLength(1);

      expect((await ctx.gql(`mutation($id: String!) { removeRentalBlock(id: $id) }`, { id: block.id }, renter)).errors).toBeDefined();
      expect((await ctx.gql(`mutation($id: String!) { removeRentalBlock(id: $id) }`, { id: block.id }, owner)).data.removeRentalBlock).toBe(true);
      expect((await ctx.gql(REQUEST, { l: listingId, s: day(71), e: day(74) }, renter)).errors).toBeUndefined();
    });

    it('refuses to block days that already have a confirmed booking', async () => {
      const { listingId } = await car();
      const booking = (await ctx.gql(REQUEST, { l: listingId, s: day(80), e: day(83) }, renter)).data.requestRental.id;
      await ctx.gql(DECIDE, { id: booking, c: true }, owner);
      const res = await ctx.gql(`mutation($l: String!) { addRentalBlock(listingId: $l, startDate: "${day(82)}", endDate: "${day(85)}") { id } }`, { l: listingId }, owner);
      expect(res.errors?.[0].message).toMatch(/confirmed booking/i);
    });

    it('hides cars that are not free for the whole wanted period from the rental search', async () => {
      const free = await car({ brand: 'SearchRent' });
      const booked = await car({ brand: 'SearchRent' });
      const blocked = await car({ brand: 'SearchRent' });
      const booking = (await ctx.gql(REQUEST, { l: booked.listingId, s: day(90), e: day(93) }, renter)).data.requestRental.id;
      await ctx.gql(DECIDE, { id: booking, c: true }, owner);
      await ctx.gql(`mutation($l: String!) { addRentalBlock(listingId: $l, startDate: "${day(94)}", endDate: "${day(96)}") { id } }`, { l: blocked.listingId }, owner);

      const search = async (from: string, to: string) =>
        (await ctx.gql(
          `query($f: String, $t: String) { vehicles(filter: { brand: "SearchRent", purpose: RENT, availableFrom: $f, availableTo: $t }) { items { id } } }`,
          { f: from, t: to },
        )).data.vehicles.items.map((v: any) => v.id).sort();

      const all = [free.vehicleId, booked.vehicleId, blocked.vehicleId].sort();
      expect(await search(day(200), day(203))).toEqual(all);
      expect(await search(day(92), day(95))).toEqual([free.vehicleId]); // overlaps the booking and the block
      expect(await search(day(93), day(93))).toEqual([free.vehicleId, blocked.vehicleId].sort());
      expect(await search(day(96), day(97))).toEqual([free.vehicleId, booked.vehicleId].sort());
    });
  });
});
