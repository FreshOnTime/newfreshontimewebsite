import { NextRequest } from 'next/server';

const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
};

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

describe('/api/users/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should successfully register a new user', async () => {
      const { POST } = await import('@/app/api/users/register/route');
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'test-user-id',
        firstName: 'John',
        phoneNumber: '+1234567890',
        addresses: [],
      });

      // Create mock request
      const mockRequest = {
        json: async () => ({
          userId: 'test-user-id',
          firstName: 'John',
          phoneNumber: '+1234567890',
          registrationAddress: {
            recipientName: 'John Doe',
            streetAddress: '123 Main St',
            city: 'Test City',
            state: 'Test State',
            postalCode: '12345',
            countryCode: 'US',
            phoneNumber: '+1234567890',
            type: 'Home'
          }
        })
      } as NextRequest;

      const response = await POST(mockRequest);
      
      expect(mockPrisma.user.findFirst).toHaveBeenCalled();
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });

    it('should return error when required fields are missing', async () => {
      const { POST } = await import('@/app/api/users/register/route');
      // Create mock request with missing fields
      const mockRequest = {
        json: async () => ({
          firstName: 'John'
          // Missing userId, phoneNumber, registrationAddress
        })
      } as NextRequest;

      const response = await POST(mockRequest);
      
      expect(response.status).toBe(400);
    });
  });
});
