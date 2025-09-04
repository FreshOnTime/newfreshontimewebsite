import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken, hashRefreshToken, verifyToken } from '@/lib/jwt';
import connectDB from '@/lib/database';
import User, { IUser } from '@/lib/models/User';
import crypto from 'crypto';
import Customer from '@/lib/models/Customer';

export interface SignupData {
  firstName: string;
  lastName?: string;
  email?: string;
  phoneNumber: string;
  password: string;
  registrationAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
}

export interface LoginData {
  identifier: string; // email or phone
  password: string;
}

export interface AuthResult {
  user: Omit<IUser, 'passwordHash' | 'refreshTokens'>;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async signup(data: SignupData): Promise<AuthResult> {
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: data.email },
        { phoneNumber: data.phoneNumber }
      ]
    });

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new Error('User with this email already exists');
      }
      if (existingUser.phoneNumber === data.phoneNumber) {
        throw new Error('User with this phone number already exists');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Generate unique userId
    const userId = crypto.randomUUID();

    // Map registration address to Address model format
    const getCountryCode = (country: string): string => {
      const countryMap: { [key: string]: string } = {
        'Sri Lanka': 'LK',
        'India': 'IN',
        'United States': 'US',
        'United Kingdom': 'GB',
        'Australia': 'AU',
        'Canada': 'CA',
        // Add more mappings as needed
      };
      return countryMap[country] || country.toUpperCase().slice(0, 2);
    };

    const mappedAddress = {
      recipientName: `${data.firstName} ${data.lastName || ''}`.trim(),
      streetAddress: data.registrationAddress.addressLine1,
      streetAddress2: data.registrationAddress.addressLine2,
      town: data.registrationAddress.city, // Using city as town for now
      city: data.registrationAddress.city,
      state: data.registrationAddress.province,
      postalCode: data.registrationAddress.postalCode,
      countryCode: getCountryCode(data.registrationAddress.country),
      phoneNumber: data.phoneNumber,
      type: 'Home' as const
    };

    console.log('Mapped address for user creation:', mappedAddress);
    console.log('Original registration address:', data.registrationAddress);

    // Create user
    const user = new User({
      userId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      passwordHash,
      registrationAddress: mappedAddress,
      addresses: [mappedAddress],
      role: 'customer'
    });

    const savedUser = await user.save();

    // Ensure a corresponding Customer document exists for customer-role users
    try {
      if (savedUser.role === 'customer') {
        const fullName = `${savedUser.firstName} ${savedUser.lastName || ''}`.trim();
        const customerAddress = savedUser.registrationAddress
          ? {
              street: [
                savedUser.registrationAddress.streetAddress,
                savedUser.registrationAddress.streetAddress2,
              ]
                .filter(Boolean)
                .join(', '),
              city:
                savedUser.registrationAddress.city ||
                savedUser.registrationAddress.town,
              state: savedUser.registrationAddress.state,
              zipCode: savedUser.registrationAddress.postalCode,
              country: savedUser.registrationAddress.countryCode,
            }
          : undefined;

        const emailForCustomer = savedUser.email || `${savedUser.userId}@placeholder.local`;
        const existingCustomer = await Customer.findOne({ email: emailForCustomer });
        if (!existingCustomer) {
          await Customer.create({
            name: fullName || savedUser.phoneNumber,
            email: emailForCustomer,
            phone: savedUser.phoneNumber,
            address: customerAddress,
          });
        }
      }
    } catch (e) {
      // Do not block signup on Customer creation failures; log for later inspection
      console.error('Customer sync on signup failed:', e);
    }

    // Generate tokens
    const tokenPayload = {
      userId: savedUser.userId,
      email: savedUser.email,
      role: savedUser.role
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshTokenData = signRefreshToken(tokenPayload);

    // Store hashed refresh token
    savedUser.refreshTokens = [{
      hashedToken: refreshTokenData.hashedToken,
      expiresAt: refreshTokenData.expiresAt,
      createdAt: new Date()
    }];
    await savedUser.save();

    // Return user without sensitive data
    const userResponse = savedUser.toObject();
    delete userResponse.passwordHash;
    delete userResponse.refreshTokens;

    return {
      user: userResponse,
      accessToken,
      refreshToken: refreshTokenData.token
    };
  }

  async login(data: LoginData): Promise<AuthResult> {
    await connectDB();

    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: data.identifier },
        { phoneNumber: data.identifier }
      ]
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (user.isBanned) {
      throw new Error('Account is banned');
    }

    if (!user.passwordHash) {
      throw new Error('Account does not have password authentication enabled');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.userId,
      email: user.email,
      role: user.role
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshTokenData = signRefreshToken(tokenPayload);

    // Add new refresh token (keep existing ones for multi-device support)
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push({
      hashedToken: refreshTokenData.hashedToken,
      expiresAt: refreshTokenData.expiresAt,
      createdAt: new Date()
    });

    // Clean up expired refresh tokens
    interface RefreshToken {
      hashedToken: string;
      expiresAt: Date;
      createdAt: Date;
    }

        user.refreshTokens = user.refreshTokens.filter(
          (token: RefreshToken) => token.expiresAt > new Date()
        );

    await user.save();

    // Return user without sensitive data
    const userResponse = user.toObject();
    delete userResponse.passwordHash;
    delete userResponse.refreshTokens;

    return {
      user: userResponse,
      accessToken,
      refreshToken: refreshTokenData.token
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    await connectDB();

    const hashedToken = hashRefreshToken(refreshToken);

    // Find user with this refresh token
    const user = await User.findOne({
      'refreshTokens.hashedToken': hashedToken,
      'refreshTokens.expiresAt': { $gt: new Date() }
    });

    if (!user) {
      throw new Error('Invalid or expired refresh token');
    }

    if (user.isBanned) {
      throw new Error('Account is banned');
    }

    // Remove the used refresh token
    interface RefreshTokenFilter {
      hashedToken: string;
      expiresAt: Date;
      createdAt: Date;
    }

    user.refreshTokens = user.refreshTokens?.filter(
      (token: RefreshTokenFilter) => token.hashedToken !== hashedToken
    ) || [];

    // Generate new tokens
    const tokenPayload = {
      userId: user.userId,
      email: user.email,
      role: user.role
    };

    const newAccessToken = signAccessToken(tokenPayload);
    const newRefreshTokenData = signRefreshToken(tokenPayload);

    // Store new refresh token
    user.refreshTokens.push({
      hashedToken: newRefreshTokenData.hashedToken,
      expiresAt: newRefreshTokenData.expiresAt,
      createdAt: new Date()
    });

    await user.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenData.token
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await connectDB();

    const hashedToken = hashRefreshToken(refreshToken);

    // Remove the refresh token from user
    await User.updateOne(
      { 'refreshTokens.hashedToken': hashedToken },
      { $pull: { refreshTokens: { hashedToken } } }
    );
  }

  async logoutAll(userId: string): Promise<void> {
    await connectDB();

    // Remove all refresh tokens for the user
    await User.updateOne(
      { userId },
      { $set: { refreshTokens: [] } }
    );
  }

  async getUserByToken(accessToken: string): Promise<Omit<IUser, 'passwordHash' | 'refreshTokens'> | null> {
    await connectDB();

    try {
      const payload = verifyToken(accessToken);
      
      const user = await User.findOne({ userId: payload.userId });
      if (!user || user.isBanned) {
        return null;
      }

      const userResponse = user.toObject();
      delete userResponse.passwordHash;
      delete userResponse.refreshTokens;

      return userResponse;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
