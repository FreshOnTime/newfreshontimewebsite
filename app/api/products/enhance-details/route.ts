import { NextRequest } from "next/server";
import { sendSuccess, sendBadRequest } from "@/lib/utils/apiResponses";

// AI functionality disabled - returning mock enhanced data
export async function POST(req: NextRequest) {
  try {
    const productData = await req.json();

    // Basic validation
    if (!productData.name || productData.name.trim().length === 0) {
      return sendBadRequest("Product name is required");
    }

    // Return basic enhanced details without AI
    const enhancedDetails = {
      enhancedDescription: productData.description || `High-quality ${productData.name}`,
      suggestedIngredients: productData.ingredients || "Natural ingredients",
      nutritionFacts: productData.nutritionFacts || "Nutritional information not available",
      searchContent: `${productData.name} ${productData.brand || ''} ${productData.category || ''}`.trim(),
      tags: [productData.category, productData.brand].filter(Boolean)
    };

    return sendSuccess("Product details enhanced successfully", enhancedDetails);

  } catch (error) {
    console.error("Error enhancing product details:", error);
    return sendBadRequest("Invalid request format");
  }
}
