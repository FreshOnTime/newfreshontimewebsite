import bcrypt from 'bcryptjs';
import { Prisma, type Address } from '@prisma/client';
import { signAccessToken, signRefreshToken, hashRefreshToken, verifyToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';

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

// Plain, DB-agnostic user shape returned to callers/clients. Keeps `_id` and
// `userId` (both = the Postgres primary key) so existing consumers and the
// front-end AuthContext keep working after the Mongo -> Postgres migration.
export interface SafeUser {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phoneNumber: string;
  role: string;
  secondaryRoles: string[];
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  giftCardBalance: number;
  registrationAddress?: {
    recipientName: string;
    streetAddress: string;
    streetAddress2?: string;
    town: string;
    city: string;
    state: string;
    postalCode: string;
    countryCode: string;
    phoneNumber: string;
    type: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResult {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

type UserWithAddresses = Prisma.UserGetPayload<{ include: { addresses: true } }>;

const COUNTRY_MAP: Record<string, string> = {
  'Sri Lanka': 'LK',
  India: 'IN',
  'United States': 'US',
  'United Kingdom': 'GB',
  Australia: 'AU',
  Canada: 'CA',
};

function getCountryCode(country: string): string {
  return COUNTRY_MAP[country] || country.toUpperCase().slice(0, 2);
}

function mapRegistrationAddress(addresses: Address[]): SafeUser['registrationAddress'] {
  const reg = addresses.find((a) => a.isRegistration) || addresses[0];
  if (!reg) return null;
  return {
    recipientName: reg.recipientName,
    streetAddress: reg.streetAddress,
    streetAddress2: reg.streetAddress2 || undefined,
    town: reg.town,
    city: reg.city,
    state: reg.state,
    postalCode: reg.postalCode,
    countryCode: reg.countryCode,
    phoneNumber: reg.phoneNumber,
    type: reg.type,
  };
}

function toSafeUser(user: UserWithAddresses): SafeUser {
  return {
    _id: user.id,
    userId: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    secondaryRoles: user.secondaryRoles,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    giftCardBalance: Number(user.giftCardBalance),
    registrationAddress: mapRegistrationAddress(user.addresses),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function issueTokens(user: { id: string; email: string | null; role: string }) {
  const payload = { userId: user.id, email: user.email || undefined, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshTokenData = signRefreshToken(payload);
  return { accessToken, refreshTokenData };
}

export class AuthService {
  async signup(data: SignupData): Promise<AuthResult> {
    // Duplicate check (phone always; email only when provided).
    const or: Prisma.UserWhereInput[] = [{ phoneNumber: data.phoneNumber }];
    if (data.email) or.push({ email: data.email });
    const existingUser = await prisma.user.findFirst({ where: { OR: or } });

    if (existingUser) {
      if (data.email && existingUser.email === data.email) {
        throw new Error('User with this email already exists');
      }
      if (existingUser.phoneNumber === data.phoneNumber) {
        throw new Error('User with this phone number already exists');
      }
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        passwordHash,
        role: 'customer',
        addresses: {
          create: [
            {
              recipientName: `${data.firstName} ${data.lastName || ''}`.trim(),
              streetAddress: data.registrationAddress.addressLine1,
              streetAddress2: data.registrationAddress.addressLine2,
              town: data.registrationAddress.city,
              city: data.registrationAddress.city,
              state: data.registrationAddress.province,
              postalCode: data.registrationAddress.postalCode,
              countryCode: getCountryCode(data.registrationAddress.country),
              phoneNumber: data.phoneNumber,
              type: 'Home',
              isRegistration: true,
            },
          ],
        },
      },
      include: { addresses: true },
    });

    const { accessToken, refreshTokenData } = issueTokens(user);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        hashedToken: refreshTokenData.hashedToken,
        expiresAt: refreshTokenData.expiresAt,
      },
    });

    return { user: toSafeUser(user), accessToken, refreshToken: refreshTokenData.token };
  }

  async login(data: LoginData): Promise<AuthResult> {
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: data.identifier }, { phoneNumber: data.identifier }] },
      include: { addresses: true },
    });

    if (!user) throw new Error('Invalid credentials');
    if (user.isBanned) throw new Error('Account is banned');
    if (!user.passwordHash) throw new Error('Account does not have password authentication enabled');

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValidPassword) throw new Error('Invalid credentials');

    const { accessToken, refreshTokenData } = issueTokens(user);

    // Atomic insert of the new refresh token; prune expired ones separately.
    await prisma.$transaction([
      prisma.refreshToken.create({
        data: {
          userId: user.id,
          hashedToken: refreshTokenData.hashedToken,
          expiresAt: refreshTokenData.expiresAt,
        },
      }),
      prisma.refreshToken.deleteMany({
        where: { userId: user.id, expiresAt: { lt: new Date() } },
      }),
    ]);

    return { user: toSafeUser(user), accessToken, refreshToken: refreshTokenData.token };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const hashedToken = hashRefreshToken(refreshToken);

    const existing = await prisma.refreshToken.findFirst({
      where: { hashedToken, expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    if (!existing) throw new Error('Invalid or expired refresh token');
    if (existing.user.isBanned) throw new Error('Account is banned');

    const { accessToken, refreshTokenData } = issueTokens(existing.user);

    // Rotate: delete the used token, insert the new one atomically.
    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { id: existing.id } }),
      prisma.refreshToken.create({
        data: {
          userId: existing.userId,
          hashedToken: refreshTokenData.hashedToken,
          expiresAt: refreshTokenData.expiresAt,
        },
      }),
    ]);

    return { accessToken, refreshToken: refreshTokenData.token };
  }

  async logout(refreshToken: string): Promise<void> {
    const hashedToken = hashRefreshToken(refreshToken);
    await prisma.refreshToken.deleteMany({ where: { hashedToken } });
  }

  async logoutAll(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async getUserByToken(accessToken: string): Promise<SafeUser | null> {
    try {
      const payload = verifyToken(accessToken);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: { addresses: true },
      });
      if (!user || user.isBanned) return null;
      return toSafeUser(user);
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
