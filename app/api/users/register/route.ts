import { NextRequest } from 'next/server';
import { ConflictError } from '@/lib/utils/errors';
import { sendCreated, sendInternalError, sendBadRequest } from '@/lib/utils/apiResponses';
import prisma from '@/lib/prisma';

type LegacyRegisterUser = {
  userId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  registrationAddress?: {
    recipientName?: string;
    streetAddress?: string;
    streetAddress2?: string;
    town?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    countryCode?: string;
    phoneNumber?: string;
  };
};

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const userData: LegacyRegisterUser = await req.json();

    // Validate required fields
    if (!userData.userId || !userData.firstName || !userData.phoneNumber || !userData.registrationAddress) {
      return sendBadRequest('Missing required fields: userId, firstName, phoneNumber, registrationAddress');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ id: userData.userId }, { phoneNumber: userData.phoneNumber }, ...(userData.email ? [{ email: userData.email }] : [])] },
    });
    if (existingUser) {
      throw new ConflictError('User already exists');
    }

    // Create new user
    const address = userData.registrationAddress;
    const newUser = await prisma.user.create({
      data: {
        id: userData.userId,
        firstName: userData.firstName,
        lastName: userData.lastName ?? null,
        email: userData.email ?? null,
        phoneNumber: userData.phoneNumber,
        role: 'customer',
        addresses: {
          create: {
            recipientName: address.recipientName || userData.firstName,
            streetAddress: address.streetAddress || '',
            streetAddress2: address.streetAddress2 ?? null,
            town: address.town || address.city || '',
            city: address.city || '',
            state: address.state || '',
            postalCode: address.postalCode || '',
            countryCode: address.countryCode || 'LK',
            phoneNumber: address.phoneNumber || userData.phoneNumber,
            isRegistration: true,
          },
        },
      },
      include: { addresses: true },
    });
    
    return sendCreated('User registered successfully', { ...newUser, _id: newUser.id, userId: newUser.id });
  } catch (error) {
    console.error('User registration error:', error);
    
    if (error instanceof ConflictError) {
      return sendBadRequest(error.message);
    }
    
    return sendInternalError('Internal server error during user registration');
  }
}
