import { randomBytes, createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'private, no-store' };

/** Creating or revoking delegation requires a signed-in *browser*, not another agent. */
function browserWriteAllowed(request: NextRequest) {
  return Boolean(request.cookies.get('accessToken')?.value)
    && request.headers.get('origin') === new URL(request.url).origin;
}

export async function GET(request: NextRequest) {
  const user = await verifyToken(request);
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401, headers: noStore });
  const tokens = await prisma.agentAccessToken.findMany({
    where: { userId: user.userId },
    select: { id: true, name: true, createdAt: true, expiresAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ tokens }, { headers: noStore });
}

export async function POST(request: NextRequest) {
  if (!browserWriteAllowed(request)) return NextResponse.json({ error: 'Use the signed-in FreshPick website to approve an agent' }, { status: 403, headers: noStore });
  const user = await verifyToken(request);
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401, headers: noStore });
  const body = await request.json().catch(() => null);
  if (typeof body?.name !== 'string' || !body.name.trim() || body.name.trim().length > 80) {
    return NextResponse.json({ error: 'Give this agent a name (up to 80 characters)' }, { status: 400, headers: noStore });
  }
  const existing = await prisma.agentAccessToken.count({
    where: { userId: user.userId, expiresAt: { gt: new Date() } },
  });
  if (existing >= 5) return NextResponse.json({ error: 'Revoke an existing agent before connecting another' }, { status: 409, headers: noStore });

  const token = 'fp_agent_' + randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const record = await prisma.agentAccessToken.create({
    data: { userId: user.userId, name: body.name.trim(), tokenHash, expiresAt },
    select: { id: true, name: true, createdAt: true, expiresAt: true },
  });
  // The plaintext secret is returned exactly once. Only its hash is stored.
  return NextResponse.json({ token, record }, { status: 201, headers: noStore });
}

export async function DELETE(request: NextRequest) {
  if (!browserWriteAllowed(request)) return NextResponse.json({ error: 'Use the signed-in FreshPick website to revoke an agent' }, { status: 403, headers: noStore });
  const user = await verifyToken(request);
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401, headers: noStore });
  const body = await request.json().catch(() => null);
  if (typeof body?.id !== 'string' || body.id.length > 100) {
    return NextResponse.json({ error: 'Agent ID required' }, { status: 400, headers: noStore });
  }
  const deleted = await prisma.agentAccessToken.deleteMany({ where: { id: body.id, userId: user.userId } });
  return NextResponse.json({ success: deleted.count > 0 }, { headers: noStore });
}
