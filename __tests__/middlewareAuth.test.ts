import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';
jest.mock('next/server', () => jest.requireActual('next/server'));

test('an admin page with only a refresh cookie can recover its access session in AuthContext', () => {
  const response = middleware(new NextRequest('https://freshpick.lk/admin/enquiries', { headers: { cookie: 'refreshToken=opaque-session' } }));
  expect(response.headers.get('location')).toBeNull();
  expect(response.headers.get('x-middleware-next')).toBe('1');
});
test('a guest is redirected to login with the requested admin destination', () => {
  const response = middleware(new NextRequest('https://freshpick.lk/admin/enquiries'));
  expect(response.status).toBe(307);
  expect(response.headers.get('location')).toBe('https://freshpick.lk/auth/login?redirect=%2Fadmin%2Fenquiries');
});
