import { NextRequest } from 'next/server';
import { POST } from '@/app/api/users/register/route';

// Mock dependencies
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({}),
}));

jest.mock('@/lib/services/userService', () => ({
  UserService: jest.fn().mockImplementation(() => ({
    findUserById: jest.fn(),
    createUser: jest.fn(),
  })),
}));

import connectDB from '@/lib/db';
import { UserService } from '@/lib/services/userService';

const mockConnectDB = connectDB as jest.MockedFunction<typeof connectDB>;

describe('/api/users/register', () => {
  let mockUserService: jest.Mocked<UserService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserService = new UserService() as jest.Mocked<UserService>;
  });

  describe('POST', () => {
    it('should successfully register a new user', async () => {
      // Setup mocks
      mockUserService.findUserById.mockResolvedValue(null);
      mockUserService.createUser.mockResolvedValue({
        _id: '123',
        userId: 'test-user-id',
        firstName: 'John',
        phoneNumber: '+1234567890',
      } as any);

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
      
      expect(mockConnectDB).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });

    it('should return error when required fields are missing', async () => {
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
