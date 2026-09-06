// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

require('jest-environment-node');

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, init) => ({
      status: init?.status || 200,
      json: async () => data,
    })),
  },
}));

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_that_is_long_enough_for_tests';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/freshpick_test?schema=public';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@example.com';
process.env.FIREBASE_PRIVATE_KEY = 'test-key';
