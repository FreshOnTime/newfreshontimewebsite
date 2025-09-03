import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { UserService } from '@/lib/services/userService';
import { NotFoundError } from '@/lib/utils/errors';
import { sendSuccess, sendNotFound, sendInternalError } from '@/lib/utils/apiResponses';

const userService = new UserService();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Connect to database
    await connectDB();

    const userId = (await params).userId;
    
    if (!userId) {
      return sendNotFound('User ID is required');
    }

    const existingUser = await userService.findUserById(userId);
    if (!existingUser) {
      throw new NotFoundError('User does not exist');
    }
    
    return sendSuccess('User exists', existingUser);
  } catch (error) {
    console.error('Check user exists error:', error);
    
    if (error instanceof NotFoundError) {
      return sendNotFound(error.message);
    }
    
    return sendInternalError('Internal server error while checking user existence');
  }
}
