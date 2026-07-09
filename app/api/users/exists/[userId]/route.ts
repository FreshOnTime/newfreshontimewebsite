import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { NotFoundError } from '@/lib/utils/errors';
import { sendSuccess, sendNotFound, sendInternalError } from '@/lib/utils/apiResponses';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const userId = (await params).userId;
    
    if (!userId) {
      return sendNotFound('User ID is required');
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ id: userId }, { phoneNumber: userId }] },
    });
    if (!existingUser) {
      throw new NotFoundError('User does not exist');
    }
    
    return sendSuccess('User exists', { ...existingUser, _id: existingUser.id, userId: existingUser.id });
  } catch (error) {
    console.error('Check user exists error:', error);
    
    if (error instanceof NotFoundError) {
      return sendNotFound(error.message);
    }
    
    return sendInternalError('Internal server error while checking user existence');
  }
}
