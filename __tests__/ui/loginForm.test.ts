import { readFileSync } from 'node:fs';

it('offers password sign-in and an account recovery path without a Google sign-in button', () => {
  const source = readFileSync('components/auth/LoginForm.tsx', 'utf8');
  expect(source).not.toContain('Continue with Google');
  expect(source).not.toContain('loginWithGoogle');
  expect(source).toContain('href="/auth/forgot"');
  expect(source).toContain('autoComplete="current-password"');
  expect(source).toContain('Set a password using your account email.');
});
