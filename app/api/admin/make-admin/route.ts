import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { UserService } from '@/lib/services/userService';
import { sendSuccess, sendInternalError, sendBadRequest, sendNotFound } from '@/lib/utils/apiResponses';

const userService = new UserService();

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { userId } = await req.json();
    
    if (!userId) {
      return sendBadRequest('User ID is required');
    }
    
    // Find the user
    const user = await userService.findUserById(userId);
    if (!user) {
      return sendNotFound('User not found');
    }
    
    // Update user role to admin
    const updatedUser = await userService.updateUser(userId, { role: 'admin' });
    
    if (!updatedUser) {
      return sendInternalError('Failed to update user role');
    }
    
    return sendSuccess('User role updated to admin successfully', {
      userId: updatedUser.userId,
      firstName: updatedUser.firstName,
      role: updatedUser.role
    });
  } catch (error) {
    console.error('Error making user admin:', error);
    return sendInternalError('Failed to update user role');
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return sendBadRequest('User ID is required');
    }
    
    const user = await userService.findUserById(userId);
    if (!user) {
      return sendNotFound('User not found');
    }
    
    return sendSuccess('User role retrieved', {
      userId: user.userId,
      firstName: user.firstName,
      role: user.role,
      isAdmin: user.role === 'admin'
    });
  } catch (error) {
    console.error('Error getting user role:', error);
    return sendInternalError('Failed to get user role');
  }
}
