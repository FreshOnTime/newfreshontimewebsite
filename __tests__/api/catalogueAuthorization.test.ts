import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { POST as category } from '@/app/api/categories/route';
import { POST as legacyCategory } from '@/app/api/products/categories/route';
import { PUT as editCategory, DELETE as deleteCategory } from '@/app/api/products/categories/[id]/route';
import { POST as brand } from '@/app/api/products/brands/route';
import { PUT as editBrand, DELETE as deleteBrand } from '@/app/api/products/brands/[id]/route';
import { POST as addProduct } from '@/app/api/products/add/route';
jest.mock('@/lib/jwt', () => ({ verifyToken: () => ({ userId: 'user1', role: 'admin', type: 'access' }) }));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: { user: { findUnique: jest.fn() }, category: { findUnique: jest.fn(), create: jest.fn() } } }));
const db = prisma as unknown as { user: { findUnique: jest.Mock }; category: { findUnique: jest.Mock; create: jest.Mock } };
const request = (token = false) => ({ headers: new Headers(token ? { cookie: 'accessToken=token' } : {}), cookies: { get: () => undefined }, json: async () => ({ name: 'Produce', slug: 'produce' }) }) as unknown as NextRequest;
const context = { params: Promise.resolve({ id: 'category1' }) };
beforeEach(() => { jest.clearAllMocks(); db.user.findUnique.mockResolvedValue({ id: 'user1', role: 'customer', secondaryRoles: [] }); });
it.each([category, legacyCategory, editCategory, deleteCategory, brand, editBrand, deleteBrand])('blocks anonymous and customer catalogue mutations', async (handler) => {
  expect((await handler(request(), context)).status).toBe(401);
  expect((await handler(request(true), context)).status).toBe(403);
  expect(db.category.create).not.toHaveBeenCalled();
});
it('keeps the legacy product-add URL behind the validated admin route', async () => {
  expect((await addProduct(request())).status).toBe(403);
  expect((await addProduct(request(true))).status).toBe(403);
});
it('permits verified admins to create categories', async () => {
  db.user.findUnique.mockResolvedValue({ id: 'user1', role: 'admin' });
  db.category.findUnique.mockResolvedValue(null); db.category.create.mockResolvedValue({ id: 'category1' });
  expect((await category(request(true), context)).status).toBe(201); expect(db.category.create).toHaveBeenCalled();
});
it('blocks banned admins before catalogue writes', async () => {
  db.user.findUnique.mockResolvedValue({ id: 'user1', role: 'admin', isBanned: true });
  expect((await category(request(true), context)).status).toBe(401); expect(db.category.create).not.toHaveBeenCalled();
});
