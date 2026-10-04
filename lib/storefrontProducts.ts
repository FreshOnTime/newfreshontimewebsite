import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { productCardSelect, serializeProductCardForUi, serializeProductForUi } from '@/lib/productSerializer';

export async function loadStorefrontProducts(query: string) {
    const params = new URLSearchParams(query);
    const pageParam = parseInt(params.get("page") || "1", 10);
    const limitParam = parseInt(params.get("limit") || "24", 10);
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limitBase = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 24;
    const limit = Math.min(Math.max(limitBase, 1), 60);

    const search = params.get("search");
    const categoryId = params.get("categoryId");
    const supplierId = params.get("supplierId");
    const minPriceParam = params.get("minPrice");
    const maxPriceParam = params.get("maxPrice");
    const inStockParam = params.get("inStock");
    const sortParam = params.get("sort");
    const tagsParam = params.get("tags");

    const where: Prisma.ProductWhereInput = { archived: false };

    if (tagsParam) {
      const tags = tagsParam.split(",").map((tag) => tag.trim()).filter(Boolean);
      if (tags.length) where.tags = { hasSome: tags };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (supplierId) where.supplierId = supplierId;

    const minPrice = minPriceParam ? parseFloat(minPriceParam) : undefined;
    const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : undefined;
    if ((typeof minPrice === "number" && Number.isFinite(minPrice)) || (typeof maxPrice === "number" && Number.isFinite(maxPrice))) {
      where.price = {};
      if (typeof minPrice === "number" && Number.isFinite(minPrice)) where.price.gte = minPrice;
      if (typeof maxPrice === "number" && Number.isFinite(maxPrice)) where.price.lte = maxPrice;
    }

    if (inStockParam === "true") where.stockQty = { gt: 0 };

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    if (sortParam === "price-asc") orderBy = { price: "asc" };
    else if (sortParam === "price-desc") orderBy = { price: "desc" };
    else if (sortParam === "oldest") orderBy = { createdAt: "asc" };

    const [rawProducts, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: [orderBy, { id: "asc" }],
        skip: Math.max(0, (page - 1) * limit),
        take: limit + 1,
        select: productCardSelect,
      }),
      prisma.product.count({ where }),
    ]);

    const hasNext = rawProducts.length > limit;
    const products = rawProducts.slice(0, limit).map(serializeProductCardForUi);

    return {
        products,
        pagination: {
          page,
          limit,
          count: products.length,
          total,
          hasNext,
          hasPrev: page > 1,
        },
      };
}

export async function loadStorefrontProduct(id: string) {
  const product = await prisma.product.findFirst({
    where: { OR: [{ id }, { sku: id }, { slug: id }] },
    include: { category: { select: { name: true, slug: true } } },
  });
  if (!product || product.archived) return null;
  return serializeProductForUi(product);
}
