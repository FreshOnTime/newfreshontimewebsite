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
        body: JSON.stringify({
          userId: `smoke-test-${Date.now()}`,
          firstName: 'Test',
          phoneNumber: '+1234567890',
          registrationAddress: {
            recipientName: 'Test User',
            streetAddress: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            postalCode: '12345',
            countryCode: 'US',
            phoneNumber: '+1234567890',
            type: 'Home'
          }
        }),
      });

      // Should either succeed (201) or fail with validation error (400)
      // But should not return 500 (server error)
      expect([200, 201, 400, 409]).toContain(response.status);
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

  describe('Health Check', () => {
    it('should respond to basic health check', async () => {
      const response = await fetch(`${BASE_URL}/api/health`);
      
      // Health endpoint might not exist yet, but should not return 500
      expect([200, 404]).toContain(response.status);
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
