import { execSync } from 'child_process';
import { Client } from 'pg';
import { getTestDatabaseUrl } from './test-db';

/** Creates the test database if needed and applies all migrations to it. */
export default async function globalSetup() {
  const url = getTestDatabaseUrl();
  const dbName = new URL(url).pathname.replace(/^\//, '');

  const admin = new URL(url);
  admin.pathname = '/postgres';
  const client = new Client({ connectionString: admin.toString() });
  await client.connect();
  const exists = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (exists.rowCount === 0) {
    await client.query(`CREATE DATABASE "${dbName}"`);
  }
  await client.end();

  execSync('npx prisma migrate deploy', {
    cwd: __dirname + '/..',
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'pipe',
  });
}
