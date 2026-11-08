import { NextResponse } from 'next/server';
import { MCP_SCOPES, oauthProvider, oauthConfigurationStatus } from '@/lib/mcp/oauth';

export const dynamic = 'force-dynamic';

// RFC 9728: public /.well-known URLs rewrite here to avoid Netlify adapter 5.13.0 dropping dot-prefixed route bundles.
// This is the only runtime handler for both root and MCP-specific protected-resource discovery.
// The metadata advertises the *external*, reviewed OAuth provider.
// Do not run a home-grown authorization server inside Next.js.
export async function GET() {
  const provider = oauthProvider();
  if (!provider) {
    const status = oauthConfigurationStatus();
    return NextResponse.json({
      error: status === 'disabled' ? 'OAuth account linking is not configured' : 'OAuth configuration is incomplete or invalid',
      code: status === 'disabled' ? 'OAUTH_NOT_CONFIGURED' : 'OAUTH_CONFIGURATION_INVALID',
    }, { status: status === 'disabled' ? 404 : 503, headers: { 'Cache-Control': 'no-store' } });
  }
  return NextResponse.json({
    resource: provider.resource,
    authorization_servers: [provider.issuer],
    scopes_supported: MCP_SCOPES,
    resource_documentation: 'https://freshpick.lk/profile/agent-access',
  }, { headers: { 'Cache-Control': 'public, max-age=300' } });
}
