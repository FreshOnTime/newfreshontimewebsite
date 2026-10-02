/**
 * Smoke tests to verify critical API endpoints are working in production
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

describe('Smoke Tests - Critical API Endpoints', () => {
  const timeout = 10000; // 10 seconds

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
