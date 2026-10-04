import jwt from 'jsonwebtoken';

type JwtModule = typeof import('../../lib/jwt');
const originalSecret = process.env.JWT_SECRET;
const payload = { userId: 'customer-1', role: 'customer' };
let auth: JwtModule;

beforeEach(() => {
  delete process.env.JWT_SECRET;
  jest.isolateModules(() => {
    auth = jest.requireActual('../../lib/jwt');
  });
});
afterEach(() => {
  if (originalSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalSecret;
});

test('module imports without a secret for build-time route discovery', () => {
  expect(auth.generateSecureToken()).toMatch(/^[a-f0-9]{64}$/);
});

test.each([undefined, '', '   '])('authentication fails closed with missing or blank secret (%s)', secret => {
  if (secret !== undefined) process.env.JWT_SECRET = secret;
  expect(() => auth.signAccessToken(payload)).toThrow('JWT_SECRET environment variable is required');
  expect(() => auth.signRefreshToken(payload)).toThrow('JWT_SECRET environment variable is required');
  const token = jwt.sign({ ...payload, type: 'access' }, 'build_time_dummy_secret');
  expect(() => auth.verifyToken(token)).toThrow('JWT_SECRET environment variable is required');
});

test('uses the runtime secret set after import for access and refresh tokens', () => {
  process.env.JWT_SECRET = 'runtime-only-test-secret-at-least-32-characters';
  const access = auth.signAccessToken(payload);
  const refresh = auth.signRefreshToken(payload);
  expect(auth.verifyToken(access)).toMatchObject({ ...payload, type: 'access' });
  expect(auth.verifyToken(refresh.token)).toMatchObject({ ...payload, type: 'refresh' });
  expect(refresh.hashedToken).toBe(auth.hashRefreshToken(refresh.token));
  expect(jwt.verify(access, process.env.JWT_SECRET)).toMatchObject(payload);
  process.env.JWT_SECRET = 'different-runtime-test-secret-at-least-32-characters';
  expect(() => auth.verifyToken(access)).toThrow('Invalid token');
});

test('rejects invalid and expired tokens with configured secret', () => {
  process.env.JWT_SECRET = 'runtime-only-test-secret-at-least-32-characters';
  expect(() => auth.verifyToken('invalid')).toThrow('Invalid token');
  const expired = jwt.sign({ ...payload, type: 'access' }, process.env.JWT_SECRET, { expiresIn: -1 });
  expect(() => auth.verifyToken(expired)).toThrow('Token has expired');
});
