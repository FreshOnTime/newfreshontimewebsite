import prisma from "../prisma";

type UserInput = {
  userId?: string;
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phoneNumber?: string;
  role?: "customer" | "supplier" | "admin" | "manager" | "delivery_staff" | "customer_support" | "marketing_specialist" | "order_processor" | "inventory_manager";
  passwordHash?: string | null;
};

function serializeUser<T extends { id: string }>(user: T) {
  return { ...user, _id: user.id, userId: user.id };
}

export class UserService {
  async createUser(userData: UserInput) {
    if (!userData.firstName || !userData.phoneNumber) throw new Error("firstName and phoneNumber are required");
    const user = await prisma.user.create({
      data: {
        ...(userData.userId ? { id: userData.userId } : {}),
        firstName: userData.firstName,
        lastName: userData.lastName ?? null,
        email: userData.email ?? null,
        phoneNumber: userData.phoneNumber,
        role: userData.role ?? "customer",
        passwordHash: userData.passwordHash ?? null,
      },
    });
    return serializeUser(user);
  }

  async findUserByEmail(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? serializeUser(user) : null;
  }

  async findUserById(userId: string) {
    const user = await prisma.user.findFirst({ where: { OR: [{ id: userId }, { phoneNumber: userId }] } });
    return user ? serializeUser(user) : null;
  }

  async findUserByPhone(phone: string) {
    const user = await prisma.user.findUnique({ where: { phoneNumber: phone } });
    return user ? serializeUser(user) : null;
  }

  async updateUser(userId: string, updateData: UserInput) {
    const existing = await prisma.user.findFirst({ where: { OR: [{ id: userId }, { phoneNumber: userId }] } });
    if (!existing) return null;
    const user = await prisma.user.update({
      where: { id: existing.id },
      data: {
        ...(updateData.firstName !== undefined ? { firstName: updateData.firstName } : {}),
        ...(updateData.lastName !== undefined ? { lastName: updateData.lastName } : {}),
        ...(updateData.email !== undefined ? { email: updateData.email } : {}),
        ...(updateData.phoneNumber !== undefined ? { phoneNumber: updateData.phoneNumber } : {}),
        ...(updateData.role !== undefined ? { role: updateData.role } : {}),
        ...(updateData.passwordHash !== undefined ? { passwordHash: updateData.passwordHash } : {}),
      },
    });
    return serializeUser(user);
  }

  async deleteUser(userId: string) {
    const existing = await prisma.user.findFirst({ where: { OR: [{ id: userId }, { phoneNumber: userId }] } });
    if (!existing) return null;
    const user = await prisma.user.delete({ where: { id: existing.id } });
    return serializeUser(user);
  }

  async getAllUsers(page = 1, limit = 10, filters?: Record<string, unknown>) {
    const skip = (page - 1) * limit;
    const where = {
      ...(filters?.role ? { role: filters.role as never } : {}),
      ...(filters?.search
        ? {
            OR: [
              { firstName: { contains: String(filters.search), mode: "insensitive" as const } },
              { lastName: { contains: String(filters.search), mode: "insensitive" as const } },
              { email: { contains: String(filters.search), mode: "insensitive" as const } },
              { phoneNumber: { contains: String(filters.search), mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.user.count({ where }),
    ]);
    return { users: users.map(serializeUser), total, page, limit };
  }
}
