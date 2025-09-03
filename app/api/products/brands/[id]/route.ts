import { NextRequest } from "next/server";
import { brandService } from "@/lib/services/brandService";
import { sendSuccess, sendInternalError, sendNotFound, sendBadRequest } from "@/lib/utils/apiResponses";

// GET - Get a single brand
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const brand = await brandService.getBrandById(id);
    
    if (!brand) {
      return sendNotFound("Brand not found");
    }
    
    return sendSuccess("Brand retrieved successfully", brand);
  } catch (error) {
    console.error("Error fetching brand:", error);
    return sendInternalError("Failed to fetch brand");
  }
}

// PUT - Update a brand
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const updateData = await request.json();
    
    const brand = await brandService.updateBrand(id, updateData);
    
    if (!brand) {
      return sendNotFound("Brand not found");
    }
    
    return sendSuccess("Brand updated successfully", brand);
  } catch (error) {
    console.error("Error updating brand:", error);
    if (error instanceof Error && error.message.includes("already exists")) {
      return sendBadRequest(error.message);
    }
    return sendInternalError("Failed to update brand");
  }
}

// DELETE - Delete a brand
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    await brandService.deleteBrand(id);
    
    return sendSuccess("Brand deleted successfully");
  } catch (error) {
    console.error("Error deleting brand:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      return sendNotFound("Brand not found");
    }
    return sendInternalError("Failed to delete brand");
  }
}
