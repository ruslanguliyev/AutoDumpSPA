import { createTestContext, TestContext } from './helpers';

describe('moderation: reports and blocking', () => {
  let ctx: TestContext;
  let seller: string;
  let reporter: string;
  let admin: string;

  beforeAll(async () => {
    ctx = await createTestContext();
    seller = await ctx.registerSeller('Mod seller');
    reporter = await ctx.registerUser('Mod reporter');
    admin = await ctx.registerUser('Mod admin');
    await ctx.prisma.user.updateMany({ where: { email: { startsWith: 'mod-admin' } }, data: { role: 'ADMIN' } });
  });
  afterAll(() => ctx.close());

  const REPORT = `mutation($l: String!, $r: ReportReason!, $d: String) { reportListing(input: { listingId: $l, reason: $r, details: $d }) }`;
  const REPORTS = `query($s: ReportStatus) { reports(status: $s) { id listingId listingTitle listingStatus reason details status reporterEmail openReportsForListing kind itemId sellerName } }`;
  const BLOCK = `mutation($l: String!, $r: String!) { blockListing(listingId: $l, reason: $r) }`;
  const UNBLOCK = `mutation($l: String!) { unblockListing(listingId: $l) }`;
  const STATUS = (name: string) => `mutation($id: String!) { ${name}(id: $id) { status } }`;

  describe('reporting', () => {
    it('lets a signed-in user report a published listing once, but not drafts or their own', async () => {
      const live = await ctx.createVehicleListing(seller, { publish: true });
      const draft = await ctx.createVehicleListing(seller);

      expect((await ctx.gql(REPORT, { l: live.listingId, r: 'SPAM' })).errors).toBeDefined(); // anonymous
      expect((await ctx.gql(REPORT, { l: draft.listingId, r: 'SPAM' }, reporter)).errors?.[0].message).toMatch(/not found/i);
      expect((await ctx.gql(REPORT, { l: live.listingId, r: 'SPAM' }, seller)).errors?.[0].message).toMatch(/your own/i);

      expect((await ctx.gql(REPORT, { l: live.listingId, r: 'SCAM', d: '  Asks for prepayment  ' }, reporter)).data.reportListing).toBe(true);
      expect((await ctx.gql(REPORT, { l: live.listingId, r: 'SCAM' }, reporter)).errors?.[0].message).toMatch(/already reported/i);
      expect((await ctx.gql(REPORT, { l: live.listingId, r: 'OTHER', d: 'x'.repeat(1001) }, admin)).errors?.[0].message).toMatch(/at most 1000/i);
    });
  });

  describe('admin access', () => {
    it('keeps the report queue and blocking tools away from regular users and anonymous visitors', async () => {
      const live = await ctx.createVehicleListing(seller, { publish: true });
      expect((await ctx.gql(REPORTS)).errors?.[0].message).toMatch(/unauthorized/i);
      expect((await ctx.gql(REPORTS, undefined, reporter)).errors?.[0].message).toMatch(/administrator/i);
      expect((await ctx.gql(REPORTS, undefined, seller)).errors?.[0].message).toMatch(/administrator/i);
      expect((await ctx.gql(BLOCK, { l: live.listingId, r: 'spam' }, reporter)).errors?.[0].message).toMatch(/administrator/i);
      expect((await ctx.gql(UNBLOCK, { l: live.listingId }, seller)).errors?.[0].message).toMatch(/administrator/i);
      expect((await ctx.gql(REPORTS, undefined, admin)).errors).toBeUndefined();
    });
  });

  describe('moderator workflow', () => {
    it('shows reports with context and lets the moderator dismiss one', async () => {
      const live = await ctx.createVehicleListing(seller, { title: 'Dismiss me', publish: true });
      const other = await ctx.registerUser('Second reporter');
      await ctx.gql(REPORT, { l: live.listingId, r: 'WRONG_INFO', d: 'Wrong mileage' }, reporter);
      await ctx.gql(REPORT, { l: live.listingId, r: 'ALREADY_SOLD' }, other);

      const open = (await ctx.gql(REPORTS, { s: 'OPEN' }, admin)).data.reports.filter((r: any) => r.listingId === live.listingId);
      expect(open).toHaveLength(2);
      expect(open[0]).toMatchObject({
        listingTitle: 'Dismiss me',
        listingStatus: 'ACTIVE',
        kind: 'vehicle',
        itemId: live.vehicleId,
        sellerName: 'Mod seller',
        openReportsForListing: 2,
        reason: 'WRONG_INFO',
        details: 'Wrong mileage',
      });
      expect(open[0].reporterEmail).toMatch(/@test\.local$/);

      expect((await ctx.gql(`mutation($id: String!) { dismissReport(id: $id) }`, { id: open[0].id }, admin)).data.dismissReport).toBe(true);
      const dismissed = (await ctx.gql(REPORTS, { s: 'DISMISSED' }, admin)).data.reports.map((r: any) => r.id);
      expect(dismissed).toContain(open[0].id);
      const stillOpen = (await ctx.gql(REPORTS, { s: 'OPEN' }, admin)).data.reports.filter((r: any) => r.listingId === live.listingId);
      expect(stillOpen).toHaveLength(1);
      expect(stillOpen[0].openReportsForListing).toBe(1);
      // the listing itself is untouched
      expect((await ctx.gql(`query($id: String!) { listing(id: $id) { status } }`, { id: live.listingId })).data.listing.status).toBe('ACTIVE');
    });

    it('blocks a listing: hidden from everyone, owner cannot undo it, reports are closed', async () => {
      const live = await ctx.createVehicleListing(seller, { brand: 'BlockedBrand', publish: true });
      const fan = await ctx.registerUser('Fan');
      await ctx.gql(`mutation($i: String!) { addFavorite(type: "vehicle", itemId: $i) }`, { i: live.vehicleId }, fan);
      await ctx.gql(REPORT, { l: live.listingId, r: 'PROHIBITED' }, reporter);

      expect((await ctx.gql(BLOCK, { l: live.listingId, r: '   ' }, admin)).errors?.[0].message).toMatch(/reason is required/i);
      expect((await ctx.gql(BLOCK, { l: live.listingId, r: 'Prohibited item: stolen parts' }, admin)).data.blockListing).toBe(true);

      // public view: gone everywhere
      const search = await ctx.gql(`{ vehicles(filter: { brand: "BlockedBrand" }) { total } }`);
      expect(search.data.vehicles.total).toBe(0);
      expect((await ctx.gql(`query($id: String!) { vehicleById(id: $id) { id } }`, { id: live.vehicleId })).errors).toBeDefined();
      expect((await ctx.gql(`query($id: String!) { listing(id: $id) { id } }`, { id: live.listingId }, fan)).errors).toBeDefined();
      expect((await ctx.gql('{ myFavorites { itemId } }', undefined, fan)).data.myFavorites.map((f: any) => f.itemId)).not.toContain(live.vehicleId);
      expect(
        (await ctx.gql(`mutation($l: String!) { createInquiry(input: { listingId: $l, message: "hi" }) { id } }`, { l: live.listingId }, fan)).errors,
      ).toBeDefined();
      expect((await ctx.gql(REPORT, { l: live.listingId, r: 'SPAM' }, fan)).errors).toBeDefined();

      // owner view: sees why, cannot publish / unpublish / close it
      const mine = (await ctx.gql('{ myListings { id status blockedReason } }', undefined, seller)).data.myListings.find((l: any) => l.id === live.listingId);
      expect(mine).toMatchObject({ status: 'BLOCKED', blockedReason: 'Prohibited item: stolen parts' });
      for (const mutation of ['publishListing', 'unpublishListing', 'closeListing']) {
        expect((await ctx.gql(STATUS(mutation), { id: live.listingId }, seller)).errors?.[0].message).toMatch(/blocked by moderation/i);
      }
      expect((await ctx.gql(`query($id: String!) { listing(id: $id) { status } }`, { id: live.listingId }, seller)).data.listing.status).toBe('BLOCKED');

      // the report that led to it is closed as actioned
      const actioned = (await ctx.gql(REPORTS, { s: 'ACTIONED' }, admin)).data.reports;
      expect(actioned.some((r: any) => r.listingId === live.listingId)).toBe(true);
      expect((await ctx.gql(REPORTS, { s: 'OPEN' }, admin)).data.reports.some((r: any) => r.listingId === live.listingId)).toBe(false);
    });

    it('unblocking returns the listing to the owner as a draft that they can publish again', async () => {
      const live = await ctx.createVehicleListing(seller, { brand: 'UnblockBrand', publish: true });
      expect((await ctx.gql(UNBLOCK, { l: live.listingId }, admin)).errors?.[0].message).toMatch(/not blocked/i);
      await ctx.gql(BLOCK, { l: live.listingId, r: 'Needs a review' }, admin);

      expect((await ctx.gql(UNBLOCK, { l: live.listingId }, admin)).data.unblockListing).toBe(true);
      const mine = (await ctx.gql('{ myListings { id status blockedReason } }', undefined, seller)).data.myListings.find((l: any) => l.id === live.listingId);
      expect(mine).toMatchObject({ status: 'DRAFT', blockedReason: null });
      expect((await ctx.gql(STATUS('publishListing'), { id: live.listingId }, seller)).data.publishListing.status).toBe('ACTIVE');
      expect((await ctx.gql(`{ vehicles(filter: { brand: "UnblockBrand" }) { total } }`)).data.vehicles.total).toBe(1);
    });
  });
});
