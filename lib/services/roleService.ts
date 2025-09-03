import Role, { IRole } from "../models/Role";
import connectDB from "../db";

export class RoleService {
  async getAllRoles(): Promise<IRole[]> {
    await connectDB();
    return await Role.find().populate('permissions').sort({ createdAt: -1 });
  }

  async getRoleById(id: string): Promise<IRole | null> {
    await connectDB();
    return await Role.findById(id).populate('permissions');
  }

  async getRoleByName(name: string): Promise<IRole | null> {
    await connectDB();
    return await Role.findOne({ name }).populate('permissions');
  }

  async createRole(roleData: Partial<IRole>): Promise<IRole> {
    await connectDB();
    
    // Check if role with same name already exists
    const existingRole = await Role.findOne({ name: roleData.name });
    if (existingRole) {
      throw new Error(`Role with name ${roleData.name} already exists`);
    }

    const role = new Role(roleData);
    await role.save();
    return await role.populate('permissions');
  }

  async updateRole(id: string, updateData: Partial<IRole>): Promise<IRole | null> {
    await connectDB();
    
    // If updating name, check if it's unique
    if (updateData.name) {
      const existingRole = await Role.findOne({ 
        name: updateData.name, 
        _id: { $ne: id } 
      });
      if (existingRole) {
        throw new Error(`Role with name ${updateData.name} already exists`);
      }
    }

    const role = await Role.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('permissions');
    
    return role;
  }

  async deleteRole(id: string): Promise<void> {
    await connectDB();
    
    const role = await Role.findById(id);
    if (!role) {
      throw new Error("Role not found");
    }

    await Role.findByIdAndDelete(id);
  }

  async addPermissionToRole(roleId: string, permissionId: string): Promise<IRole | null> {
    await connectDB();
    
    const role = await Role.findByIdAndUpdate(
      roleId,
      { $addToSet: { permissions: permissionId } },
      { new: true }
    ).populate('permissions');
    
    return role;
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<IRole | null> {
    await connectDB();
    
    const role = await Role.findByIdAndUpdate(
      roleId,
      { $pull: { permissions: permissionId } },
      { new: true }
    ).populate('permissions');
    
    return role;
  }
}

export const roleService = new RoleService();
