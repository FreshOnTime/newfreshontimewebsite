import { serialize, parse } from 'cookie';
import { NextRequest, NextResponse } from 'next/server';

const isDevelopment = process.env.NODE_ENV === 'development';
const authCookieDomain = process.env.AUTH_COOKIE_DOMAIN || undefined;

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  path?: string;
  domain?: string;
}

export function setCookie(
  response: NextResponse,
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  const defaultOptions: CookieOptions = {
    httpOnly: true,
    secure: !isDevelopment,
    sameSite: 'lax',
    path: '/',
    domain: authCookieDomain,
    ...options,
  };

  const serializedCookie = serialize(name, value, defaultOptions);
  response.headers.append('Set-Cookie', serializedCookie);
}

export function deleteCookie(
  response: NextResponse,
  name: string,
  path: string = '/'
): void {
  const serializedCookie = serialize(name, '', {
    httpOnly: true,
    secure: !isDevelopment,
    sameSite: 'lax',
    path,
    domain: authCookieDomain,
    maxAge: 0,
  });
  response.headers.append('Set-Cookie', serializedCookie);
}

export function getCookie(request: NextRequest, name: string): string | undefined {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return undefined;

  const cookies = parse(cookieHeader);
  return cookies[name];
}

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): void {
  setCookie(response, 'accessToken', accessToken, {
    maxAge: 7 * 24 * 60 * 60,
  });

  setCookie(response, 'refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60,
  });
}

export function clearAuthCookies(response: NextResponse): void {
  deleteCookie(response, 'accessToken');
  deleteCookie(response, 'refreshToken');
}
