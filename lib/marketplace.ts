import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { productCardSelect, serializeProductCardForUi } from '@/lib/productSerializer';

export const approvedShop = { status: 'active', applicationStatus: 'approved' } as const;
const shopFields = { id: true, name: true, city: true };
const sessionFields = { id: true, title: true, details: true, occasion: true, startsAt: true, priceLkr: true, remaining: true, supplier: { select: shopFields } };

const isCalendarPending = (error: unknown) => error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === 'P2021' && String(error.meta?.table).includes('ExperienceSession');

export async function listShops(page = 1, query = '') {
  const filters = { ...approvedShop, name: { contains: query, mode: 'insensitive' as const } };
  const selection = { select: shopFields, orderBy: [{ name: 'asc' }, { id: 'asc' }], take: 24, skip: (page - 1) * 24 } satisfies Prisma.SupplierFindManyArgs;
  const sellingProducts = { catalog: { some: { archived: false } } };
  try {
    return await prisma.supplier.findMany({ ...selection, where: { ...filters, OR: [
      sellingProducts, { sessions: { some: { closed: false, startsAt: { gt: new Date() } } } },
    ] } });
  } catch (error) {
    if (!isCalendarPending(error)) throw error;
    return prisma.supplier.findMany({ ...selection, where: { ...filters, ...sellingProducts } });
  }
}

export async function getShop(id: string, page = 1) {
  const shop = await prisma.supplier.findFirst({ where: { id, ...approvedShop }, select: shopFields });
  if (!shop) return null;
  const [products, sessions] = await Promise.all([
    prisma.product.findMany({ where: { supplierId: id, archived: false }, select: productCardSelect,
      orderBy: [{ name: 'asc' }, { id: 'asc' }], take: 24, skip: (page - 1) * 24 }),
    listSessions({ supplierId: id, page }),
  ]);
  return { ...shop, products: products.map(serializeProductCardForUi), sessions };
}

export async function listSessions({ supplierId, occasion, query, page = 1 }: { supplierId?: string; occasion?: string; query?: string; page?: number } = {}) {
  return prisma.experienceSession.findMany({
    where: { supplierId, occasion, title: { contains: query, mode: 'insensitive' }, supplier: approvedShop, closed: false, startsAt: { gt: new Date() }, remaining: { gt: 0 } },
    select: sessionFields, orderBy: [{ startsAt: 'asc' }, { id: 'asc' }], take: 24, skip: (page - 1) * 24,
  }).catch(error => {
    if (isCalendarPending(error)) return [];
    throw error;
  });
}

export function getSession(id: string) {
  return prisma.experienceSession.findFirst({ where: { id, supplier: approvedShop }, select: { ...sessionFields, closed: true } });
}
