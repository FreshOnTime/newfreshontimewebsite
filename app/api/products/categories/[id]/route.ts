import { NextRequest } from "next/server";
import { productCategoryService } from "@/lib/services/productCategoryService";
import { sendSuccess, sendInternalError, sendNotFound, sendBadRequest } from "@/lib/utils/apiResponses";

// GET - Get a single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const category = await productCategoryService.getCategoryById(id);
    
    if (!category) {
      return sendNotFound("Category not found");
    }
    
    return sendSuccess("Category retrieved successfully", category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return sendInternalError("Failed to fetch category");
  }
}

// PUT - Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const updateData = await request.json();
    
    const category = await productCategoryService.updateCategory(id, updateData);
    
    if (!category) {
      return sendNotFound("Category not found");
    }
    
    return sendSuccess("Category updated successfully", category);
  } catch (error) {
    console.error("Error updating category:", error);
    if (error instanceof Error && error.message.includes("already exists")) {
      return sendBadRequest(error.message);
    }
    return sendInternalError("Failed to update category");
  }
}

// DELETE - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    await productCategoryService.deleteCategory(id);
    
    return sendSuccess("Category deleted successfully");
  } catch (error) {
    console.error("Error deleting category:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      return sendNotFound("Category not found");
    }
    return sendInternalError("Failed to delete category");
  }
}
