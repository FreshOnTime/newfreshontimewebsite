import { NextRequest } from 'next/server';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { createFreshPickMcpServer } from '@/lib/mcp/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = new RateLimiterMemory({ keyPrefix: 'freshpick-mcp', points: 60, duration: 60 });

function trustedOrigins(): Set<string> {
  const configured = [
    'https://freshpick.lk', 'https://www.freshpick.lk', 'https://freshpicknew.netlify.app',
    process.env.URL, process.env.DEPLOY_URL, process.env.DEPLOY_PRIME_URL, process.env.NEXT_PUBLIC_SITE_URL,
    ...(process.env.MCP_ALLOWED_ORIGINS || '').split(','),
  ];
  return new Set(configured.flatMap((value) => {
    if (!value?.trim()) return [];
    try { const url = new URL(value.trim()); return ['https:', 'http:'].includes(url.protocol) ? [url.origin] : []; }
    catch { return []; }
  }));
}

function validateRequest(request: Request): Response | null {
  const allowed = trustedOrigins();
  const url = new URL(request.url);
  if (process.env.NODE_ENV !== 'production' && ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) allowed.add(url.origin);
  const origin = request.headers.get('origin');
  const host = request.headers.get('host') || url.host;
  if ((origin && !allowed.has(origin)) || !Array.from(allowed).some((value) => new URL(value).host === host)) {
    return protocolError(403, 'This origin or host is not allowed.');
  }
  return null;
}

function protocolError(status: number, message: string, extraHeaders?: Record<string, string>): Response {
  return Response.json({ jsonrpc: '2.0', error: { code: -32000, message }, id: null }, {
    status, headers: { 'Cache-Control': 'no-store', ...extraHeaders },
  });
}

function responseHeaders(response: Response, request: Request): Response {
  response.headers.set('Cache-Control', 'no-store');
  const origin = request.headers.get('origin');
  if (origin) { response.headers.set('Access-Control-Allow-Origin', origin); response.headers.set('Vary', 'Origin'); }
  return response;
}

export async function POST(request: NextRequest): Promise<Response> {
  const rejected = validateRequest(request);
  if (rejected) return rejected;
  try {
    const client = request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    await limiter.consume(client);
  } catch (error) {
    const ms = (error as { msBeforeNext?: number }).msBeforeNext || 60000;
    return responseHeaders(protocolError(429, 'Too many MCP requests. Please retry later.', { 'Retry-After': String(Math.ceil(ms / 1000)) }), request);
  }
  const server = createFreshPickMcpServer();
  // A new server and transport per request: no session affinity or customer state.
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, enableJsonResponse: true, maxRequestBodySize: 65536,
  });
  try {
    await server.connect(transport);
    return responseHeaders(await transport.handleRequest(request), request);
  } catch {
    return responseHeaders(protocolError(500, 'FreshPick could not process this MCP request.'), request);
  } finally {
    await server.close();
  }
}

export async function GET(request: Request): Promise<Response> {
  return validateRequest(request) || responseHeaders(protocolError(405, 'This stateless endpoint accepts MCP messages through POST.', { Allow: 'POST, OPTIONS' }), request);
}

export const DELETE = GET;

export async function OPTIONS(request: Request): Promise<Response> {
  const rejected = validateRequest(request);
  if (rejected) return rejected;
  return responseHeaders(new Response(null, { status: 204, headers: {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, MCP-Protocol-Version, MCP-Session-Id',
    'Access-Control-Max-Age': '600',
  } }), request);
}
