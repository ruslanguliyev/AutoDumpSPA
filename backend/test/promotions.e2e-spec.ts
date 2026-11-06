import request = require('supertest');
import { createTestContext, TestContext } from './helpers';
import { PromotionsService } from '../src/promotions/promotions.service';
import { sign } from '../src/promotions/payments/payment-provider';

const QUOTE = `query($t: PromotionTarget!, $id: String!) {
  promotionQuote(targetType: $t, targetId: $id) {
    currency activeTier activeUntil bumpsLeft
    target { targetType targetId title href }
    packages { code tier days bumps bumpsPerDay listAmount creditAmount amount recommended }
  }
}`;

const CREATE = `mutation($i: CreatePromotionOrderInput!) {
  createPromotionOrder(input: $i) {
    token tier packageCode days bumps listAmount creditAmount amount currency status payUrl
    target { title }
  }
}`;

const ORDER = `query($t: String!) {
  promotionOrder(token: $t) { token status amount payUrl paidAt tier }
}`;

const MY = `{
  myPromotions {
    id tier active bumpsTotal bumpsUsed amount viewsGained contactsGained endedReason
    target { targetId title }
  }
}`;

const VEHICLES = `query { vehicles(filter: { limit: 20 }) { items { id promotionTier } total } }`;
const PROMOTED = `query($tier: PromotionTier) { promotedVehicles(tier: $tier, limit: 6) { id promotionTier } }`;

describe('paid promotion of listings and profiles', () => {
  let ctx: TestContext;
  let promotions: PromotionsService;
  let sellerToken: string;
  let listingId: string;
  let vehicleId: string;

  /** Plays the bank: the stub checkout reports an outcome for the order. */
  const payMock = (token: string, outcome: 'paid' | 'failed' = 'paid') =>
    request(ctx.app.getHttpServer()).post(`/payments/mock/${token}/complete`).send({ outcome });

  const buy = async (targetType: string, targetId: string, packageCode: string) => {
    const created = await ctx.gql(CREATE, { i: { targetType, targetId, packageCode } });
    if (!created.data) throw new Error(`checkout failed: ${JSON.stringify(created.errors)}`);
    const token = created.data.createPromotionOrder.token as string;
    await payMock(token).expect(200);
    return token;
  };

  beforeAll(async () => {
    ctx = await createTestContext();
    promotions = ctx.app.get(PromotionsService);
    sellerToken = await ctx.registerSeller('Promo Seller');
    const made = await ctx.createVehicleListing(sellerToken, {
      title: 'Promoted car',
      publish: true,
    });
    listingId = made.listingId;
    vehicleId = made.vehicleId;
  });
  afterAll(() => ctx.close());

  describe('the price list', () => {
    it('is public and prices a car listing by the car price list', async () => {
      const res = await ctx.gql(QUOTE, { t: 'LISTING', id: listingId });
      const quote = res.data.promotionQuote;

      expect(quote.currency).toBe('AZN');
      expect(quote.activeTier).toBeNull();
      expect(quote.bumpsLeft).toBe(0);
      expect(quote.target).toEqual({
        targetType: 'LISTING',
        targetId: listingId,
        title: 'Promoted car',
        href: `/vehicles/${vehicleId}`,
      });

      // Four durations for each of the three tiers.
      expect(quote.packages).toHaveLength(12);
      expect(quote.packages.find((p: any) => p.code === 'vehicle_vip_15d')).toMatchObject({
        tier: 'VIP',
        days: 15,
        bumps: 15,
        bumpsPerDay: 1,
        listAmount: 2500,
        creditAmount: 0,
        amount: 2500,
        recommended: true,
      });
      // Premium bumps three times a day instead of VIP's once.
      expect(quote.packages.find((p: any) => p.code === 'vehicle_premium_5d')).toMatchObject({
        bumps: 15,
        bumpsPerDay: 3,
        amount: 2000,
      });
    });

    it('prices a specialist profile from the cheaper profile list', async () => {
      const masterToken = await ctx.registerUser('Promo Master');
      const specialist = await ctx.gql(
        `mutation($i: CreateSpecialistInput!) { createSpecialist(input: $i) { id } }`,
        {
          i: {
            name: 'Promo Master',
            slug: 'promo-master',
            city: 'Baku',
            skills: [],
            specializations: [],
            experience: 3,
            portfolio: [],
          },
        },
        masterToken,
      );
      const id = specialist.data.createSpecialist.id as string;

      const quote = (await ctx.gql(QUOTE, { t: 'SPECIALIST', id })).data.promotionQuote;
      expect(quote.target.href).toBe('/specialists/promo-master');
      expect(quote.packages.find((p: any) => p.code === 'profile_vip_15d').amount).toBe(1500);

      // A car package cannot be bought for a profile.
      const wrong = await ctx.gql(CREATE, {
        i: { targetType: 'SPECIALIST', targetId: id, packageCode: 'vehicle_vip_15d' },
      });
      expect(wrong.errors?.[0].message).toMatch(/unknown promotion package/i);
    });

    it('refuses to sell placement for a listing that is not published', async () => {
      const draft = await ctx.createVehicleListing(sellerToken, { title: 'Draft car' });
      const res = await ctx.gql(CREATE, {
        i: { targetType: 'LISTING', targetId: draft.listingId, packageCode: 'vehicle_vip_1d' },
      });
      expect(res.errors?.[0].message).toMatch(/published/i);
    });

    it('reports an unknown target instead of quoting for nothing', async () => {
      const res = await ctx.gql(QUOTE, { t: 'LISTING', id: 'no-such-listing' });
      expect(res.errors?.[0].message).toMatch(/not found/i);
    });
  });

  describe('checkout without an account', () => {
    it('lets a visitor who is not signed in pay, and grants only on the callback', async () => {
      const created = await ctx.gql(CREATE, {
        i: {
          targetType: 'LISTING',
          targetId: listingId,
          packageCode: 'vehicle_vip_1d',
          contactEmail: 'guest@example.com',
        },
      });
      const order = created.data.createPromotionOrder;
      expect(order.status).toBe('PENDING');
      expect(order.amount).toBe(500);
      expect(order.payUrl).toContain(`/promote/pay/${order.token}`);

      // Nothing is granted while the order merely exists.
      const before = await ctx.prisma.listing.findUniqueOrThrow({ where: { id: listingId } });
      expect(before.promotionRank).toBe(0);

      await payMock(order.token).expect(200);

      const status = await ctx.gql(ORDER, { t: order.token });
      expect(status.data.promotionOrder.status).toBe('PAID');
      expect(status.data.promotionOrder.paidAt).not.toBeNull();
      // Nothing left to pay, so there is nowhere left to send the buyer.
      expect(status.data.promotionOrder.payUrl).toBeNull();

      const after = await ctx.prisma.listing.findUniqueOrThrow({ where: { id: listingId } });
      expect(after.promotionRank).toBe(1);
      expect(after.promotedUntil!.getTime()).toBeGreaterThan(Date.now());
      // The placement bumps the listing at once: that is what was paid for.
      expect(after.bumpedAt.getTime()).toBeGreaterThan(after.createdAt.getTime());

      const promotion = await ctx.prisma.promotion.findFirstOrThrow({ where: { listingId } });
      expect(promotion).toMatchObject({ tier: 'VIP', active: true, bumpsTotal: 1, bumpsUsed: 1 });
      // One bump a day, and this package carries exactly one, so there is no next one.
      expect(promotion.nextBumpAt).toBeNull();
    });

    it('shows the badge on the card and lifts the listing above newer ones', async () => {
      // Published after the promoted car, so it would come first without the placement.
      await ctx.createVehicleListing(sellerToken, { title: 'Newer car', publish: true });

      const list = await ctx.gql(VEHICLES);
      expect(list.data.vehicles.items[0]).toEqual({ id: vehicleId, promotionTier: 'VIP' });

      const block = await ctx.gql(PROMOTED, { tier: 'VIP' });
      expect(block.data.promotedVehicles.map((v: any) => v.id)).toEqual([vehicleId]);
      // The home page only shows PREMIUM, and this listing is VIP.
      expect((await ctx.gql(PROMOTED, { tier: 'PREMIUM' })).data.promotedVehicles).toEqual([]);
    });

    it('ignores a callback the provider repeats, and one that is not signed', async () => {
      const promotionsBefore = await ctx.prisma.promotion.count({ where: { listingId } });
      const payment = await ctx.prisma.payment.findFirstOrThrow({ orderBy: { createdAt: 'desc' } });
      const order = await ctx.prisma.promotionOrder.findUniqueOrThrow({
        where: { id: payment.orderId },
      });

      const body = JSON.stringify({
        reference: order.token,
        providerPaymentId: payment.providerPaymentId,
        status: 'paid',
        amount: order.amount,
        currency: 'AZN',
      });

      // Same payment id as before: the provider is only retrying.
      await request(ctx.app.getHttpServer())
        .post('/payments/mock/callback')
        .set('x-avtobaz-signature', sign(body, 'dev-mock-secret'))
        .set('content-type', 'application/json')
        .send(body)
        .expect(200);

      // A new payment id, but signed with the wrong key.
      const forged = body.replace(payment.providerPaymentId, 'forged-1');
      await request(ctx.app.getHttpServer())
        .post('/payments/mock/callback')
        .set('x-avtobaz-signature', sign(forged, 'not-the-secret'))
        .set('content-type', 'application/json')
        .send(forged)
        .expect(400);

      expect(await ctx.prisma.promotion.count({ where: { listingId } })).toBe(promotionsBefore);
    });

    it('grants nothing when the amount paid is not the amount owed', async () => {
      const created = await ctx.gql(CREATE, {
        i: { targetType: 'LISTING', targetId: listingId, packageCode: 'vehicle_bump_1x' },
      });
      const token = created.data.createPromotionOrder.token as string;

      const body = JSON.stringify({
        reference: token,
        providerPaymentId: 'underpaid-1',
        status: 'paid',
        amount: 1,
        currency: 'AZN',
      });
      await request(ctx.app.getHttpServer())
        .post('/payments/mock/callback')
        .set('x-avtobaz-signature', sign(body, 'dev-mock-secret'))
        .set('content-type', 'application/json')
        .send(body)
        .expect(400);

      const order = await ctx.prisma.promotionOrder.findUniqueOrThrow({ where: { token } });
      expect(order.status).toBe('PENDING');
      // The attempt is still on file, so support can see the money that arrived.
      expect(await ctx.prisma.payment.count({ where: { providerPaymentId: 'underpaid-1' } })).toBe(1);
    });

    it('marks a failed card as failed and leaves the listing alone', async () => {
      const rankBefore = (await ctx.prisma.listing.findUniqueOrThrow({ where: { id: listingId } }))
        .promotionRank;
      const created = await ctx.gql(CREATE, {
        i: { targetType: 'LISTING', targetId: listingId, packageCode: 'vehicle_premium_1d' },
      });
      const token = created.data.createPromotionOrder.token as string;
      await payMock(token, 'failed').expect(200);

      expect((await ctx.gql(ORDER, { t: token })).data.promotionOrder.status).toBe('FAILED');
      expect(
        (await ctx.prisma.listing.findUniqueOrThrow({ where: { id: listingId } })).promotionRank,
      ).toBe(rankBefore);
    });

    it('stops taking payment for an order the buyer left too long', async () => {
      const created = await ctx.gql(CREATE, {
        i: { targetType: 'LISTING', targetId: listingId, packageCode: 'vehicle_bump_3x' },
      });
      const token = created.data.createPromotionOrder.token as string;
      await ctx.prisma.promotionOrder.update({
        where: { token },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });

      const status = await ctx.gql(ORDER, { t: token });
      expect(status.data.promotionOrder.status).toBe('EXPIRED');
      expect(status.data.promotionOrder.payUrl).toBeNull();
    });
  });

  describe('upgrading', () => {
    let upgradeListing: string;

    beforeAll(async () => {
      const made = await ctx.createVehicleListing(sellerToken, {
        title: 'Upgrade car',
        publish: true,
      });
      upgradeListing = made.listingId;
      await buy('LISTING', upgradeListing, 'vehicle_vip_30d');
    });

    it('takes the unused days of the VIP off the price of the PREMIUM', async () => {
      const quote = (await ctx.gql(QUOTE, { t: 'LISTING', id: upgradeListing })).data.promotionQuote;
      expect(quote.activeTier).toBe('VIP');

      // Thirty days of VIP cost 40 AZN and none of them has been used yet, so nearly
      // all of it comes off; a package is never free, so 1 AZN is still charged.
      const premium = quote.packages.find((p: any) => p.code === 'vehicle_premium_30d');
      expect(premium.listAmount).toBe(6000);
      expect(premium.creditAmount).toBeGreaterThan(3900);
      expect(premium.amount).toBe(premium.listAmount - premium.creditAmount);

      // A cheaper tier is not discounted by a dearer one, and VIP does not discount VIP.
      expect(quote.packages.find((p: any) => p.code === 'vehicle_vip_30d').creditAmount).toBe(0);
      expect(quote.packages.find((p: any) => p.code === 'vehicle_bump_5x').creditAmount).toBe(0);
    });

    it('retires the old placement when the upgrade is paid for', async () => {
      await buy('LISTING', upgradeListing, 'vehicle_premium_15d');

      const promos = await ctx.prisma.promotion.findMany({
        where: { listingId: upgradeListing },
        orderBy: { startsAt: 'asc' },
      });
      expect(promos.map((p) => [p.tier, p.active, p.endedReason])).toEqual([
        ['VIP', false, 'upgraded'],
        ['PREMIUM', true, null],
      ]);

      const listing = await ctx.prisma.listing.findUniqueOrThrow({ where: { id: upgradeListing } });
      expect(listing.promotionRank).toBe(2);

      const home = await ctx.gql(PROMOTED, { tier: 'PREMIUM' });
      expect(home.data.promotedVehicles).toHaveLength(1);
      expect(home.data.promotedVehicles[0].promotionTier).toBe('PREMIUM');
    });
  });

  describe('the clock', () => {
    let clockListing: string;

    beforeAll(async () => {
      const made = await ctx.createVehicleListing(sellerToken, {
        title: 'Clock car',
        publish: true,
      });
      clockListing = made.listingId;
      await buy('LISTING', clockListing, 'vehicle_vip_5d');
    });

    it('spends the next bump when its slot comes round', async () => {
      const before = await ctx.prisma.promotion.findFirstOrThrow({
        where: { listingId: clockListing },
      });
      expect(before.bumpsUsed).toBe(1);
      expect(before.nextBumpAt).not.toBeNull();

      await promotions.runDueWork(new Date(before.nextBumpAt!.getTime() + 1000));

      const after = await ctx.prisma.promotion.findUniqueOrThrow({ where: { id: before.id } });
      expect(after.bumpsUsed).toBe(2);
      expect(after.nextBumpAt!.getTime()).toBeGreaterThan(before.nextBumpAt!.getTime());

      const listing = await ctx.prisma.listing.findUniqueOrThrow({ where: { id: clockListing } });
      expect(listing.bumpedAt.getTime()).toBe(before.nextBumpAt!.getTime() + 1000);
    });

    it('bumps in the morning, at midday and in the evening, Baku time', async () => {
      const premium = await ctx.prisma.promotion.findFirstOrThrow({
        where: { tier: 'PREMIUM', active: true },
      });
      // Baku is UTC+4 all year, so 09:00, 13:00 and 19:00 there are 05, 09 and 15 UTC.
      expect([5, 9, 15]).toContain(premium.nextBumpAt!.getUTCHours());
      expect(premium.nextBumpAt!.getUTCMinutes()).toBe(0);
    });

    it('ends a placement when its last day is over and drops it from the block', async () => {
      const promotion = await ctx.prisma.promotion.findFirstOrThrow({
        where: { listingId: clockListing },
      });
      await promotions.runDueWork(new Date(promotion.endsAt.getTime() + 1000));

      const ended = await ctx.prisma.promotion.findUniqueOrThrow({ where: { id: promotion.id } });
      expect(ended).toMatchObject({ active: false, endedReason: 'expired' });

      const listing = await ctx.prisma.listing.findUniqueOrThrow({ where: { id: clockListing } });
      expect(listing.promotionRank).toBe(0);
      expect(listing.promotedUntil).toBeNull();

      const block = await ctx.gql(PROMOTED, { tier: 'VIP' });
      expect(block.data.promotedVehicles.map((v: any) => v.id)).not.toContain(clockListing);
    });

    it('closes an order nobody paid for', async () => {
      const created = await ctx.gql(CREATE, {
        i: { targetType: 'LISTING', targetId: listingId, packageCode: 'vehicle_bump_1x' },
      });
      const token = created.data.createPromotionOrder.token as string;
      await promotions.runDueWork(new Date(Date.now() + 60 * 60 * 1000));
      expect((await ctx.prisma.promotionOrder.findUniqueOrThrow({ where: { token } })).status).toBe(
        'EXPIRED',
      );
    });
  });

  describe('what the money bought', () => {
    it('counts the views and contacts collected, once per visitor', async () => {
      const made = await ctx.createVehicleListing(sellerToken, {
        title: 'Counted car',
        publish: true,
      });
      await buy('LISTING', made.listingId, 'vehicle_vip_5d');

      const track = (field: string) =>
        ctx.gql(`mutation($id: String!) { ${field}(targetType: LISTING, targetId: $id) }`, {
          id: made.listingId,
        });
      expect((await track('trackPromotionView')).data.trackPromotionView).toBe(true);
      // The same visitor reloading the page does not count again.
      expect((await track('trackPromotionView')).data.trackPromotionView).toBe(false);
      expect((await track('trackPromotionContact')).data.trackPromotionContact).toBe(true);

      const mine = await ctx.gql(MY, undefined, sellerToken);
      const row = mine.data.myPromotions.find((p: any) => p.target.targetId === made.listingId);
      expect(row).toMatchObject({ tier: 'VIP', active: true, viewsGained: 1, contactsGained: 1 });
    });

    it('shows a seller only their own promotions', async () => {
      const stranger = await ctx.registerUser('Nosey');
      expect((await ctx.gql(MY, undefined, stranger)).data.myPromotions).toEqual([]);
      expect((await ctx.gql(MY)).errors?.[0].message).toMatch(/unauthorized/i);
    });
  });

  describe('moderation and administrators', () => {
    let admin: string;

    beforeAll(async () => {
      admin = await ctx.registerUser('Promo admin');
      await ctx.prisma.user.updateMany({
        where: { email: { startsWith: 'promo-admin' } },
        data: { role: 'ADMIN' },
      });
    });

    it('ends placement when a moderator blocks the listing, and refunds nothing', async () => {
      const made = await ctx.createVehicleListing(sellerToken, { title: 'Bad car', publish: true });
      await buy('LISTING', made.listingId, 'vehicle_premium_15d');

      const blocked = await ctx.gql(
        `mutation($id: String!) { blockListing(listingId: $id, reason: "forbidden goods") }`,
        { id: made.listingId },
        admin,
      );
      expect(blocked.data.blockListing).toBe(true);

      const promotion = await ctx.prisma.promotion.findFirstOrThrow({
        where: { listingId: made.listingId },
      });
      expect(promotion).toMatchObject({ active: false, endedReason: 'target_blocked' });
      const listing = await ctx.prisma.listing.findUniqueOrThrow({ where: { id: made.listingId } });
      expect(listing.promotionRank).toBe(0);
    });

    it('lets an administrator give a placement away and take it back', async () => {
      const made = await ctx.createVehicleListing(sellerToken, {
        title: 'Gifted car',
        publish: true,
      });
      const granted = await ctx.gql(
        `mutation($id: String!) {
          grantPromotion(targetType: LISTING, targetId: $id, tier: VIP, days: 7)
        }`,
        { id: made.listingId },
        admin,
      );
      expect(granted.data.grantPromotion).toBe(true);

      const list = await ctx.gql(
        `{ adminPromotions(activeOnly: true) { id tier active amount paid target { targetId } } }`,
        undefined,
        admin,
      );
      const row = list.data.adminPromotions.find((p: any) => p.target.targetId === made.listingId);
      expect(row).toMatchObject({ tier: 'VIP', active: true, amount: 0, paid: false });

      const revoked = await ctx.gql(
        `mutation($id: String!) { revokePromotion(id: $id) }`,
        { id: row.id },
        admin,
      );
      expect(revoked.data.revokePromotion).toBe(true);
      const listing = await ctx.prisma.listing.findUniqueOrThrow({ where: { id: made.listingId } });
      expect(listing.promotionRank).toBe(0);
    });

    it('keeps the administrator tools away from everyone else', async () => {
      expect((await ctx.gql(`{ adminPromotions { id } }`)).errors?.[0].message).toMatch(
        /unauthorized/i,
      );
      expect(
        (await ctx.gql(`{ adminPromotions { id } }`, undefined, sellerToken)).errors?.[0].message,
      ).toMatch(/administrator/i);
      expect(
        (
          await ctx.gql(
            `mutation($id: String!) {
              grantPromotion(targetType: LISTING, targetId: $id, tier: PREMIUM, days: 30)
            }`,
            { id: listingId },
            sellerToken,
          )
        ).errors?.[0].message,
      ).toMatch(/administrator/i);
    });
  });
});
