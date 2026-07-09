import { Prisma } from '@prisma/client';

// What the previous Mongo `populate` selected for bag item products.
export const BAG_INCLUDE = {
  items: {
    include: {
      product: { select: { id: true, name: true, images: true, price: true, stockQty: true, slug: true } },
    },
  },
} satisfies Prisma.BagInclude;

type BagWithItems = Prisma.BagGetPayload<{ include: typeof BAG_INCLUDE }>;

export function serializeBag(bag: BagWithItems) {
  return {
    _id: bag.id,
    name: bag.name,
    description: bag.description,
    tags: bag.tags,
    totalAmount: Number(bag.totalAmount),
    isActive: bag.isActive,
    createdAt: bag.createdAt,
    updatedAt: bag.updatedAt,
    items: bag.items.map((it) => ({
      _id: it.id,
      quantity: it.quantity,
      price: Number(it.price),
      product: {
        _id: it.product.id,
        name: it.product.name,
        images: it.product.images,
        price: Number(it.product.price),
        stockQty: it.product.stockQty,
        slug: it.product.slug,
      },
    })),
  };
}

export function bagTotal(items: Array<{ price: number; quantity: number }>): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}
