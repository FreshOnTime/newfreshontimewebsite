import prisma from '@/lib/prisma';
import { productCardSelect, serializeProductCardForUi } from '@/lib/productSerializer';

// Shared by server pages and HTTP routes: no dependency on a deployed API URL.
export async function loadStorefrontHome() {
    const [rawProducts, allCategories] = await Promise.all([
      prisma.product.findMany({
        where: { archived: false },
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: productCardSelect,
      }),
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true, slug: true, description: true, imageUrl: true },
      }),
    ]);

    return {
        products: rawProducts.map(serializeProductCardForUi),
        categories: allCategories.map((category) => ({
          _id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description ?? undefined,
          imageUrl: category.imageUrl ?? undefined,
        })),
      };
}

export async function loadActiveSubscriptionPlans() {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
    include: { contents: true },
  });
  return plans.map((plan) => ({
    ...plan,
    _id: plan.id,
    price: Number(plan.price),
    originalPrice: plan.originalPrice == null ? null : Number(plan.originalPrice),
  }));
}
