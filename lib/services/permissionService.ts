import Permission, { IPermission } from "../models/Permission";
import connectDB from "../db";

export class PermissionService {
  async getAllPermissions(): Promise<IPermission[]> {
    await connectDB();
    return await Permission.find().sort({ resource: 1, operation: 1 });
  }

  async getPermissionById(id: string): Promise<IPermission | null> {
    await connectDB();
    return await Permission.findById(id);
  }

  async createPermission(permissionData: Partial<IPermission>): Promise<IPermission> {
    await connectDB();
    
    // Check if permission with same resource and operation already exists
    const existingPermission = await Permission.findOne({ 
      resource: permissionData.resource,
      operation: permissionData.operation 
    });
    if (existingPermission) {
      throw new Error(`Permission for ${permissionData.resource}:${permissionData.operation} already exists`);
    }

    const permission = new Permission(permissionData);
    return await permission.save();
  }

  async updatePermission(id: string, updateData: Partial<IPermission>): Promise<IPermission | null> {
    await connectDB();
    
    // If updating resource or operation, check if it's unique
    if (updateData.resource || updateData.operation) {
      const current = await Permission.findById(id);
      if (!current) {
        throw new Error("Permission not found");
      }
      
      const resource = updateData.resource || current.resource;
      const operation = updateData.operation || current.operation;
      
      const existingPermission = await Permission.findOne({ 
        resource,
        operation,
        _id: { $ne: id } 
      });
      if (existingPermission) {
        throw new Error(`Permission for ${resource}:${operation} already exists`);
      }
    }

    return await Permission.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
  }

  async deletePermission(id: string): Promise<void> {
    await connectDB();
    
    const permission = await Permission.findById(id);
    if (!permission) {
      throw new Error("Permission not found");
    }

    await Permission.findByIdAndDelete(id);
  }

  async getPermissionsByResource(resource: string): Promise<IPermission[]> {
    await connectDB();
    return await Permission.find({ resource }).sort({ operation: 1 });
  }

  async syncPermissions(): Promise<void> {
    await connectDB();
    
    const defaultPermissions = [
      { resource: 'products', operation: 'create', description: 'Create products' },
      { resource: 'products', operation: 'read', description: 'Read products' },
      { resource: 'products', operation: 'update', description: 'Update products' },
      { resource: 'products', operation: 'delete', description: 'Delete products' },
      { resource: 'brands', operation: 'create', description: 'Create brands' },
      { resource: 'brands', operation: 'read', description: 'Read brands' },
      { resource: 'brands', operation: 'update', description: 'Update brands' },
      { resource: 'brands', operation: 'delete', description: 'Delete brands' },
      { resource: 'categories', operation: 'create', description: 'Create categories' },
      { resource: 'categories', operation: 'read', description: 'Read categories' },
      { resource: 'categories', operation: 'update', description: 'Update categories' },
      { resource: 'categories', operation: 'delete', description: 'Delete categories' },
      { resource: 'users', operation: 'create', description: 'Create users' },
      { resource: 'users', operation: 'read', description: 'Read users' },
      { resource: 'users', operation: 'update', description: 'Update users' },
      { resource: 'users', operation: 'delete', description: 'Delete users' },
      { resource: 'roles', operation: 'create', description: 'Create roles' },
      { resource: 'roles', operation: 'read', description: 'Read roles' },
      { resource: 'roles', operation: 'update', description: 'Update roles' },
      { resource: 'roles', operation: 'delete', description: 'Delete roles' },
      { resource: 'storage', operation: 'create', description: 'Upload files' },
      { resource: 'storage', operation: 'delete', description: 'Delete files' },
    ];

    for (const permData of defaultPermissions) {
      try {
        await this.createPermission(permData);
      } catch {
        // Permission already exists, skip
        console.log(`Permission ${permData.resource}:${permData.operation} already exists`);
      }
    }
  }
}

export const permissionService = new PermissionService();
