import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { sendSuccess, sendInternalError, sendBadRequest, sendNotFound } from '@/lib/utils/apiResponses';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return sendBadRequest('User ID is required');
    }
    
    // Find the user
    const user = await prisma.user.findFirst({ where: { OR: [{ id: userId }, { phoneNumber: userId }] } });
    if (!user) {
      return sendNotFound('User not found');
    }
    
    // Update user role to admin
    const updatedUser = await prisma.user.update({ where: { id: user.id }, data: { role: 'admin' } });
    
    return sendSuccess('User role updated to admin successfully', {
      userId: updatedUser.id,
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
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return sendBadRequest('User ID is required');
    }
    
    const user = await prisma.user.findFirst({ where: { OR: [{ id: userId }, { phoneNumber: userId }] } });
    if (!user) {
      return sendNotFound('User not found');
    }
    
    return sendSuccess('User role retrieved', {
      userId: user.id,
      firstName: user.firstName,
      role: user.role,
      isAdmin: user.role === 'admin'
    });
  } catch (error) {
    console.error('Error getting user role:', error);
    return sendInternalError('Failed to get user role');
  }
}
