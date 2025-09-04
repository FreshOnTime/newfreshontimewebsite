import User, { IUser } from "../models/User";
import Customer from "../models/Customer";

export class UserService {
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    const saved = await user.save();

    // Mirror into Customer collection if role is customer
    try {
      const role = saved.role || 'customer';
      if (role === 'customer') {
        const fullName = `${saved.firstName} ${saved.lastName || ''}`.trim();
        const address = saved.registrationAddress ? {
          street: [saved.registrationAddress.streetAddress, saved.registrationAddress.streetAddress2].filter(Boolean).join(', '),
          city: saved.registrationAddress.city || saved.registrationAddress.town,
          state: saved.registrationAddress.state,
          zipCode: saved.registrationAddress.postalCode,
          country: saved.registrationAddress.countryCode,
        } : undefined;

        const email = saved.email || `${saved.userId}@placeholder.local`;
        const existing = await Customer.findOne({ email });
        if (!existing) {
          await Customer.create({
            name: fullName || saved.phoneNumber,
            email,
            phone: saved.phoneNumber,
            address,
          });
        }
      }
    } catch (e) {
      console.error('Customer sync from createUser failed:', e);
    }

    return saved;
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async findUserById(userId: string): Promise<IUser | null> {
    return await User.findOne({ userId: userId });
  }

  async findUserByPhone(phone: string): Promise<IUser | null> {
    return await User.findOne({ phoneNumber: phone });
  }

  async updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return await User.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, runValidators: true }
    );
  }

  async deleteUser(userId: string): Promise<IUser | null> {
    return await User.findOneAndDelete({ userId });
  }

  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    filters?: Record<string, any>
  ): Promise<{ users: IUser[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    
    const query = filters ? { ...filters, isDeleted: { $ne: true } } : { isDeleted: { $ne: true } };
    
    const users = await User.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);
    
    return {
      users,
      total,
      page,
      limit,
    };
  }
}
