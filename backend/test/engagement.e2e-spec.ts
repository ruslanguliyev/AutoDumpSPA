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
  });
});
