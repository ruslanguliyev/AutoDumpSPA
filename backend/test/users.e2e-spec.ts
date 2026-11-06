import { createTestContext, TestContext } from './helpers';

describe('account settings', () => {
  let ctx: TestContext;
  beforeAll(async () => {
    ctx = await createTestContext();
  });
  afterAll(() => ctx.close());

  const UPDATE = `mutation($n: String!) { updateProfile(input: { fullName: $n }) { fullName email } }`;
  const CHANGE = `mutation($c: String!, $n: String!) { changePassword(input: { currentPassword: $c, newPassword: $n }) }`;
  const LOGIN = `mutation($e: String!, $p: String!) { login(email: $e, password: $p) { accessToken } }`;

  /** A user whose email we know, so that we can log in again with a new password. */
  const newUser = async (email: string) => {
    const res = await ctx.gql(
      `mutation($e: String!) { register(email: $e, password: "Passw0rd!x", fullName: "Old Name") { accessToken } }`,
      { e: email },
    );
    return res.data.register.accessToken as string;
  };

  describe('updateProfile', () => {
    it('trims and saves the name, and requires authentication', async () => {
      const token = await newUser('rename@test.local');
      const res = await ctx.gql(UPDATE, { n: '  New Name  ' }, token);
      expect(res.data.updateProfile).toMatchObject({ fullName: 'New Name', email: 'rename@test.local' });
      expect((await ctx.gql('{ me { fullName } }', undefined, token)).data.me.fullName).toBe('New Name');

      expect((await ctx.gql(UPDATE, { n: 'Anon' })).errors).toBeDefined();
    });

    it('rejects empty and overly long names', async () => {
      const token = await newUser('badname@test.local');
      expect((await ctx.gql(UPDATE, { n: '   ' }, token)).errors?.[0].message).toMatch(/required/i);
      expect((await ctx.gql(UPDATE, { n: 'x'.repeat(101) }, token)).errors?.[0].message).toMatch(/at most 100/i);
      expect((await ctx.gql('{ me { fullName } }', undefined, token)).data.me.fullName).toBe('Old Name');
    });
  });

  describe('changePassword', () => {
    it('changes the password: the old one stops working and the new one works', async () => {
      const token = await newUser('pw@test.local');
      const res = await ctx.gql(CHANGE, { c: 'Passw0rd!x', n: 'Br4nd-new-pass' }, token);
      expect(res.data.changePassword).toBe(true);

      expect((await ctx.gql(LOGIN, { e: 'pw@test.local', p: 'Passw0rd!x' })).errors).toBeDefined();
      expect((await ctx.gql(LOGIN, { e: 'pw@test.local', p: 'Br4nd-new-pass' })).data.login.accessToken).toEqual(
        expect.any(String),
      );
    });

    it('rejects a wrong current password, an unchanged one and weak new ones', async () => {
      const token = await newUser('pwrules@test.local');
      expect((await ctx.gql(CHANGE, { c: 'wrong', n: 'Br4nd-new-pass' }, token)).errors?.[0].message).toMatch(
        /current password is incorrect/i,
      );
      expect((await ctx.gql(CHANGE, { c: 'Passw0rd!x', n: 'Passw0rd!x' }, token)).errors?.[0].message).toMatch(
        /must be different/i,
      );
      expect((await ctx.gql(CHANGE, { c: 'Passw0rd!x', n: 'short' }, token)).errors?.[0].message).toMatch(
        /at least 8/i,
      );
      expect((await ctx.gql(CHANGE, { c: 'Passw0rd!x', n: 'x'.repeat(73) }, token)).errors?.[0].message).toMatch(
        /at most 72/i,
      );
      expect((await ctx.gql(CHANGE, { c: 'Passw0rd!x', n: 'Br4nd-new-pass' })).errors).toBeDefined();
      // none of the rejected attempts changed anything
      expect((await ctx.gql(LOGIN, { e: 'pwrules@test.local', p: 'Passw0rd!x' })).data.login.accessToken).toEqual(
        expect.any(String),
      );
    });

    it('blocks guessing the current password after 5 wrong attempts', async () => {
      const token = await newUser('pwguess@test.local');
      for (let i = 0; i < 5; i += 1) {
        const res = await ctx.gql(CHANGE, { c: `guess-${i}`, n: 'Br4nd-new-pass' }, token);
        expect(res.errors?.[0].message).toMatch(/incorrect/i);
      }
      const blocked = await ctx.gql(CHANGE, { c: 'Passw0rd!x', n: 'Br4nd-new-pass' }, token);
      expect(blocked.errors?.[0].message).toMatch(/too many wrong attempts/i);
    });
  });
});
