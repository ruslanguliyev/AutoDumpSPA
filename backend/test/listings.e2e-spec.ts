import { createTestContext, TestContext } from './helpers';

describe('listings: visibility, publishing, ownership', () => {
  let ctx: TestContext;
  let owner: string;
  let stranger: string;

  beforeAll(async () => {
    ctx = await createTestContext();
    owner = await ctx.registerSeller('Owner');
    stranger = await ctx.registerSeller('Stranger');
  });
  afterAll(() => ctx.close());

  const VEHICLES = `query($brand: String!) { vehicles(filter: { brand: $brand }) { total } }`;
  const LISTING = `query($id: String!) { listing(id: $id) { id status } }`;
  const BY_LISTING = `query($l: String!) { vehicleByListing(listingId: $l) { id } }`;

  it('cannot publish a listing that has no vehicle, part or service', async () => {
    const created = await ctx.gql(
      `mutation { createListing(input: { title: "Empty", description: "d", price: 1 }) { id } }`,
      undefined,
      owner,
    );
    const res = await ctx.gql(
      `mutation($id: String!) { publishListing(id: $id) { status } }`,
      { id: created.data.createListing.id },
      owner,
    );
    expect(res.errors?.[0].message).toMatch(/cannot be published/i);
  });

  it('hides drafts from search, direct lookups and other users; shows them to the owner', async () => {
    const { listingId, vehicleId } = await ctx.createVehicleListing(owner, { brand: 'DraftBrand' });

    expect((await ctx.gql(VEHICLES, { brand: 'DraftBrand' })).data.vehicles.total).toBe(0);
    expect((await ctx.gql(`query($id: String!) { vehicleById(id: $id) { id } }`, { id: vehicleId })).errors).toBeDefined();

    expect((await ctx.gql(LISTING, { id: listingId })).errors).toBeDefined();
    expect((await ctx.gql(LISTING, { id: listingId }, stranger)).errors).toBeDefined();
    expect((await ctx.gql(LISTING, { id: listingId }, owner)).data.listing.status).toBe('DRAFT');

    expect((await ctx.gql(BY_LISTING, { l: listingId })).data.vehicleByListing).toBeNull();
    expect((await ctx.gql(BY_LISTING, { l: listingId }, stranger)).data.vehicleByListing).toBeNull();
    expect((await ctx.gql(BY_LISTING, { l: listingId }, owner)).data.vehicleByListing.id).toBe(vehicleId);
  });

  it('shows a published listing to everyone and hides it again after unpublishing', async () => {
    const { listingId } = await ctx.createVehicleListing(owner, { brand: 'PubBrand', publish: true });
    expect((await ctx.gql(VEHICLES, { brand: 'PubBrand' })).data.vehicles.total).toBe(1);
    expect((await ctx.gql(LISTING, { id: listingId })).data.listing.status).toBe('ACTIVE');

    await ctx.gql(`mutation($id: String!) { unpublishListing(id: $id) { status } }`, { id: listingId }, owner);
    expect((await ctx.gql(VEHICLES, { brand: 'PubBrand' })).data.vehicles.total).toBe(0);
  });

  it('only lets the owner change a listing or its vehicle', async () => {
    const { listingId, vehicleId } = await ctx.createVehicleListing(owner, { publish: true });

    const updateListing = await ctx.gql(
      `mutation($id: String!) { updateListing(id: $id, input: { title: "Hacked" }) { id } }`,
      { id: listingId },
      stranger,
    );
    expect(updateListing.errors?.[0].message).toMatch(/do not own/i);

    const updateVehicle = await ctx.gql(
      `mutation($id: String!) { updateVehicle(id: $id, input: { brand: "Hacked" }) { id } }`,
      { id: vehicleId },
      stranger,
    );
    expect(updateVehicle.errors?.[0].message).toMatch(/do not own/i);

    const del = await ctx.gql(`mutation($id: String!) { deleteListing(id: $id) }`, { id: listingId }, stranger);
    expect(del.errors).toBeDefined();
  });

  it('keeps other sellers\' drafts out of `listings` but lets a seller list their own', async () => {
    const mine = await ctx.createVehicleListing(owner, { title: 'My draft' });
    const sellerId = (await ctx.gql('{ mySeller { id } }', undefined, owner)).data.mySeller.id;
    const q = `query($s: String!) { listings(filter: { sellerId: $s }, perPage: 500) { items { id status } } }`;

    const asAnon = await ctx.gql(q, { s: sellerId });
    expect(asAnon.data.listings.items.every((l: any) => l.status === 'ACTIVE')).toBe(true);
    const asOwner = await ctx.gql(q, { s: sellerId }, owner);
    expect(asOwner.data.listings.items.map((l: any) => l.id)).toContain(mine.listingId);

    const myListings = await ctx.gql('{ myListings { id kind status } }', undefined, owner);
    expect(myListings.data.myListings.find((l: any) => l.id === mine.listingId)).toMatchObject({ kind: 'vehicle', status: 'DRAFT' });
    expect((await ctx.gql('{ myListings { id } }', undefined, stranger)).data.myListings.map((l: any) => l.id)).not.toContain(mine.listingId);
  });
});
