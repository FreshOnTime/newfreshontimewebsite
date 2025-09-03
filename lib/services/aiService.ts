import OpenAI from 'openai';

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
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async enhanceProductDetails(productData: ProductEnhancementRequest): Promise<EnhancedProductDetails> {
    try {
      const prompt = this.createEnhancementPrompt(productData);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a product content specialist for an e-commerce platform. Generate enhanced product details in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI service');
      }

      // Parse the JSON response
      const enhancedDetails: EnhancedProductDetails = JSON.parse(response);
      
      // Validate the response structure
      this.validateEnhancedDetails(enhancedDetails);
      
      return enhancedDetails;
    } catch (error) {
      console.error('Error enhancing product details:', error);
      
      if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error('AI service returned invalid response format');
      }
      
      throw new Error('Failed to enhance product details with AI');
    }
  }

  private createEnhancementPrompt(productData: ProductEnhancementRequest): string {
    return `
Please enhance the following product information and return ONLY a valid JSON object with the specified structure:

Product Information:
- Name: ${productData.name}
- Brand: ${productData.brand || 'Not specified'}
- Category: ${productData.category || 'Not specified'}
- Current Description: ${productData.description || 'Not provided'}
- Current Ingredients: ${productData.ingredients || 'Not provided'}
- Current Nutrition Facts: ${productData.nutritionFacts || 'Not provided'}

Please return a JSON object with this exact structure:
{
  "enhancedDescription": "A compelling, detailed product description (2-3 sentences)",
  "suggestedIngredients": "Complete ingredients list if applicable, or 'N/A' for non-food items",
  "nutritionFacts": "Nutritional information if applicable, or 'N/A' for non-food items",
  "searchContent": "SEO-friendly keywords and phrases for search optimization",
  "tags": ["array", "of", "relevant", "product", "tags"]
}

Guidelines:
- Keep descriptions concise but engaging
- Use factual information only
- For food products, ensure ingredients and nutrition facts are realistic
- Generate 5-8 relevant tags
- Make search content keyword-rich for better discoverability
`;
  }

  private validateEnhancedDetails(details: any): void {
    const requiredFields = ['enhancedDescription', 'suggestedIngredients', 'nutritionFacts', 'searchContent', 'tags'];
    
    for (const field of requiredFields) {
      if (!(field in details)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!Array.isArray(details.tags)) {
      throw new Error('Tags must be an array');
    }

    if (typeof details.enhancedDescription !== 'string' || details.enhancedDescription.length < 10) {
      throw new Error('Enhanced description must be a string with at least 10 characters');
    }
  }

  async generateProductTitle(description: string, brand?: string, category?: string): Promise<string> {
    try {
      const prompt = `
Generate a compelling product title based on the following information:
- Description: ${description}
- Brand: ${brand || 'Not specified'}
- Category: ${category || 'Not specified'}

Requirements:
- Maximum 60 characters
- Include brand name if provided
- Be descriptive and SEO-friendly
- Return only the title, no additional text

Title:`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 50,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content?.trim();
      if (!response) {
        throw new Error('No response from AI service');
      }

      return response;
    } catch (error) {
      console.error('Error generating product title:', error);
      throw new Error('Failed to generate product title');
    }
  }
}

export const aiService = new AIService();
