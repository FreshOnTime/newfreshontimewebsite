import prisma from "../prisma";

type BrandInput = { code?: string; name?: string; description?: string | null };

function serializeBrand<T extends { id: string }>(brand: T) {
  return { ...brand, _id: brand.id };
}

export class BrandService {
  async getAllBrands() {
    const brands = await prisma.brand.findMany({ orderBy: { createdAt: "desc" } });
    return brands.map(serializeBrand);
  }

  async getBrandById(id: string) {
    const brand = await prisma.brand.findUnique({ where: { id } });
    return brand ? serializeBrand(brand) : null;
  }

  async createBrand(brandData: BrandInput) {
    if (!brandData.code || !brandData.name) throw new Error("Code and name are required");
    const existingBrand = await prisma.brand.findUnique({ where: { code: brandData.code } });
    if (existingBrand) throw new Error(`Brand with code ${brandData.code} already exists`);
    return serializeBrand(await prisma.brand.create({
      data: {
        code: brandData.code,
        name: brandData.name,
        description: brandData.description ?? null,
      },
    }));
  }

  async updateBrand(id: string, updateData: BrandInput) {
    if (updateData.code) {
      const existingBrand = await prisma.brand.findUnique({ where: { code: updateData.code } });
      if (existingBrand && existingBrand.id !== id) throw new Error(`Brand with code ${updateData.code} already exists`);
    }
    const brand = await prisma.brand.update({
      where: { id },
      data: {
        ...(updateData.code !== undefined ? { code: updateData.code } : {}),
        ...(updateData.name !== undefined ? { name: updateData.name } : {}),
        ...(updateData.description !== undefined ? { description: updateData.description } : {}),
      },
    }).catch(() => null);
    return brand ? serializeBrand(brand) : null;
  }

  async deleteBrand(id: string) {
    const brand = await prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new Error("Brand not found");
    await prisma.brand.delete({ where: { id } });
  }
}

export const brandService = new BrandService();
