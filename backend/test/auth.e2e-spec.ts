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
});
