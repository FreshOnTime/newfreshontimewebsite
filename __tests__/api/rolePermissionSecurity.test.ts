import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { GET as listRoles, POST as createRole } from '@/app/api/roles/route';
import { GET as readRole, PUT as updateRole, DELETE as removeRole } from '@/app/api/roles/[id]/route';
import { POST as grantPermission } from '@/app/api/roles/[id]/permissions/route';
import { DELETE as revokePermission } from '@/app/api/roles/[id]/permissions/[permissionId]/route';
import { GET as listPermissions, POST as createPermission } from '@/app/api/permissions/route';
import { PUT as updatePermission, DELETE as removePermission } from '@/app/api/permissions/[id]/route';
import { GET as listProducts } from '@/app/api/products/route';
import { roleService } from '@/lib/services/roleService';
import { permissionService } from '@/lib/services/permissionService';

jest.mock('@/lib/jwt', () => ({ verifyToken: () => ({ userId: 'actor', role: 'admin', type: 'access' }) }));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: {
  user: { findUnique: jest.fn() }, product: { findMany: jest.fn() },
} }));
jest.mock('@/lib/services/roleService', () => ({ roleService: {
  getAllRoles: jest.fn(), getRoleById: jest.fn(), createRole: jest.fn(),
  updateRole: jest.fn(), deleteRole: jest.fn(), addPermissionToRole: jest.fn(), removePermissionFromRole: jest.fn(),
} }));
jest.mock('@/lib/services/permissionService', () => ({ permissionService: {
  getAllPermissions: jest.fn(), createPermission: jest.fn(), updatePermission: jest.fn(), deletePermission: jest.fn(),
} }));

const db = prisma as unknown as { user: { findUnique: jest.Mock }; product: { findMany: jest.Mock } };
const context = { params: Promise.resolve({ id: 'role1', permissionId: 'perm1' }) };
const req = (authenticated: boolean, method: string) => new NextRequest('https://freshpick.lk/api/roles', {
  method, headers: authenticated ? { cookie: 'accessToken=valid', 'content-type': 'application/json' } : { 'content-type': 'application/json' },
  ...(method === 'POST' || method === 'PUT' ? { body: JSON.stringify({ name: 'staff', resource: 'orders:read', operation: 'read', description: 'Read orders', permissionId: 'perm1' }) } : {}),
});
const mutations = [
  ['create role', createRole, 'POST'], ['update role', updateRole, 'PUT'], ['delete role', removeRole, 'DELETE'],
  ['grant permission', grantPermission, 'POST'], ['revoke permission', revokePermission, 'DELETE'],
  ['create permission', createPermission, 'POST'], ['update permission', updatePermission, 'PUT'],
  ['delete permission', removePermission, 'DELETE'],
] as const;
const reads = [listRoles, readRole, listPermissions];

beforeEach(() => {
  jest.clearAllMocks();
  db.user.findUnique.mockResolvedValue({ id: 'actor', role: 'customer', secondaryRoles: [], isBanned: false });
});

describe('Role/permission APIs are administrator-only', () => {
  it.each(mutations)('denies anonymous %s', async (_label, handler, method) => {
    expect((await handler(req(false, method), context)).status).toBe(401);
    expect(db.user.findUnique).not.toHaveBeenCalled();
  });
  it.each(mutations)('denies customer %s', async (_label, handler, method) => {
    expect((await handler(req(true, method), context)).status).toBe(403);
  });
  it.each(reads)('does not disclose role and permission configuration to anonymous users', async handler => {
    expect((await handler(req(false, 'GET'), context)).status).toBe(401);
  });
  it('rejects banned administrator accounts', async () => {
    db.user.findUnique.mockResolvedValue({ id: 'actor', role: 'admin', secondaryRoles: [], isBanned: true });
    expect((await createRole(req(true, 'POST'), context)).status).toBe(401);
    expect(roleService.createRole).not.toHaveBeenCalled();
  });
  it('permits a verified admin to create a role and permission', async () => {
    db.user.findUnique.mockResolvedValue({ id: 'actor', role: 'admin', secondaryRoles: [], isBanned: false });
    (roleService.createRole as jest.Mock).mockResolvedValue({ id: 'role1' });
    (permissionService.createPermission as jest.Mock).mockResolvedValue({ id: 'perm1' });
    expect((await createRole(req(true, 'POST'), context)).status).toBe(201);
    expect((await createPermission(req(true, 'POST'), context)).status).toBe(201);
  });
});

it('never exposes archived products via public query parameters', async () => {
  db.product.findMany.mockResolvedValue([]);
  const response = await listProducts(new NextRequest('https://freshpick.lk/api/products?archived=true'));
  expect(response.status).toBe(200);
  expect(db.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
    where: expect.objectContaining({ archived: false }),
  }));
});
