import { NextRequest } from "next/server";
import { brandService } from "@/lib/services/brandService";
import { sendSuccess, sendInternalError, sendCreated, sendBadRequest } from "@/lib/utils/apiResponses";

// GET - Get all brands
export async function GET() {
  try {
    const brands = await brandService.getAllBrands();
    return sendSuccess("Brands retrieved successfully", brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return sendInternalError("Failed to fetch brands");
  }
}

// POST - Create a new brand
export async function POST(req: NextRequest) {
  try {
    const brandData = await req.json();
    
    // Basic validation
    if (!brandData.code || !brandData.name) {
      return sendBadRequest("Code and name are required");
    }

    const brand = await brandService.createBrand(brandData);
    return sendCreated("Brand created successfully", brand);
  } catch (error) {
    console.error("Error creating brand:", error);
    if (error instanceof Error && error.message.includes("already exists")) {
      return sendBadRequest(error.message);
    }
    return sendInternalError("Failed to create brand");
  }
}
