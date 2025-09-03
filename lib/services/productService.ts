import { ValidationError } from "../utils/errors";
import Product, { IProduct } from "../models/Product";

export class ProductService {
  async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
    const product = new Product(productData);
    await product.save();
    return product;
  }

  async updateProduct(
    productId: string,
    updateData: Partial<IProduct>
  ): Promise<IProduct | null> {
    const product = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      throw new ValidationError("Product not found");
    }

    return product;
  }

  // Soft delete implementation
  async deleteProduct(productId: string): Promise<void> {
    const product = await Product.findById(productId);
    if (!product) {
      throw new ValidationError("Product not found");
    }

    // Soft delete by setting isDeleted to true
    await Product.findByIdAndUpdate(productId, { isDeleted: true });
  }

  // Permanent delete for admin users
  async permanentlyDeleteProduct(productId: string): Promise<void> {
    const product = await Product.findById(productId);
    if (!product) {
      throw new ValidationError("Product not found");
    }

    await Product.findByIdAndDelete(productId);
  }

  async getProductById(productId: string): Promise<IProduct | null> {
    try {
      const product = await Product.findOne({
        _id: productId,
        isDisabled: false,
        isDeleted: false,
      })
        .populate("brand")
        .populate("category");

      if (!product) {
        throw new ValidationError("Product not found");
      }
      return product;
    } catch (error) {
      console.error("Failed to get product:", error);
      throw new ValidationError("Failed to get product");
    }
  }

  async getAllProducts(
    options: {
      includeDisabled?: boolean;
      includeDeleted?: boolean;
      brandId?: string;
      categoryId?: string;
      page?: number;
      limit?: number;
      search?: string;
    } = {}
  ): Promise<{
    products: IProduct[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      includeDisabled = false,
      includeDeleted = false,
      brandId,
      categoryId,
      page = 1,
      limit = 10,
      search
    } = options;

    const filter: Record<string, unknown> = {};

    if (!includeDisabled) {
      filter.isDisabled = false;
    }

    if (!includeDeleted) {
      filter.isDeleted = false;
    }

    if (brandId) {
      filter.brand = brandId;
    }

    if (categoryId) {
      filter.category = categoryId;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .populate("brand")
      .populate("category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    return {
      products,
      total,
      page,
      limit,
    };
  }

  async getFeaturedProducts(limit: number = 10): Promise<IProduct[]> {
    return Product.find({
      isFeatured: true,
      isDisabled: false,
      isDeleted: false,
    })
      .populate("brand")
      .populate("category")
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async getProductsByCategory(categoryId: string, limit?: number): Promise<IProduct[]> {
    const query = Product.find({
      category: categoryId,
      isDisabled: false,
      isDeleted: false,
    })
      .populate("brand")
      .populate("category")
      .sort({ createdAt: -1 });

    if (limit) {
      query.limit(limit);
    }

    return query;
  }

  async getProductsByBrand(brandId: string, limit?: number): Promise<IProduct[]> {
    const query = Product.find({
      brand: brandId,
      isDisabled: false,
      isDeleted: false,
    })
      .populate("brand")
      .populate("category")
      .sort({ createdAt: -1 });

    if (limit) {
      query.limit(limit);
    }

    return query;
  }
}
