import prisma from "../prisma";

type CategoryInput = { code?: string; description?: string; name?: string };

function serializeCategory<T extends { id: string; slug: string; name: string; description: string | null }>(category: T) {
  return { ...category, _id: category.id, code: category.slug };
}

export class ProductCategoryService {
  async getAllCategories() {
    const categories = await prisma.category.findMany({ orderBy: { createdAt: "desc" } });
    return categories.map(serializeCategory);
  }

  async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    return category ? serializeCategory(category) : null;
  }

  async createCategory(categoryData: CategoryInput) {
    if (!categoryData.code || !categoryData.description) throw new Error("Code and description are required");
    const existingCategory = await prisma.category.findUnique({ where: { slug: categoryData.code } });
    if (existingCategory) throw new Error(`Category with code ${categoryData.code} already exists`);
    return serializeCategory(await prisma.category.create({
      data: {
        slug: categoryData.code,
        name: categoryData.name || categoryData.description,
        description: categoryData.description,
      },
    }));
  }

  async updateCategory(id: string, updateData: CategoryInput) {
    if (updateData.code) {
      const existingCategory = await prisma.category.findUnique({ where: { slug: updateData.code } });
      if (existingCategory && existingCategory.id !== id) throw new Error(`Category with code ${updateData.code} already exists`);
    }
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(updateData.code !== undefined ? { slug: updateData.code } : {}),
        ...(updateData.name !== undefined ? { name: updateData.name } : {}),
        ...(updateData.description !== undefined ? { description: updateData.description } : {}),
      },
    }).catch(() => null);
    return category ? serializeCategory(category) : null;
  }

  async deleteCategory(id: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new Error("Category not found");
    await prisma.category.delete({ where: { id } });
  }
}

export const productCategoryService = new ProductCategoryService();
