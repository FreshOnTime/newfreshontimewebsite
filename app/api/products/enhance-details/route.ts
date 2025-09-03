import { NextRequest } from "next/server";
import { aiService, ProductEnhancementRequest } from "@/lib/services/aiService";
import { sendSuccess, sendInternalError, sendBadRequest } from "@/lib/utils/apiResponses";

export async function POST(req: NextRequest) {
  try {
    const productData: ProductEnhancementRequest = await req.json();

    // Basic validation
    if (!productData.name || productData.name.trim().length === 0) {
      return sendBadRequest("Product name is required");
    }

    // Enhance product details using AI
    const enhancedDetails = await aiService.enhanceProductDetails(productData);

    return sendSuccess("Product details enhanced successfully", enhancedDetails);

  } catch (error) {
    console.error("Error enhancing product details:", error);

    if (error instanceof Error) {
      if (error.message.includes('OPENAI_API_KEY')) {
        return sendInternalError("AI service configuration error");
      }
      if (error.message.includes('Invalid JSON')) {
        return sendBadRequest("Invalid request format");
      }
      if (error.message.includes('AI service returned invalid')) {
        return sendInternalError("AI service error - please try again");
      }
    }

    return sendInternalError("Failed to enhance product details");
  }
}
