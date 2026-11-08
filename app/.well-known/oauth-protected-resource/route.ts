import { NextResponse } from 'next/server';
import { MCP_SCOPES, oauthProvider } from '@/lib/mcp/oauth';

export const dynamic = 'force-dynamic';

// RFC 9728: this resource advertises the *external*, reviewed OAuth provider.
// Do not run a home-grown authorization server inside Next.js.
export async function GET() {
  const provider = oauthProvider();
  if (!provider) return NextResponse.json({ error: 'OAuth account linking is not configured' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  return NextResponse.json({
    resource: provider.resource,
    authorization_servers: [provider.issuer],
    scopes_supported: MCP_SCOPES,
    resource_documentation: 'https://freshpick.lk/profile/agent-access',
  }, { headers: { 'Cache-Control': 'public, max-age=300' } });
}
