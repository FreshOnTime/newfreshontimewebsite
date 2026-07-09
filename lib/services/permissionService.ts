import prisma from "../prisma";

type PermissionInput = { resource?: string; operation?: string; description?: string };

function serializePermission<T extends { id: string }>(permission: T) {
  return { ...permission, _id: permission.id };
}

export class PermissionService {
  async getAllPermissions() {
    const permissions = await prisma.permission.findMany({ orderBy: [{ resource: "asc" }, { operation: "asc" }] });
    return permissions.map(serializePermission);
  }

  async getPermissionById(id: string) {
    const permission = await prisma.permission.findUnique({ where: { id } });
    return permission ? serializePermission(permission) : null;
  }

  async createPermission(permissionData: PermissionInput) {
    if (!permissionData.resource || !permissionData.operation || !permissionData.description) {
      throw new Error("Resource, operation, and description are required");
    }
    const existingPermission = await prisma.permission.findUnique({ where: { resource: permissionData.resource } });
    if (existingPermission) throw new Error(`Permission for ${permissionData.resource}:${permissionData.operation} already exists`);
    return serializePermission(await prisma.permission.create({
      data: {
        resource: permissionData.resource,
        operation: permissionData.operation,
        description: permissionData.description,
      },
    }));
  }

  async updatePermission(id: string, updateData: PermissionInput) {
    if (updateData.resource) {
      const existingPermission = await prisma.permission.findUnique({ where: { resource: updateData.resource } });
      if (existingPermission && existingPermission.id !== id) {
        throw new Error(`Permission for ${updateData.resource}:${updateData.operation || existingPermission.operation} already exists`);
      }
    }
    const permission = await prisma.permission.update({
      where: { id },
      data: {
        ...(updateData.resource !== undefined ? { resource: updateData.resource } : {}),
        ...(updateData.operation !== undefined ? { operation: updateData.operation } : {}),
        ...(updateData.description !== undefined ? { description: updateData.description } : {}),
      },
    }).catch(() => null);
    return permission ? serializePermission(permission) : null;
  }

  async deletePermission(id: string) {
    const permission = await prisma.permission.findUnique({ where: { id } });
    if (!permission) throw new Error("Permission not found");
    await prisma.permission.delete({ where: { id } });
  }

  async getPermissionsByResource(resource: string) {
    const permissions = await prisma.permission.findMany({ where: { resource }, orderBy: { operation: "asc" } });
    return permissions.map(serializePermission);
  }

  async syncPermissions() {
    const defaultPermissions = [
      { resource: 'products:create', operation: 'create', description: 'Create products' },
      { resource: 'products:read', operation: 'read', description: 'Read products' },
      { resource: 'products:update', operation: 'update', description: 'Update products' },
      { resource: 'products:delete', operation: 'delete', description: 'Delete products' },
      { resource: 'brands:create', operation: 'create', description: 'Create brands' },
      { resource: 'brands:read', operation: 'read', description: 'Read brands' },
      { resource: 'brands:update', operation: 'update', description: 'Update brands' },
      { resource: 'brands:delete', operation: 'delete', description: 'Delete brands' },
      { resource: 'categories:create', operation: 'create', description: 'Create categories' },
      { resource: 'categories:read', operation: 'read', description: 'Read categories' },
      { resource: 'categories:update', operation: 'update', description: 'Update categories' },
      { resource: 'categories:delete', operation: 'delete', description: 'Delete categories' },
      { resource: 'users:create', operation: 'create', description: 'Create users' },
      { resource: 'users:read', operation: 'read', description: 'Read users' },
      { resource: 'users:update', operation: 'update', description: 'Update users' },
      { resource: 'users:delete', operation: 'delete', description: 'Delete users' },
      { resource: 'roles:create', operation: 'create', description: 'Create roles' },
      { resource: 'roles:read', operation: 'read', description: 'Read roles' },
      { resource: 'roles:update', operation: 'update', description: 'Update roles' },
      { resource: 'roles:delete', operation: 'delete', description: 'Delete roles' },
      { resource: 'storage:create', operation: 'create', description: 'Upload files' },
      { resource: 'storage:delete', operation: 'delete', description: 'Delete files' },
    ];

    for (const permData of defaultPermissions) {
      await prisma.permission.upsert({
        where: { resource: permData.resource },
        update: { operation: permData.operation, description: permData.description },
        create: permData,
      });
    }
  }
}

export const permissionService = new PermissionService();
