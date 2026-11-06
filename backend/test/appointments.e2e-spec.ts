import { formatDay, parseDay, todayString } from '../src/rentals/rentals.service';
import { createTestContext, TestContext } from './helpers';

const day = (offset: number): string =>
  formatDay(new Date(parseDay(todayString(), 'today').getTime() + offset * 86_400_000));

describe('appointments and profile registration', () => {
  let ctx: TestContext;
  let masterToken: string;
  let masterId: string;
  let centerToken: string;
  let centerId: string;
  let customer: string;
  let other: string;

  const REQUEST = `mutation($i: RequestAppointmentInput!) {
    requestAppointment(input: $i) { id status date time vehicle message phone targetType targetId targetName targetPhone customerName customerEmail }
  }`;
  const DECIDE = `mutation($id: String!, $c: Boolean!) { decideAppointment(id: $id, confirm: $c) { id status targetPhone } }`;
  const CANCEL = `mutation($id: String!) { cancelAppointment(id: $id) { id status } }`;
  const ask = (token: string | undefined, over: Record<string, unknown> = {}) =>
    ctx.gql(
      REQUEST,
      { i: { targetType: 'SPECIALIST', targetId: masterId, date: day(3), phone: '+994 50 123 45 67', ...over } },
      token,
    );

  beforeAll(async () => {
    ctx = await createTestContext();
    customer = await ctx.registerUser('Customer');
    other = await ctx.registerUser('Other customer');

    masterToken = await ctx.registerUser('Master');
    const m = await ctx.gql(
      `mutation($i: CreateSpecialistInput!) { createSpecialist(input: $i) { id verified } }`,
      { i: { name: 'Master', slug: 'master-appt', city: 'Baku', phone: '+994 55 000 11 22', skills: [], specializations: [], experience: 3, portfolio: [] } },
      masterToken,
    );
    masterId = m.data.createSpecialist.id;

    centerToken = await ctx.registerUser('Garage');
    const c = await ctx.gql(
      `mutation($i: CreateServiceCenterInput!) { createServiceCenter(input: $i) { id verified } }`,
      { i: { name: 'Garage', city: 'Baku', categories: ['engine'], phone: '+994 12 345 67 89' } },
      centerToken,
    );
    centerId = c.data.createServiceCenter.id;
  });
  afterAll(() => ctx.close());

  it('cannot be verified by the owner themselves', async () => {
    // `verified` is not part of the input any more, so sending it is a validation error.
    const res = await ctx.gql(
      `mutation($i: CreateServiceCenterInput!) { createServiceCenter(input: $i) { id } }`,
      { i: { name: 'Fake', city: 'Baku', categories: [], verified: true } },
      await ctx.registerUser('Faker'),
    );
    expect(res.errors?.[0].message).toMatch(/verified/);
    const created = await ctx.gql(`{ myServiceCenter { verified } }`, undefined, centerToken);
    expect(created.data.myServiceCenter.verified).toBe(false);
  });

  it('rejects garbage phone numbers on profiles', async () => {
    const res = await ctx.gql(
      `mutation($i: CreateSpecialistInput!) { createSpecialist(input: $i) { id } }`,
      { i: { name: 'Bad', slug: 'bad-phone', city: 'Baku', phone: 'call me!', skills: [], specializations: [], experience: 1, portfolio: [] } },
      await ctx.registerUser('Badphone'),
    );
    expect(res.errors?.[0].message).toMatch(/phone/i);
  });

  it('keeps the administrator role when an admin creates a profile', async () => {
    const adminToken = await ctx.registerUser('Boss');
    const email = (await ctx.gql(`{ me { email } }`, undefined, adminToken)).data.me.email;
    await ctx.prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
    await ctx.gql(
      `mutation($i: CreateSpecialistInput!) { createSpecialist(input: $i) { id } }`,
      { i: { name: 'Boss', slug: 'boss-spec', city: 'Baku', skills: [], specializations: [], experience: 1, portfolio: [] } },
      adminToken,
    );
    const me = await ctx.gql(`{ me { role } }`, undefined, adminToken);
    expect(me.data.me.role).toBe('ADMIN');
  });

  it('requires sign-in and a valid request', async () => {
    expect((await ask(undefined)).errors?.[0].message).toMatch(/unauthorized/i);
    expect((await ask(customer, { date: day(-1) })).errors?.[0].message).toMatch(/past/);
    expect((await ask(customer, { date: day(200) })).errors?.[0].message).toMatch(/within/);
    expect((await ask(customer, { date: '2026-02-31' })).errors?.[0].message).toMatch(/valid date/);
    expect((await ask(customer, { time: '25:00' })).errors?.[0].message).toMatch(/Time/);
    expect((await ask(customer, { phone: 'abc' })).errors?.[0].message).toMatch(/phone/i);
    expect((await ask(customer, { phone: '' })).errors?.[0].message).toMatch(/phone/i);
    expect((await ask(customer, { targetType: 'SELLER' })).errors?.[0].message).toMatch(/specialists and service/);
    expect((await ask(customer, { targetId: 'nope' })).errors?.[0].message).toMatch(/not found/);
  });

  it('does not let owners book themselves', async () => {
    expect((await ask(masterToken)).errors?.[0].message).toMatch(/yourself/);
  });

  it('creates a request, hides the owner phone until confirmation, and blocks a second pending one', async () => {
    const res = await ask(customer, { time: '14:30', vehicle: ' BMW X5 2018 ', message: ' brakes squeak ' });
    expect(res.data.requestAppointment).toMatchObject({
      status: 'PENDING', time: '14:30', vehicle: 'BMW X5 2018', message: 'brakes squeak',
      targetType: 'SPECIALIST', targetName: 'Master', targetPhone: null, customerName: 'Customer',
    });
    expect((await ask(customer)).errors?.[0].message).toMatch(/already have a pending/);

    const owner = await ctx.gql(`{ incomingAppointments { id status phone customerName } pendingAppointmentsCount }`, undefined, masterToken);
    expect(owner.data.incomingAppointments).toHaveLength(1);
    expect(owner.data.pendingAppointmentsCount).toBe(1);

    const stranger = await ctx.gql(`{ incomingAppointments { id } }`, undefined, other);
    expect(stranger.data.incomingAppointments).toEqual([]);
  });

  it('lets only the owner answer, and reveals the phone after confirmation', async () => {
    const id = (await ctx.gql(`{ myAppointments { id } }`, undefined, customer)).data.myAppointments[0].id;
    expect((await ctx.gql(DECIDE, { id, c: true }, customer)).errors?.[0].message).toMatch(/owner/);
    expect((await ctx.gql(DECIDE, { id, c: true }, other)).errors?.[0].message).toMatch(/owner/);

    const confirmed = await ctx.gql(DECIDE, { id, c: true }, masterToken);
    expect(confirmed.data.decideAppointment).toEqual({ id, status: 'CONFIRMED', targetPhone: '+994 55 000 11 22' });
    expect((await ctx.gql(DECIDE, { id, c: false }, masterToken)).errors?.[0].message).toMatch(/already been answered/);

    const count = await ctx.gql(`{ pendingAppointmentsCount }`, undefined, masterToken);
    expect(count.data.pendingAppointmentsCount).toBe(0);
  });

  it('allows cancelling by the customer or the owner, not by strangers', async () => {
    const id = (await ctx.gql(`{ myAppointments { id } }`, undefined, customer)).data.myAppointments[0].id;
    expect((await ctx.gql(CANCEL, { id }, other)).errors?.[0].message).toMatch(/cannot cancel/);
    expect((await ctx.gql(CANCEL, { id }, customer)).data.cancelAppointment.status).toBe('CANCELLED');
    expect((await ctx.gql(CANCEL, { id }, customer)).errors?.[0].message).toMatch(/no longer/);
  });

  it('works for service centers and respects availability', async () => {
    const res = await ask(customer, { targetType: 'SERVICE_CENTER', targetId: centerId });
    expect(res.data.requestAppointment).toMatchObject({ targetType: 'SERVICE_CENTER', targetName: 'Garage' });
    const id = res.data.requestAppointment.id;
    const declined = await ctx.gql(DECIDE, { id, c: false }, centerToken);
    expect(declined.data.decideAppointment.status).toBe('DECLINED');

    await ctx.gql(`mutation { updateSpecialist(input: { available: false }) { id } }`, undefined, masterToken);
    expect((await ask(other)).errors?.[0].message).toMatch(/not accepting/);
  });
});
