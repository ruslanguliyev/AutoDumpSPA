import { createTestContext, TestContext } from './helpers';

describe('auth', () => {
  let ctx: TestContext;
  beforeAll(async () => {
    ctx = await createTestContext();
  });
  afterAll(() => ctx.close());

  const REGISTER = `mutation($e: String!, $p: String!, $f: String!) {
    register(email: $e, password: $p, fullName: $f) { accessToken user { id email role } }
  }`;
  const LOGIN = `mutation($e: String!, $p: String!) {
    login(email: $e, password: $p) { accessToken user { email } }
  }`;

  it('registers a user with the default USER role and never returns the password hash', async () => {
    const res = await ctx.gql(REGISTER, { e: 'a@test.local', p: 'Passw0rd!x', f: 'Alice' });
    expect(res.errors).toBeUndefined();
    expect(res.data.register.accessToken).toEqual(expect.any(String));
    expect(res.data.register.user).toMatchObject({ email: 'a@test.local', role: 'USER' });
    expect(JSON.stringify(res.data)).not.toMatch(/passwordHash/i);
  });

  it('rejects a duplicate email', async () => {
    await ctx.gql(REGISTER, { e: 'dup@test.local', p: 'Passw0rd!x', f: 'Dup' });
    const res = await ctx.gql(REGISTER, { e: 'dup@test.local', p: 'Passw0rd!x', f: 'Dup 2' });
    expect(res.errors?.[0].message).toMatch(/already exists/i);
  });

  it('logs in with the right password and rejects the wrong one', async () => {
    await ctx.gql(REGISTER, { e: 'login@test.local', p: 'Passw0rd!x', f: 'Login' });
    const good = await ctx.gql(LOGIN, { e: 'login@test.local', p: 'Passw0rd!x' });
    expect(good.data.login.accessToken).toEqual(expect.any(String));

    const bad = await ctx.gql(LOGIN, { e: 'login@test.local', p: 'wrong' });
    expect(bad.errors?.[0].message).toMatch(/invalid email or password/i);
    const unknown = await ctx.gql(LOGIN, { e: 'nobody@test.local', p: 'Passw0rd!x' });
    expect(unknown.errors?.[0].message).toMatch(/invalid email or password/i);
  });

  it('protects `me` and returns the current user for a valid token', async () => {
    const anon = await ctx.gql('{ me { email } }');
    expect(anon.errors).toBeDefined();

    const invalid = await ctx.gql('{ me { email } }', undefined, 'not-a-token');
    expect(invalid.errors).toBeDefined();

    const token = await ctx.registerUser('Me');
    const res = await ctx.gql('{ me { fullName } }', undefined, token);
    expect(res.data.me.fullName).toBe('Me');
  });

  describe('input validation', () => {
    it.each([
      ['not-an-email', 'Passw0rd!x', 'Name', /invalid email/i],
      ['a@b', 'Passw0rd!x', 'Name', /invalid email/i],
      ['ok1@test.local', '1234567', 'Name', /at least 8/i],
      ['ok2@test.local', 'x'.repeat(73), 'Name', /at most 72/i],
      ['ok3@test.local', 'Passw0rd!x', '   ', /full name is required/i],
    ])('rejects %s / %s / %s', async (e, p, f, message) => {
      const res = await ctx.gql(REGISTER, { e, p, f });
      expect(res.errors?.[0].message).toMatch(message);
      expect(res.data).toBeNull();
    });

    it('treats emails case-insensitively and normalises them', async () => {
      const first = await ctx.gql(REGISTER, { e: '  MiXeD@Test.Local ', p: 'Passw0rd!x', f: ' Mixed ' });
      expect(first.data.register.user.email).toBe('mixed@test.local');

      const dup = await ctx.gql(REGISTER, { e: 'MIXED@test.local', p: 'Passw0rd!x', f: 'Again' });
      expect(dup.errors?.[0].message).toMatch(/already exists/i);

      const login = await ctx.gql(LOGIN, { e: 'MIXED@TEST.LOCAL', p: 'Passw0rd!x' });
      expect(login.data.login.user.email).toBe('mixed@test.local');
    });
  });

  describe('brute-force protection', () => {
    it('blocks an account after 10 failed logins, even with the right password', async () => {
      await ctx.gql(REGISTER, { e: 'victim@test.local', p: 'Passw0rd!x', f: 'Victim' });

      for (let i = 0; i < 10; i += 1) {
        const res = await ctx.gql(LOGIN, { e: 'victim@test.local', p: `wrong-${i}` });
        expect(res.errors?.[0].message).toMatch(/invalid email or password/i);
      }

      const blocked = await ctx.gql(LOGIN, { e: 'victim@test.local', p: 'Passw0rd!x' });
      expect(blocked.errors?.[0].message).toMatch(/too many failed login attempts/i);

      // other accounts are not affected
      await ctx.gql(REGISTER, { e: 'bystander@test.local', p: 'Passw0rd!x', f: 'Bystander' });
      const ok = await ctx.gql(LOGIN, { e: 'bystander@test.local', p: 'Passw0rd!x' });
      expect(ok.data.login.accessToken).toEqual(expect.any(String));
    });

    it('resets the failure counter after a successful login', async () => {
      await ctx.gql(REGISTER, { e: 'forgetful@test.local', p: 'Passw0rd!x', f: 'Forgetful' });
      for (let round = 0; round < 3; round += 1) {
        for (let i = 0; i < 8; i += 1) {
          await ctx.gql(LOGIN, { e: 'forgetful@test.local', p: 'nope' });
        }
        const ok = await ctx.gql(LOGIN, { e: 'forgetful@test.local', p: 'Passw0rd!x' });
        expect(ok.data.login.accessToken).toEqual(expect.any(String));
      }
    });
  });
});
