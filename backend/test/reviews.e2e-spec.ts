import { createTestContext, TestContext } from './helpers';

describe('reviews', () => {
  let ctx: TestContext;
  let sellerToken: string;
  let sellerId: string;
  let specialistToken: string;
  let specialistId: string;
  let alice: string;
  let bob: string;

  const SUBMIT = `mutation($i: SubmitReviewInput!) { submitReview(input: $i) { id rating comment authorName mine } }`;
  const LIST = `query($t: ReviewTargetType!, $id: String!, $l: Int, $o: Int) {
    reviews(targetType: $t, targetId: $id, limit: $l, offset: $o) {
      total average distribution items { id rating comment authorName mine }
    }
  }`;
  const SELLER_STATS = `query($id: String!) { sellerById(id: $id) { rating reviewsCount } }`;
  const SPECIALIST_STATS = `query($s: String!) { specialistBySlug(slug: $s) { rating reviewsCount } }`;

  const review = (token: string, rating: number, comment?: string, target = { type: 'SELLER', id: () => sellerId }) =>
    ctx.gql(SUBMIT, { i: { targetType: target.type, targetId: target.id(), rating, comment } }, token);

  beforeAll(async () => {
    ctx = await createTestContext();
    sellerToken = await ctx.registerSeller('Review seller', '+994 50 111 22 33');
    sellerId = (await ctx.gql(`{ mySeller { id } }`, undefined, sellerToken)).data.mySeller.id;
    alice = await ctx.registerUser('Alice Johnson');
    bob = await ctx.registerUser('Bob');

    specialistToken = await ctx.registerUser('Master Mike');
    const created = await ctx.gql(
      `mutation($i: CreateSpecialistInput!) { createSpecialist(input: $i) { id } }`,
      { i: { name: 'Master Mike', slug: 'master-mike', city: 'Baku', skills: ['engine'], specializations: ['engine'], experience: 5, portfolio: [] } },
      specialistToken,
    );
    if (!created.data) throw new Error(JSON.stringify(created.errors));
    specialistId = created.data.createSpecialist.id;
  });
  afterAll(() => ctx.close());

  it('requires a signed-in user to write a review', async () => {
    const res = await review('', 5, 'nice');
    expect(res.errors?.[0].message).toMatch(/unauthorized/i);
  });

  it('validates the rating and the comment length', async () => {
    expect((await review(alice, 0)).errors?.[0].message).toMatch(/1 to 5/);
    expect((await review(alice, 6)).errors?.[0].message).toMatch(/1 to 5/);
    expect((await review(alice, 5, 'x'.repeat(1001))).errors?.[0].message).toMatch(/at most/);
  });

  it('does not let owners review themselves', async () => {
    const res = await review(sellerToken, 5, 'I am great');
    expect(res.errors?.[0].message).toMatch(/yourself/);
  });

  it('rejects an unknown profile', async () => {
    const res = await ctx.gql(SUBMIT, { i: { targetType: 'SELLER', targetId: 'nope', rating: 5 } }, alice);
    expect(res.errors?.[0].message).toMatch(/not found/i);
  });

  it('stores a review, shortens the author name and updates the seller rating', async () => {
    const res = await review(alice, 5, '  Great seller  ');
    expect(res.data.submitReview).toMatchObject({ rating: 5, comment: 'Great seller', authorName: 'Alice J.', mine: true });

    const stats = await ctx.gql(SELLER_STATS, { id: sellerId });
    expect(stats.data.sellerById).toEqual({ rating: 5, reviewsCount: 1 });
  });

  it('replaces the same author\'s earlier review instead of adding another', async () => {
    await review(alice, 3, 'Changed my mind');
    const list = await ctx.gql(LIST, { t: 'SELLER', id: sellerId });
    expect(list.data.reviews.total).toBe(1);
    expect(list.data.reviews.items[0]).toMatchObject({ rating: 3, comment: 'Changed my mind' });
  });

  it('averages several reviews and reports the distribution', async () => {
    await review(bob, 4);
    const list = await ctx.gql(LIST, { t: 'SELLER', id: sellerId });
    expect(list.data.reviews).toMatchObject({ total: 2, average: 3.5, distribution: [0, 0, 1, 1, 0] });
    const stats = await ctx.gql(SELLER_STATS, { id: sellerId });
    expect(stats.data.sellerById).toEqual({ rating: 3.5, reviewsCount: 2 });
  });

  it('marks only the viewer\'s own review as mine and paginates', async () => {
    const anonymous = await ctx.gql(LIST, { t: 'SELLER', id: sellerId });
    expect(anonymous.data.reviews.items.every((i: { mine: boolean }) => i.mine === false)).toBe(true);

    const asBob = await ctx.gql(LIST, { t: 'SELLER', id: sellerId }, bob);
    expect(asBob.data.reviews.items.filter((i: { mine: boolean }) => i.mine)).toHaveLength(1);

    const page = await ctx.gql(LIST, { t: 'SELLER', id: sellerId, l: 1, o: 1 });
    expect(page.data.reviews.items).toHaveLength(1);
    expect(page.data.reviews.total).toBe(2);
  });

  it('works for specialists too', async () => {
    const target = { type: 'SPECIALIST', id: () => specialistId };
    expect((await review(specialistToken, 5, 'me', target)).errors?.[0].message).toMatch(/yourself/);
    expect((await review(alice, 5, 'Fixed my engine', target)).data.submitReview.rating).toBe(5);
    const stats = await ctx.gql(SPECIALIST_STATS, { s: 'master-mike' });
    expect(stats.data.specialistBySlug).toEqual({ rating: 5, reviewsCount: 1 });
  });

  it('lets only the author or an admin delete a review, and recalculates the rating', async () => {
    const list = await ctx.gql(LIST, { t: 'SELLER', id: sellerId }, bob);
    const bobs = list.data.reviews.items.find((i: { mine: boolean }) => i.mine).id;
    const DELETE = `mutation($id: String!) { deleteReview(id: $id) }`;

    expect((await ctx.gql(DELETE, { id: bobs }, alice)).errors?.[0].message).toMatch(/own review/);
    expect((await ctx.gql(DELETE, { id: bobs }, bob)).data.deleteReview).toBe(true);

    const stats = await ctx.gql(SELLER_STATS, { id: sellerId });
    expect(stats.data.sellerById).toEqual({ rating: 3, reviewsCount: 1 });

    // An admin can remove someone else's review.
    const adminToken = await ctx.registerUser('Admin');
    const adminEmail = (await ctx.gql(`{ me { email } }`, undefined, adminToken)).data.me.email;
    await ctx.prisma.user.update({ where: { email: adminEmail }, data: { role: 'ADMIN' } });
    const alices = (await ctx.gql(LIST, { t: 'SELLER', id: sellerId }, alice)).data.reviews.items[0].id;
    expect((await ctx.gql(DELETE, { id: alices }, adminToken)).data.deleteReview).toBe(true);
    const empty = await ctx.gql(SELLER_STATS, { id: sellerId });
    expect(empty.data.sellerById).toEqual({ rating: 0, reviewsCount: 0 });
  });
});
