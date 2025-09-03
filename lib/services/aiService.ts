// AI Service disabled - using mock implementation

export interface ProductEnhancementRequest {
  name: string;
  brand?: string;
  category?: string;
  description?: string;
  ingredients?: string;
  nutritionFacts?: string;
}

export interface EnhancedProductDetails {
  enhancedDescription: string;
  suggestedIngredients: string;
  nutritionFacts: string;
  searchContent: string;
  tags: string[];
}

export class AIService {
  constructor() {
    // No OpenAI dependency - mock implementation
  }

  async enhanceProductDetails(productData: ProductEnhancementRequest): Promise<EnhancedProductDetails> {
    // Mock implementation without AI
    const tags: string[] = [];
    if (productData.category) tags.push(productData.category);
    if (productData.brand) tags.push(productData.brand);
    
    return {
      enhancedDescription: productData.description || `High-quality ${productData.name}`,
      suggestedIngredients: productData.ingredients || "Natural ingredients",
      nutritionFacts: productData.nutritionFacts || "Nutritional information not available",
      searchContent: `${productData.name} ${productData.brand || ''} ${productData.category || ''}`.trim(),
      tags: tags
    };
  }

  async generateProductTags(productName: string, category?: string): Promise<string[]> {
    // Mock implementation - return basic tags
    const tags = [productName.toLowerCase()];
    if (category) {
      tags.push(category.toLowerCase());
    }
    return tags;
  }

  async improveSEOContent(title: string, description: string): Promise<{
    optimizedTitle: string;
    optimizedDescription: string;
    keywords: string[];
  }> {
    // Mock implementation - return original content
    return {
      optimizedTitle: title,
      optimizedDescription: description,
      keywords: []
    };
  }
}

export const aiService = new AIService();
