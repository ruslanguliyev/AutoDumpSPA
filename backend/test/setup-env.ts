import { getTestDatabaseUrl } from './test-db';

// Runs before each test file: point the app at the test database.
process.env.DATABASE_URL = getTestDatabaseUrl();
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';
