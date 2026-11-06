import { createTestContext, TestContext } from './helpers';

describe('profile verification by administrators', () => {
  let ctx: TestContext;
  let admin: string;
  let user: string;
  let sellerId: string;
  let specialistId: string;
  let centerId: string;

  const LIST = `query($t: ReviewTargetType!, $s: String) { adminProfiles(targetType: $t, search: $s) { id name verified targetType slug } }`;
  const SET = `mutation($t: ReviewTargetType!, $id: String!, $v: Boolean!) { setProfileVerified(targetType: $t, targetId: $id, verified: $v) }`;

  beforeAll(async () => {
    ctx = await createTestContext();
    const sellerToken = await ctx.registerSeller('Verify Seller');
    sellerId = (await ctx.gql(`{ mySeller { id } }`, undefined, sellerToken)).data.mySeller.id;

    const masterToken = await ctx.registerUser('Verify Master');
    specialistId = (
      await ctx.gql(
        `mutation($i: CreateSpecialistInput!) { createSpecialist(input: $i) { id } }`,
        { i: { name: 'Verify Master', slug: 'verify-master', city: 'Baku', skills: [], specializations: [], experience: 1, portfolio: [] } },
        masterToken,
      )
    ).data.createSpecialist.id;

    const centerToken = await ctx.registerUser('Verify Garage');
    centerId = (
      await ctx.gql(
        `mutation($i: CreateServiceCenterInput!) { createServiceCenter(input: $i) { id } }`,
        { i: { name: 'Verify Garage', city: 'Baku', categories: [] } },
        centerToken,
      )
    ).data.createServiceCenter.id;

    user = await ctx.registerUser('Plain user');
    admin = await ctx.registerUser('Verify admin');
    await ctx.prisma.user.updateMany({ where: { email: { startsWith: 'verify-admin' } }, data: { role: 'ADMIN' } });
  });
  afterAll(() => ctx.close());

  it('is closed to anonymous visitors and ordinary users', async () => {
    expect((await ctx.gql(LIST, { t: 'SPECIALIST' })).errors?.[0].message).toMatch(/unauthorized/i);
    expect((await ctx.gql(LIST, { t: 'SPECIALIST' }, user)).errors?.[0].message).toMatch(/administrator/i);
    expect((await ctx.gql(SET, { t: 'SPECIALIST', id: specialistId, v: true }, user)).errors?.[0].message).toMatch(/administrator/i);
  });

  it('lists profiles of each kind and filters by name', async () => {
    const specialists = await ctx.gql(LIST, { t: 'SPECIALIST' }, admin);
    expect(specialists.data.adminProfiles).toEqual([
      { id: specialistId, name: 'Verify Master', verified: false, targetType: 'SPECIALIST', slug: 'verify-master' },
    ]);
    expect((await ctx.gql(LIST, { t: 'SERVICE_CENTER' }, admin)).data.adminProfiles[0].id).toBe(centerId);
    expect((await ctx.gql(LIST, { t: 'SELLER' }, admin)).data.adminProfiles[0].id).toBe(sellerId);
    expect((await ctx.gql(LIST, { t: 'SELLER', s: 'nobody' }, admin)).data.adminProfiles).toEqual([]);
    expect((await ctx.gql(LIST, { t: 'SELLER', s: 'verify sel' }, admin)).data.adminProfiles).toHaveLength(1);
  });

  it('verifies and un-verifies, and the public profile reflects it', async () => {
    for (const [type, id] of [['SELLER', sellerId], ['SPECIALIST', specialistId], ['SERVICE_CENTER', centerId]] as const) {
      expect((await ctx.gql(SET, { t: type, id, v: true }, admin)).data.setProfileVerified).toBe(true);
      expect((await ctx.gql(LIST, { t: type }, admin)).data.adminProfiles[0].verified).toBe(true);
    }
    const publicSpecialist = await ctx.gql(`{ specialistBySlug(slug: "verify-master") { verified } }`);
    expect(publicSpecialist.data.specialistBySlug.verified).toBe(true);

    await ctx.gql(SET, { t: 'SPECIALIST', id: specialistId, v: false }, admin);
    const again = await ctx.gql(`{ specialistBySlug(slug: "verify-master") { verified } }`);
    expect(again.data.specialistBySlug.verified).toBe(false);
  });

  it('reports an unknown profile', async () => {
    expect((await ctx.gql(SET, { t: 'SELLER', id: 'nope', v: true }, admin)).errors?.[0].message).toMatch(/not found/i);
  });
});
