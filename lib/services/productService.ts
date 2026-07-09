import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { ValidationError } from "../utils/errors";

type ProductInput = {
  name?: string;
  sku?: string;
  slug?: string;
  description?: string | null;
  price?: number;
  costPrice?: number;
  categoryId?: string | null;
  supplierId?: string | null;
  stockQty?: number;
  minStockLevel?: number;
  image?: string | null;
  images?: string[];
  tags?: string[];
  attributes?: Record<string, unknown>;
  isFeatured?: boolean;
  archived?: boolean;
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

function serializeProduct<T extends { id: string; price: Prisma.Decimal; costPrice: Prisma.Decimal; discountPercentage: Prisma.Decimal }>(product: T) {
  return {
    ...product,
    _id: product.id,
    price: Number(product.price),
    costPrice: Number(product.costPrice),
    discountPercentage: Number(product.discountPercentage),
  };
}

export class ProductService {
  async createProduct(productData: ProductInput) {
    if (!productData.name || !productData.sku || productData.price == null) {
      throw new ValidationError("name, sku, and price are required");
    }
    const sku = productData.sku.toUpperCase().trim();
    const product = await prisma.product.create({
      data: {
        name: productData.name,
        sku,
        slug: productData.slug ? slugify(productData.slug) : slugify(productData.name),
        description: productData.description ?? null,
        price: productData.price,
        costPrice: productData.costPrice ?? 0,
        categoryId: productData.categoryId ?? null,
        supplierId: productData.supplierId ?? null,
        stockQty: productData.stockQty ?? 0,
        minStockLevel: productData.minStockLevel ?? 5,
        image: productData.image ?? null,
        images: productData.images ?? [],
        tags: productData.tags ?? [],
        attributes: (productData.attributes ?? {}) as Prisma.InputJsonValue,
        isFeatured: productData.isFeatured ?? false,
        archived: productData.archived ?? false,
      },
    });
    return serializeProduct(product);
  }

  async updateProduct(productId: string, updateData: ProductInput) {
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(updateData.name !== undefined ? { name: updateData.name } : {}),
        ...(updateData.sku !== undefined ? { sku: updateData.sku.toUpperCase().trim() } : {}),
        ...(updateData.slug !== undefined ? { slug: slugify(updateData.slug) } : {}),
        ...(updateData.description !== undefined ? { description: updateData.description } : {}),
        ...(updateData.price !== undefined ? { price: updateData.price } : {}),
        ...(updateData.costPrice !== undefined ? { costPrice: updateData.costPrice } : {}),
        ...(updateData.categoryId !== undefined ? { categoryId: updateData.categoryId } : {}),
        ...(updateData.supplierId !== undefined ? { supplierId: updateData.supplierId } : {}),
        ...(updateData.stockQty !== undefined ? { stockQty: updateData.stockQty } : {}),
        ...(updateData.minStockLevel !== undefined ? { minStockLevel: updateData.minStockLevel } : {}),
        ...(updateData.image !== undefined ? { image: updateData.image } : {}),
        ...(updateData.images !== undefined ? { images: updateData.images } : {}),
        ...(updateData.tags !== undefined ? { tags: updateData.tags } : {}),
        ...(updateData.attributes !== undefined ? { attributes: updateData.attributes as Prisma.InputJsonValue } : {}),
        ...(updateData.isFeatured !== undefined ? { isFeatured: updateData.isFeatured } : {}),
        ...(updateData.archived !== undefined ? { archived: updateData.archived } : {}),
      },
    }).catch(() => null);
    if (!product) throw new ValidationError("Product not found");
    return serializeProduct(product);
  }

  async deleteProduct(productId: string) {
    await this.updateProduct(productId, { archived: true });
  }

  async permanentlyDeleteProduct(productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new ValidationError("Product not found");
    await prisma.product.delete({ where: { id: productId } });
  }

  async getProductById(productId: string) {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id: productId }, { sku: productId }, { slug: productId }], archived: false },
      include: { category: true, supplier: true },
    });
    if (!product) throw new ValidationError("Product not found");
    return serializeProduct(product);
  }

  async getAllProducts(options: {
    includeDisabled?: boolean;
    includeDeleted?: boolean;
    brandId?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
    search?: string;
  } = {}) {
    const { includeDeleted = false, categoryId, page = 1, limit = 10, search } = options;
    const where: Prisma.ProductWhereInput = {};
    if (!includeDeleted) where.archived = false;
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, include: { category: true, supplier: true }, orderBy: { createdAt: "desc" }, skip, take: limit }),
      prisma.product.count({ where }),
    ]);

    return { products: products.map(serializeProduct), total, page, limit };
  }

  async getFeaturedProducts(limit = 10) {
    const products = await prisma.product.findMany({
      where: { isFeatured: true, archived: false },
      include: { category: true, supplier: true },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    return products.map(serializeProduct);
  }

  async getProductsByCategory(categoryId: string, limit?: number) {
    const products = await prisma.product.findMany({
      where: { categoryId, archived: false },
      include: { category: true, supplier: true },
      ...(limit ? { take: limit } : {}),
      orderBy: { createdAt: "desc" },
    });
    return products.map(serializeProduct);
  }

  async getProductsByBrand(_brandId: string, limit?: number) {
    return this.getAllProducts({ limit: limit ?? 10 });
  }
}
