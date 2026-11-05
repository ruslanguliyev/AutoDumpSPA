import { config as loadEnv } from 'dotenv';
import { join } from 'path';

/**
 * Connection string of the dedicated test database.
 *
 * - TEST_DATABASE_URL wins (used in CI).
 * - Otherwise it is derived from DATABASE_URL by swapping the database name for `<name>_test`.
 * The name MUST end with `_test`: tests wipe tables, so they must never touch a real database.
 */
export function getTestDatabaseUrl(): string {
  loadEnv({ path: join(__dirname, '..', '.env') });

  let url = process.env.TEST_DATABASE_URL;
  if (!url) {
    const base = process.env.DATABASE_URL;
    if (!base) {
      throw new Error('Set TEST_DATABASE_URL (or DATABASE_URL in backend/.env) to run the tests');
    }
    const parsed = new URL(base);
    parsed.pathname = `/${parsed.pathname.replace(/^\//, '')}_test`;
    url = parsed.toString();
  }

  const dbName = new URL(url).pathname.replace(/^\//, '');
  if (!dbName.endsWith('_test')) {
    throw new Error(`Refusing to run tests against "${dbName}": database name must end with _test`);
  }
  return url;
}
