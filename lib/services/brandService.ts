import Brand, { IBrand } from "../models/Brand";
import connectDB from "../db";

export class BrandService {
  async getAllBrands(): Promise<IBrand[]> {
    await connectDB();
    return await Brand.find().sort({ createdAt: -1 });
  }

  async getBrandById(id: string): Promise<IBrand | null> {
    await connectDB();
    return await Brand.findById(id);
  }

  async createBrand(brandData: Partial<IBrand>): Promise<IBrand> {
    await connectDB();
    
    // Check if brand with same code already exists
    const existingBrand = await Brand.findOne({ code: brandData.code });
    if (existingBrand) {
      throw new Error(`Brand with code ${brandData.code} already exists`);
    }

    const brand = new Brand(brandData);
    return await brand.save();
  }

  async updateBrand(id: string, updateData: Partial<IBrand>): Promise<IBrand | null> {
    await connectDB();
    
    // If updating code, check if it's unique
    if (updateData.code) {
      const existingBrand = await Brand.findOne({ 
        code: updateData.code, 
        _id: { $ne: id } 
      });
      if (existingBrand) {
        throw new Error(`Brand with code ${updateData.code} already exists`);
      }
    }

    return await Brand.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
  }

  async deleteBrand(id: string): Promise<void> {
    await connectDB();
    
    const brand = await Brand.findById(id);
    if (!brand) {
      throw new Error("Brand not found");
    }

    await Brand.findByIdAndDelete(id);
  }
}

export const brandService = new BrandService();
