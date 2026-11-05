import { AuctionsService } from '../src/auctions/auctions.service';
import { createTestContext, TestContext } from './helpers';

describe('auctions and bids', () => {
  let ctx: TestContext;
  let seller: string;
  let buyerA: string;
  let buyerB: string;
  let listingId: string;

  beforeAll(async () => {
    ctx = await createTestContext();
    seller = await ctx.registerSeller('Auction seller');
    buyerA = await ctx.registerUser('Buyer A');
    buyerB = await ctx.registerUser('Buyer B');
    listingId = (await ctx.createVehicleListing(seller, { publish: true })).listingId;
  });
  afterAll(() => ctx.close());

  const CREATE = `mutation($l: String!, $s: DateTime!, $e: DateTime!, $p: Float!) {
    createAuction(input: { listingId: $l, startTime: $s, endTime: $e, startPrice: $p }) { id status }
  }`;
  const START = `mutation($id: String!) { startAuction(id: $id) { status } }`;
  const BID = `mutation($a: String!, $amount: Float!) { placeBid(input: { auctionId: $a, amount: $amount }) { id } }`;

  const iso = (offsetMs: number) => new Date(Date.now() + offsetMs).toISOString();

  /** Creates and starts an auction on a fresh listing so tests do not block each other. */
  const activeAuction = async (endInMs = 60_000) => {
    const { listingId: l } = await ctx.createVehicleListing(seller, { publish: true });
    const created = await ctx.gql(CREATE, { l, s: iso(-1000), e: iso(endInMs), p: 100 }, seller);
    const id = created.data.createAuction.id as string;
    await ctx.gql(START, { id }, seller);
    return id;
  };

  it('validates auction input', async () => {
    const pastEnd = await ctx.gql(CREATE, { l: listingId, s: iso(-5000), e: iso(-1000), p: 100 }, seller);
    expect(pastEnd.errors?.[0].message).toMatch(/future/i);
    const reversed = await ctx.gql(CREATE, { l: listingId, s: iso(5000), e: iso(1000), p: 100 }, seller);
    expect(reversed.errors?.[0].message).toMatch(/after startTime/i);
    const free = await ctx.gql(CREATE, { l: listingId, s: iso(0), e: iso(5000), p: 0 }, seller);
    expect(free.errors?.[0].message).toMatch(/greater than 0/i);
    const notOwner = await ctx.gql(CREATE, { l: listingId, s: iso(0), e: iso(5000), p: 10 }, buyerA);
    expect(notOwner.errors?.[0].message).toMatch(/do not own/i);
  });

  it('rejects bids that are too low, on a pending auction, or from the seller', async () => {
    const { listingId: l } = await ctx.createVehicleListing(seller, { publish: true });
    const created = await ctx.gql(CREATE, { l, s: iso(0), e: iso(60_000), p: 100 }, seller);
    const id = created.data.createAuction.id;

    expect((await ctx.gql(BID, { a: id, amount: 150 }, buyerA)).errors?.[0].message).toMatch(/not active/i);

    await ctx.gql(START, { id }, seller);
    expect((await ctx.gql(BID, { a: id, amount: 100 }, buyerA)).errors?.[0].message).toMatch(/greater than current/i);
    expect((await ctx.gql(BID, { a: id, amount: 150 }, seller)).errors?.[0].message).toMatch(/own listing/i);
    expect((await ctx.gql(BID, { a: id, amount: 150 })).errors).toBeDefined();
    expect((await ctx.gql(BID, { a: id, amount: 150 }, buyerA)).data.placeBid.id).toEqual(expect.any(String));
  });

  it('lets exactly one of 24 simultaneous identical bids win', async () => {
    const id = await activeAuction();
    const tokens = Array.from({ length: 24 }, (_, i) => (i % 2 === 0 ? buyerA : buyerB));
    const results = await Promise.all(tokens.map((t) => ctx.gql(BID, { a: id, amount: 500 }, t)));
    expect(results.filter((r) => r.data?.placeBid).length).toBe(1);

    const bids = await ctx.gql(`query($id: String!) { bidsByAuction(auctionId: $id) { amount } }`, { id });
    expect(bids.data.bidsByAuction).toHaveLength(1);
    const auction = await ctx.gql(`query($id: String!) { auction(id: $id) { currentPrice } }`, { id });
    expect(auction.data.auction.currentPrice).toBe(500);
  });

  it('closes expired auctions and refuses bids afterwards', async () => {
    const id = await activeAuction(1200);
    await new Promise((r) => setTimeout(r, 1500));

    // a bid after endTime is refused even before the background job has run
    expect((await ctx.gql(BID, { a: id, amount: 200 }, buyerA)).errors?.[0].message).toMatch(/not active/i);

    const finished = await ctx.app.get(AuctionsService).finishExpiredAuctions();
    expect(finished).toBeGreaterThanOrEqual(1);
    const auction = await ctx.gql(`query($id: String!) { auction(id: $id) { status } }`, { id });
    expect(auction.data.auction.status).toBe('FINISHED');
  });
});
