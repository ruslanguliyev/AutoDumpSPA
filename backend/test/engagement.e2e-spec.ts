import request = require('supertest');
import { createTestContext, TestContext } from './helpers';

describe('favorites, inquiries and seller phone', () => {
  let ctx: TestContext;
  let seller: string;
  let buyer: string;

  beforeAll(async () => {
    ctx = await createTestContext();
    seller = await ctx.registerSeller('Eng seller', '+994 50 111 22 33');
    buyer = await ctx.registerUser('Eng buyer');
  });
  afterAll(() => ctx.close());

  const ADD_FAV = `mutation($t: String!, $i: String!) { addFavorite(type: $t, itemId: $i) }`;
  const INQUIRY = `mutation($l: String!, $m: String!) { createInquiry(input: { listingId: $l, message: $m, phone: "+994 55 000 00 00" }) { id status fromEmail } }`;

  describe('favorites', () => {
    it('only accepts published items and valid types, and is idempotent', async () => {
      const draft = await ctx.createVehicleListing(seller);
      expect((await ctx.gql(ADD_FAV, { t: 'vehicle', i: draft.vehicleId }, buyer)).errors).toBeDefined();

      const live = await ctx.createVehicleListing(seller, { brand: 'FavBrand', publish: true });
      expect((await ctx.gql(ADD_FAV, { t: 'boat', i: live.vehicleId }, buyer)).errors).toBeDefined();
      expect((await ctx.gql(ADD_FAV, { t: 'vehicle', i: live.vehicleId })).errors).toBeDefined();

      expect((await ctx.gql(ADD_FAV, { t: 'vehicle', i: live.vehicleId }, buyer)).data.addFavorite).toBe(true);
      expect((await ctx.gql(ADD_FAV, { t: 'vehicle', i: live.vehicleId }, buyer)).data.addFavorite).toBe(true);

      const list = await ctx.gql('{ myFavorites { type itemId title } }', undefined, buyer);
      expect(list.data.myFavorites.filter((f: any) => f.itemId === live.vehicleId)).toHaveLength(1);
    });

    it('syncs only valid items and drops favorites of unpublished listings', async () => {
      const a = await ctx.createVehicleListing(seller, { brand: 'SyncA', publish: true });
      const synced = await ctx.gql(
        `mutation($items: [FavoriteRefInput!]!) { syncFavorites(items: $items) }`,
        { items: [{ type: 'vehicle', itemId: a.vehicleId }, { type: 'vehicle', itemId: 'nope' }] },
        buyer,
      );
      expect(synced.data.syncFavorites).toBe(1);

      await ctx.gql(`mutation($id: String!) { unpublishListing(id: $id) { status } }`, { id: a.listingId }, seller);
      const list = await ctx.gql('{ myFavorites { itemId } }', undefined, buyer);
      expect(list.data.myFavorites.map((f: any) => f.itemId)).not.toContain(a.vehicleId);

      const mine = await ctx.gql('{ myListings { id favoritesCount } }', undefined, seller);
      expect(mine.data.myListings.find((l: any) => l.id === a.listingId).favoritesCount).toBe(1);
    });
  });

  describe('inquiries', () => {
    it('lets a buyer write to a published listing and only the seller see the sender', async () => {
      const live = await ctx.createVehicleListing(seller, { publish: true });
      const sent = await ctx.gql(INQUIRY, { l: live.listingId, m: 'Is it available?' }, buyer);
      expect(sent.data.createInquiry).toMatchObject({ status: 'NEW', fromEmail: null });
      const id = sent.data.createInquiry.id;

      const received = await ctx.gql('{ receivedInquiries { id message fromEmail phone } }', undefined, seller);
      const row = received.data.receivedInquiries.find((i: any) => i.id === id);
      expect(row.fromEmail).toMatch(/@test\.local$/);
      expect(row.phone).toBe('+994 55 000 00 00');

      expect((await ctx.gql('{ receivedInquiries { id } }', undefined, buyer)).data.receivedInquiries).toHaveLength(0);
      const sentList = await ctx.gql('{ sentInquiries { id fromEmail } }', undefined, buyer);
      expect(sentList.data.sentInquiries.find((i: any) => i.id === id).fromEmail).toBeNull();

      expect((await ctx.gql('{ unreadInquiriesCount }', undefined, seller)).data.unreadInquiriesCount).toBeGreaterThanOrEqual(1);
      expect((await ctx.gql(`mutation($id: String!) { markInquiryRead(id: $id) { status } }`, { id }, buyer)).errors).toBeDefined();
      expect((await ctx.gql(`mutation($id: String!) { markInquiryRead(id: $id) { status } }`, { id }, seller)).data.markInquiryRead.status).toBe('READ');
    });

    it('refuses inquiries on drafts, on own listings, empty messages and anonymous senders', async () => {
      const draft = await ctx.createVehicleListing(seller);
      const live = await ctx.createVehicleListing(seller, { publish: true });
      expect((await ctx.gql(INQUIRY, { l: draft.listingId, m: 'hi' }, buyer)).errors).toBeDefined();
      expect((await ctx.gql(INQUIRY, { l: live.listingId, m: 'hi' }, seller)).errors?.[0].message).toMatch(/own listing/i);
      expect((await ctx.gql(INQUIRY, { l: live.listingId, m: '   ' }, buyer)).errors?.[0].message).toMatch(/required/i);
      expect((await ctx.gql(INQUIRY, { l: live.listingId, m: 'hi' })).errors).toBeDefined();
    });

    it('rate-limits a sender to 10 inquiries per hour', async () => {
      const spammer = await ctx.registerUser('Spammer');
      const live = await ctx.createVehicleListing(seller, { publish: true });
      for (let i = 0; i < 10; i += 1) {
        expect((await ctx.gql(INQUIRY, { l: live.listingId, m: `msg ${i}` }, spammer)).errors).toBeUndefined();
      }
      expect((await ctx.gql(INQUIRY, { l: live.listingId, m: 'one too many' }, spammer)).errors?.[0].message).toMatch(/too many/i);
    });
  });

  describe('seller phone privacy', () => {
    it('validates the phone and hides it publicly when showPhone is false', async () => {
      const bad = await ctx.gql(`mutation { updateSeller(input: { phone: "abc" }) { id } }`, undefined, seller);
      expect(bad.errors?.[0].message).toMatch(/invalid phone/i);

      const live = await ctx.createVehicleListing(seller, { publish: true });
      const publicQuery = `query($id: String!) { vehicleById(id: $id) { seller { id phone } } }`;
      const sellerId = (await ctx.gql(publicQuery, { id: live.vehicleId })).data.vehicleById.seller.id;
      const sellerById = `query($id: String!) { sellerById(id: $id) { phone } }`;

      expect((await ctx.gql(publicQuery, { id: live.vehicleId })).data.vehicleById.seller.phone).toBe('+994 50 111 22 33');
      expect((await ctx.gql(sellerById, { id: sellerId })).data.sellerById.phone).toBe('+994 50 111 22 33');

      await ctx.gql(`mutation { updateSeller(input: { showPhone: false }) { showPhone } }`, undefined, seller);
      expect((await ctx.gql(publicQuery, { id: live.vehicleId })).data.vehicleById.seller.phone).toBeNull();
      expect((await ctx.gql(sellerById, { id: sellerId })).data.sellerById.phone).toBeNull();
      expect((await ctx.gql('{ sellers { id phone } }')).data.sellers.every((s: any) => s.phone === null)).toBe(true);
      expect((await ctx.gql('{ mySeller { phone } }', undefined, seller)).data.mySeller.phone).toBe('+994 50 111 22 33');

      const cleared = await ctx.gql(`mutation { updateSeller(input: { phone: "" }) { phone } }`, undefined, seller);
      expect(cleared.data.updateSeller.phone).toBeNull();
    });

    it('keeps the seller contact email private and validates it', async () => {
      const bad = await ctx.gql(`mutation { updateSeller(input: { contactEmail: "nope" }) { id } }`, undefined, seller);
      expect(bad.errors?.[0].message).toMatch(/invalid contact email/i);

      const saved = await ctx.gql(`mutation { updateSeller(input: { contactEmail: "  Sales@Shop.TEST " }) { contactEmail } }`, undefined, seller);
      expect(saved.data.updateSeller.contactEmail).toBe('sales@shop.test');
      expect((await ctx.gql('{ mySeller { contactEmail } }', undefined, seller)).data.mySeller.contactEmail).toBe('sales@shop.test');

      const sellerId = (await ctx.gql('{ mySeller { id } }', undefined, seller)).data.mySeller.id;
      expect((await ctx.gql(`query($id: String!) { sellerById(id: $id) { contactEmail } }`, { id: sellerId })).data.sellerById.contactEmail).toBeNull();
      expect((await ctx.gql('{ sellers { contactEmail } }')).data.sellers.every((s: any) => s.contactEmail === null)).toBe(true);

      const cleared = await ctx.gql(`mutation { updateSeller(input: { contactEmail: "" }) { contactEmail } }`, undefined, seller);
      expect(cleared.data.updateSeller.contactEmail).toBeNull();
    });
  });

  describe('views', () => {
    const TRACK = `mutation($t: ViewTarget!, $id: String!) { trackView(targetType: $t, targetId: $id) }`;

    const track = async (
      targetType: string,
      targetId: string,
      opts?: { token?: string; userAgent?: string | null; forwardedFor?: string },
    ) => {
      const req = request(ctx.app.getHttpServer()).post('/graphql');
      if (opts?.userAgent === null) req.unset('User-Agent');
      else req.set('User-Agent', opts?.userAgent ?? 'Mozilla/5.0');
      if (opts?.forwardedFor) req.set('X-Forwarded-For', opts.forwardedFor);
      if (opts?.token) req.set('Authorization', `Bearer ${opts.token}`);
      const res = await req.send({ query: TRACK, variables: { t: targetType, id: targetId } });
      return res.body as { data?: { trackView: boolean }; errors?: Array<{ message: string }> };
    };

    beforeAll(() => {
      process.env.TRUSTED_PROXY_HOPS = '1';
    });

    it('counts one address once per 30 minutes, and ignores bots and the owner', async () => {
      const live = await ctx.createVehicleListing(seller, { brand: 'Viewed', publish: true });

      expect((await track('LISTING', live.listingId, { token: seller })).data?.trackView).toBe(false);
      expect((await track('LISTING', live.listingId, { userAgent: null })).data?.trackView).toBe(false);
      expect((await track('LISTING', live.listingId, { userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1)' })).data?.trackView).toBe(false);
      expect((await track('LISTING', live.listingId, { userAgent: 'SomeCrawler/1.0' })).data?.trackView).toBe(false);
      expect((await track('LISTING', live.listingId, { userAgent: 'Spiderbot' })).data?.trackView).toBe(false);

      expect((await track('LISTING', live.listingId)).data?.trackView).toBe(true);
      expect((await track('LISTING', live.listingId)).data?.trackView).toBe(false);
      // The left-hand address is spoofable; hop 1 keeps the right-hand one.
      expect((await track('LISTING', live.listingId, { forwardedFor: '198.51.100.4, 203.0.113.9' })).data?.trackView).toBe(true);
      expect((await track('LISTING', live.listingId, { forwardedFor: '203.0.113.9' })).data?.trackView).toBe(false);

      const listed = await ctx.prisma.listing.findUniqueOrThrow({ where: { id: live.listingId } });
      expect(listed.viewsCount).toBe(2);
      const shown = await ctx.gql(`query($id: String!) { vehicleById(id: $id) { viewsCount } }`, { id: live.vehicleId });
      expect(shown.data.vehicleById.viewsCount).toBe(2);
    });

    it('counts parts, service centres and seller or specialist profiles', async () => {
      const listing = await ctx.gql(
        `mutation($t: String!) { createListing(input: { title: $t, description: "d", price: 20 }) { id } }`,
        { t: 'Brake pads' },
        seller,
      );
      const listingId = listing.data.createListing.id as string;
      const part = await ctx.gql(
        `mutation($l: String!, $i: CreatePartInput!) { createPart(listingId: $l, input: $i) { id } }`,
        { l: listingId, i: { name: 'Pads', category: 'brakes', brand: 'Bosch', model: 'X', condition: 'new', stock: 2 } },
        seller,
      );
      const partId = part.data.createPart.id as string;
      await ctx.gql(`mutation($id: String!) { publishListing(id: $id) { status } }`, { id: listingId }, seller);

      expect((await track('PART', partId, { token: seller })).data?.trackView).toBe(false);
      expect((await track('PART', partId)).data?.trackView).toBe(true);
      expect((await track('LISTING', listingId)).data?.trackView).toBe(false);
      const partView = await ctx.gql(`query($id: String!) { partById(id: $id) { viewsCount } }`, { id: partId });
      expect(partView.data.partById.viewsCount).toBe(1);

      const centerToken = await ctx.registerUser('View garage');
      const center = await ctx.gql(
        `mutation($i: CreateServiceCenterInput!) { createServiceCenter(input: $i) { id } }`,
        { i: { name: 'View garage', city: 'Baku', categories: ['engine'] } },
        centerToken,
      );
      const centerId = center.data.createServiceCenter.id as string;
      expect((await track('SERVICE_CENTER', centerId, { token: centerToken })).data?.trackView).toBe(false);
      expect((await track('SERVICE_CENTER', centerId)).data?.trackView).toBe(true);
      const centerView = await ctx.gql(`query($id: String!) { serviceCenter(id: $id) { viewsCount } }`, { id: centerId });
      expect(centerView.data.serviceCenter.viewsCount).toBe(1);

      const masterToken = await ctx.registerUser('View master');
      const master = await ctx.gql(
        `mutation($i: CreateSpecialistInput!) { createSpecialist(input: $i) { id } }`,
        { i: { name: 'View master', slug: `view-master-${Date.now()}`, city: 'Baku', skills: [], specializations: [], experience: 2, portfolio: [] } },
        masterToken,
      );
      const masterId = master.data.createSpecialist.id as string;
      expect((await track('SPECIALIST', masterId, { token: masterToken })).data?.trackView).toBe(false);
      expect((await track('SPECIALIST', masterId)).data?.trackView).toBe(true);
      const masterView = await ctx.gql(`query($id: String!) { specialist(id: $id) { viewsCount } }`, { id: masterId });
      expect(masterView.data.specialist.viewsCount).toBe(1);

      const sellerId = (await ctx.gql(`{ mySeller { id } }`, undefined, seller)).data.mySeller.id as string;
      expect((await track('SELLER', sellerId, { token: seller })).data?.trackView).toBe(false);
      expect((await track('SELLER', sellerId)).data?.trackView).toBe(true);
      expect((await track('SELLER', sellerId)).data?.trackView).toBe(false);
      const sellerView = await ctx.gql(`query($id: String!) { sellerById(id: $id) { viewsCount } }`, { id: sellerId });
      expect(sellerView.data.sellerById.viewsCount).toBe(1);
    });
  });
});
