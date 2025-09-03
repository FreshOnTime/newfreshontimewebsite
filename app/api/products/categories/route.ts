import { NextRequest } from "next/server";
import { productCategoryService } from "@/lib/services/productCategoryService";
import { sendSuccess, sendInternalError, sendCreated, sendBadRequest } from "@/lib/utils/apiResponses";

// GET - Get all categories
export async function GET() {
  try {
    const categories = await productCategoryService.getAllCategories();
    return sendSuccess("Categories retrieved successfully", categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return sendInternalError("Failed to fetch categories");
  }
}

// POST - Create a new category
export async function POST(req: NextRequest) {
  try {
    const categoryData = await req.json();
    
    // Basic validation
    if (!categoryData.code || !categoryData.description) {
      return sendBadRequest("Code and description are required");
    }

    const category = await productCategoryService.createCategory(categoryData);
    return sendCreated("Category created successfully", category);
  } catch (error) {
    console.error("Error creating category:", error);
    if (error instanceof Error && error.message.includes("already exists")) {
      return sendBadRequest(error.message);
    }
    return sendInternalError("Failed to create category");
  }
}
