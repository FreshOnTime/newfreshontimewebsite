/**
 * Smoke tests to verify critical API endpoints are working in production
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

describe('Smoke Tests - Critical API Endpoints', () => {
  const timeout = 10000; // 10 seconds

  describe('MCP endpoint', () => {
    it('returns a protocol error instead of a generic HTML 500 for unsupported GET', async () => {
      const response = await fetch(`${BASE_URL}/api/mcp`);
      expect(response.status).toBe(405);
      expect(response.headers.get('Content-Type')).toContain('application/json');
    }, timeout);

    it('lists public catalog and subscription tools using Streamable HTTP', async () => {
      const response = await fetch(`${BASE_URL}/api/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/event-stream',
          'MCP-Protocol-Version': '2025-11-25',
        },
        body: JSON.stringify({ jsonrpc: '2.0', id: 7, method: 'tools/list', params: {} }),
      });
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.result.tools.map((tool: { name: string }) => tool.name)).toEqual(
        expect.arrayContaining(['search_products', 'get_product', 'list_categories', 'list_subscription_plans']),
      );
    }, timeout);

    it('serves OAuth resource metadata or an explicit configuration response', async () => {
      const response = await fetch(`${BASE_URL}/.well-known/oauth-protected-resource`);
      // 404 = not configured; 503 = malformed settings; 200 = correctly configured.
      expect([200, 404]).toContain(response.status);
      const body = await response.json();
      if (response.status === 200) {
        expect(body.resource).toContain('/api/mcp');
        expect(body.authorization_servers).toHaveLength(1);
      } else {
        expect(body.code).toBe('OAUTH_NOT_CONFIGURED');
      }
    }, timeout);
  });

  describe('User API', () => {
    it('should handle user registration endpoint', async () => {
      const response = await fetch(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Intentionally invalid input: smoke checks must never create accounts
        // when BASE_URL points at a deployed site.
        body: JSON.stringify({}),
      });
      expect(response.status).toBe(400);
    }, timeout);
  });

  describe('Products API', () => {
    it('should retrieve products list', async () => {
      const response = await fetch(`${BASE_URL}/api/products?limit=5`);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
    }, timeout);

    it('should handle product search', async () => {
      const response = await fetch(`${BASE_URL}/api/products?search=test&limit=5`);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('success');
    }, timeout);
  });

  describe('Order authentication', () => {
    it('should reject anonymous order history', async () => {
      const response = await fetch(`${BASE_URL}/api/orders`);
      
      expect(response.status).toBe(401);
    }, timeout);
  });

  describe('Categories API', () => {
    it('should retrieve categories list', async () => {
      const response = await fetch(`${BASE_URL}/api/categories`);
      
      expect([200, 404]).toContain(response.status);
    }, timeout);
  });

  describe('Brands API', () => {
    it('should retrieve brands list', async () => {
      const response = await fetch(`${BASE_URL}/api/brands`);
      
      expect([200, 404]).toContain(response.status);
    }, timeout);
  });
});
