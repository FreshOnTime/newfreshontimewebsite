import { NextResponse } from 'next/server';
import { z } from 'zod';
import { businessNameSchema, shouldResumeBusinessOnboarding } from '@/lib/businessOnboarding';
import prisma from '@/lib/prisma';
import { signAccessToken } from '@/lib/jwt';
import { setAuthCookies } from '@/lib/utils/cookies';
import { passwordSchema } from '@/lib/utils/validation';

export const supabaseAuthEnabled = () => process.env.FRESHPICK_SUPABASE_AUTH === 'true';
export const managedRefreshPrefix = 'sb:';
const managedPassword = passwordSchema.max(72).refine(v => Buffer.byteLength(v, 'utf8') <= 72, 'Password must be at most 72 UTF-8 bytes');
export const managedSignupSchema = z.object({
  firstName: z.string().trim().min(1).max(30),
  lastName: z.string().trim().max(30).optional(),
  email: z.string().trim().email().max(254).transform(v => v.toLowerCase()),
  password: managedPassword,
  businessName: businessNameSchema.optional(),
});
const identitySchema = z.object({
  id: z.string().uuid(), email: z.string().email(),
  email_confirmed_at: z.string().nullable().optional(),
  user_metadata: z.object({ firstName: z.string().trim().min(1).max(30).optional(), lastName: z.string().trim().max(30).optional() }).passthrough().optional(),
});
const sessionSchema = z.object({ access_token: z.string().min(1), refresh_token: z.string().min(1), user: identitySchema });
type Session = z.infer<typeof sessionSchema>;
export class ManagedAuthError extends Error {
  constructor(public readonly status: number, message: string) { super(message); }
}
function authConfig() {
  const url = new URL(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '');
  if (url.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && ['localhost','127.0.0.1'].includes(url.hostname) && url.protocol === 'http:')) throw new Error('Invalid Supabase Auth URL');
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error('Supabase publishable key is required');
  return { root: url.origin + '/auth/v1', key };
}
async function authRequest(path: string, body: unknown, accessToken?: string, method = 'POST') {
  const { root, key } = authConfig();
  const response = await fetch(root + path, {
    method, headers: { apikey: key, 'Content-Type': 'application/json', ...(accessToken ? { Authorization: 'Bearer ' + accessToken } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}), cache: 'no-store', signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new ManagedAuthError(response.status === 429 ? 429 : response.status >= 500 ? 503 : 400, response.status === 429 ? 'Too many attempts. Please try again later.' : response.status >= 500 ? 'Authentication is temporarily unavailable.' : 'Unable to complete authentication. Check your details or request a new link.');
  return response.status === 204 ? null : response.json().catch(() => null);
}
async function sessionRequest(path: string, body: unknown): Promise<Session> {
  return sessionSchema.parse(await authRequest(path, body));
}
export async function startManagedSignup(input: z.infer<typeof managedSignupSchema>) {
  const existing = await prisma.user.findFirst({ where: { email: { equals: input.email, mode: 'insensitive' } }, select: { id: true } });
  if (existing) throw new ManagedAuthError(409, 'An account with these details already exists. Sign in or reset your password.');
  const result = await authRequest('/signup', { email: input.email, password: input.password, data: { firstName: input.firstName, lastName: input.lastName || '', ...(input.businessName ? {businessName:input.businessName} : {}) } });
  if (result && typeof result === 'object' && 'access_token' in result && result.access_token) throw new ManagedAuthError(503, 'Email confirmation is not configured. Please contact support.');
}
export async function managedPasswordLogin(email: string, password: string) {
  return sessionRequest('/token?grant_type=password', { email: email.toLowerCase(), password });
}
export async function managedRefresh(token: string) {
  return sessionRequest('/token?grant_type=refresh_token', { refresh_token: token });
}
export async function managedVerify(tokenHash: string, type: 'email' | 'recovery') {
  return sessionRequest('/verify', { token_hash: tokenHash, type });
}
export async function managedRecovery(email: string) {
  const site=new URL(process.env.FRONTEND_URL || (process.env.NODE_ENV==='production'?'':'http://localhost:3000'));
  if(site.protocol!=='https:'&&!(process.env.NODE_ENV!=='production'&&['localhost','127.0.0.1'].includes(site.hostname)&&site.protocol==='http:'))throw new Error('Invalid recovery site URL');
  await authRequest('/recover?redirect_to='+encodeURIComponent(site.origin+'/auth/reset-password'), { email });
}
export async function managedPasswordReset(tokenHash: string, password: string) {
  if (!managedPassword.safeParse(password).success) throw new ManagedAuthError(400, 'Use a password of at most 72 UTF-8 bytes.');
  const session = await managedVerify(tokenHash, 'recovery');
  if (!session.user.email_confirmed_at) throw new ManagedAuthError(400, 'Invalid recovery link.');
  const user = await prisma.user.findUnique({ where: { supabaseAuthId: session.user.id } });
  if (user?.isBanned || (user && user.email?.toLowerCase() !== session.user.email.toLowerCase())) throw new ManagedAuthError(400, 'Invalid recovery link.');
  await authRequest('/user', { password }, session.access_token, 'PUT');
  await authRequest('/logout?scope=global', undefined, session.access_token);
  if (user) await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
}
export async function managedLogout(token: string) {
  const session = await managedRefresh(token);
  await authRequest('/logout?scope=local', undefined, session.access_token);
}
export async function managedUser(session: Session, allowCreate: boolean) {
  const identity = session.user;
  if (!identity.email_confirmed_at) throw new ManagedAuthError(401, 'Verify your email before signing in.');
  const email = identity.email.toLowerCase();
  let user = await prisma.user.findUnique({ where: { supabaseAuthId: identity.id } });
  if (!user && allowCreate) {
    const collision = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
    if (collision) throw new ManagedAuthError(409, 'This account needs to be migrated by FreshPick support.');
    const draftName=businessNameSchema.safeParse(identity.user_metadata?.businessName);
    user = await prisma.user.create({ data: {
      ...(draftName.success?{businessOnboardingDraft:{name:draftName.data}}:{}),
      email, firstName: identity.user_metadata?.firstName || 'Member', lastName: identity.user_metadata?.lastName || null,
      supabaseAuthId: identity.id, isEmailVerified: true, role: 'customer',
    } });
  }
  if (!user || user.isBanned || user.email?.toLowerCase() !== email) throw new ManagedAuthError(401, 'Account unavailable.');
  if (user.role === 'admin' || user.secondaryRoles.includes('admin')) throw new ManagedAuthError(403, 'Administrator migration requires the MFA rollout.');
  return user;
}
export async function managedSessionResponse(session: Session, allowCreate = false) {
  const user = await managedUser(session, allowCreate);
  const response = NextResponse.json({ message: 'Signed in', user: {
    _id: user.id, userId: user.id, firstName: user.firstName, lastName: user.lastName,
    email: user.email, phoneNumber: user.phoneNumber || '', role: user.role, secondaryRoles: user.secondaryRoles,
    isEmailVerified: true, managedAuth: true, resumeBusinessOnboarding: shouldResumeBusinessOnboarding(user),
  } });
  const ttl = 600;
  const access = signAccessToken({ userId: user.id, email: user.email || undefined, role: user.role }, ttl);
  setAuthCookies(response, access, managedRefreshPrefix + session.refresh_token, ttl);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
export function managedError(error: unknown) {
  return NextResponse.json({ error: error instanceof ManagedAuthError ? error.message : 'Authentication is temporarily unavailable.' }, { status: error instanceof ManagedAuthError ? error.status : 503, headers: { 'Cache-Control': 'no-store' } });
}
