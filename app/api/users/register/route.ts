import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { UserService } from '@/lib/services/userService';
import { ConflictError } from '@/lib/utils/errors';
import { sendCreated, sendInternalError, sendBadRequest } from '@/lib/utils/apiResponses';
import { IUser } from '@/lib/models/User';

const userService = new UserService();

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Parse request body
    const userData: Partial<IUser> = await req.json();

    // Validate required fields
    if (!userData.userId || !userData.firstName || !userData.phoneNumber || !userData.registrationAddress) {
      return sendBadRequest('Missing required fields: userId, firstName, phoneNumber, registrationAddress');
    }

    // Check if user already exists
    const existingUser = await userService.findUserById(userData.userId);
    if (existingUser) {
      throw new ConflictError('User already exists');
    }

    // Create new user
    const newUser = await userService.createUser(userData);
    
    return sendCreated('User registered successfully', newUser);
  } catch (error) {
    console.error('User registration error:', error);
    
    if (error instanceof ConflictError) {
      return sendBadRequest(error.message);
    }
    
    return sendInternalError('Internal server error during user registration');
  }
}
