import ProductCategory, { IProductCategory } from "../models/ProductCategory";
import connectDB from "../db";

export class ProductCategoryService {
  async getAllCategories(): Promise<IProductCategory[]> {
    await connectDB();
    return await ProductCategory.find().sort({ createdAt: -1 });
  }

  async getCategoryById(id: string): Promise<IProductCategory | null> {
    await connectDB();
    return await ProductCategory.findById(id);
  }

  async createCategory(categoryData: Partial<IProductCategory>): Promise<IProductCategory> {
    await connectDB();
    
    // Check if category with same code already exists
    const existingCategory = await ProductCategory.findOne({ code: categoryData.code });
    if (existingCategory) {
      throw new Error(`Category with code ${categoryData.code} already exists`);
    }

    const category = new ProductCategory(categoryData);
    return await category.save();
  }

  async updateCategory(id: string, updateData: Partial<IProductCategory>): Promise<IProductCategory | null> {
    await connectDB();
    
    // If updating code, check if it's unique
    if (updateData.code) {
      const existingCategory = await ProductCategory.findOne({ 
        code: updateData.code, 
        _id: { $ne: id } 
      });
      if (existingCategory) {
        throw new Error(`Category with code ${updateData.code} already exists`);
      }
    }

    return await ProductCategory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
  }

  async deleteCategory(id: string): Promise<void> {
    await connectDB();
    
    const category = await ProductCategory.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }

    await ProductCategory.findByIdAndDelete(id);
  }
}

export const productCategoryService = new ProductCategoryService();
