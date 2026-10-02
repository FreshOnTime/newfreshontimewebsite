import { productUnitPrice, roundMoney } from '@/lib/commercePricing';
import { Prisma } from '@prisma/client';

// What the previous Mongo `populate` selected for bag item products.
export const BAG_INCLUDE = {
  items: {
    include: {
      product: { select: { id: true, name: true, sku: true, image: true, images: true, price: true, discountPercentage: true, archived: true, stockQty: true, slug: true } },
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
    totalAmount: roundMoney(bag.items.reduce((sum, item) => sum + productUnitPrice(item.product) * item.quantity, 0)),
    isActive: bag.isActive,
    createdAt: bag.createdAt,
    updatedAt: bag.updatedAt,
    items: bag.items.map((it) => ({
      _id: it.id,
      quantity: it.quantity,
      price: productUnitPrice(it.product),
      product: {
        _id: it.product.id,
        name: it.product.name,
        sku: it.product.sku,
        image: it.product.image,
        images: it.product.images,
        price: productUnitPrice(it.product),
        stockQty: it.product.archived ? 0 : it.product.stockQty,
        slug: it.product.slug,
      },
    })),
  };
}

export function bagTotal(items: Array<{ price: number; quantity: number }>): number {
  return roundMoney(items.reduce((sum, i) => sum + i.price * i.quantity, 0));
}
