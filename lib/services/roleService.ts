import prisma from "../prisma";

type RoleInput = { name?: string; description?: string | null; permissions?: string[] };

function serializeRole<T extends { id: string }>(role: T) {
  return { ...role, _id: role.id };
}

const roleInclude = { permissions: true };

export class RoleService {
  async getAllRoles() {
    const roles = await prisma.role.findMany({ include: roleInclude, orderBy: { createdAt: "desc" } });
    return roles.map(serializeRole);
  }

  async getRoleById(id: string) {
    const role = await prisma.role.findUnique({ where: { id }, include: roleInclude });
    return role ? serializeRole(role) : null;
  }

  async getRoleByName(name: string) {
    const role = await prisma.role.findUnique({ where: { name }, include: roleInclude });
    return role ? serializeRole(role) : null;
  }

  async createRole(roleData: RoleInput) {
    if (!roleData.name) throw new Error("Role name is required");
    const existingRole = await prisma.role.findUnique({ where: { name: roleData.name } });
    if (existingRole) throw new Error(`Role with name ${roleData.name} already exists`);
    return serializeRole(await prisma.role.create({
      data: {
        name: roleData.name,
        description: roleData.description ?? null,
        ...(roleData.permissions?.length
          ? { permissions: { connect: roleData.permissions.map((id) => ({ id })) } }
          : {}),
      },
      include: roleInclude,
    }));
  }

  async updateRole(id: string, updateData: RoleInput) {
    if (updateData.name) {
      const existingRole = await prisma.role.findUnique({ where: { name: updateData.name } });
      if (existingRole && existingRole.id !== id) throw new Error(`Role with name ${updateData.name} already exists`);
    }
    const role = await prisma.role.update({
      where: { id },
      data: {
        ...(updateData.name !== undefined ? { name: updateData.name } : {}),
        ...(updateData.description !== undefined ? { description: updateData.description } : {}),
        ...(updateData.permissions !== undefined
          ? { permissions: { set: updateData.permissions.map((permissionId) => ({ id: permissionId })) } }
          : {}),
      },
      include: roleInclude,
    }).catch(() => null);
    return role ? serializeRole(role) : null;
  }

  async deleteRole(id: string) {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) throw new Error("Role not found");
    await prisma.role.delete({ where: { id } });
  }

  async addPermissionToRole(roleId: string, permissionId: string) {
    const role = await prisma.role.update({
      where: { id: roleId },
      data: { permissions: { connect: { id: permissionId } } },
      include: roleInclude,
    }).catch(() => null);
    return role ? serializeRole(role) : null;
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    const role = await prisma.role.update({
      where: { id: roleId },
      data: { permissions: { disconnect: { id: permissionId } } },
      include: roleInclude,
    }).catch(() => null);
    return role ? serializeRole(role) : null;
  }
}

export const roleService = new RoleService();
