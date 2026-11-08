import 'server-only';
import { createHash } from 'node:crypto';
import prisma from '@/lib/prisma';
import { authenticateOAuthAgent, MCP_SCOPES } from '@/lib/mcp/oauth';

/**
 * Customer-delegated MCP credentials are independent from browser login JWTs.
 * Never accept browser cookies here: remote agents must explicitly present a
 * separately revocable, narrowly scoped credential.
 */
export async function authenticateMcpAgent(request: Request): Promise<{ userId: string; scopes: string[] } | null> {
  const authorization = request.headers.get('authorization') || '';
  const match = /^Bearer (fp_agent_[a-f0-9]{64})$/.exec(authorization);
  if (!match) {
    const bearer = /^Bearer (\S+)$/.exec(authorization);
    return bearer ? authenticateOAuthAgent(bearer[1]) : null;
  }

  const tokenHash = createHash('sha256').update(match[1]).digest('hex');
  const record = await prisma.agentAccessToken.findUnique({
    where: { tokenHash },
    select: { userId: true, expiresAt: true, user: { select: { isBanned: true } } },
  });
  if (!record || record.expiresAt <= new Date() || record.user.isBanned) return null;
  return { userId: record.userId, scopes: [...MCP_SCOPES] };
}
