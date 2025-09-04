import connectDB from '@/lib/db';
import { ProductService } from '@/lib/services/productService';
import { requireRoles, AuthenticatedRequest } from '@/lib/middleware/auth';
import { sendSuccess, sendNotFound, sendInternalError, sendBadRequest, sendUnauthorized } from '@/lib/utils/apiResponses';
import { ValidationError } from '@/lib/utils/errors';

const productService = new ProductService();

// DELETE /api/products/[id]/permanent - Permanently delete a product (admin only)
export const DELETE = requireRoles(['admin'])(async (
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();

    const id = params.id;
    
    if (!id) {
      return sendBadRequest('Product ID is required');
    }

    await productService.permanentlyDeleteProduct(id);
    
    return sendSuccess('Product permanently deleted successfully');
  } catch (error) {
    console.error('Permanent delete product error:', error);
    
    if (error instanceof ValidationError) {
      return sendNotFound(error.message);
    }
    
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('permissions'))) {
      return sendUnauthorized(error.message);
    }
    
    return sendInternalError('Failed to permanently delete product');
  }
});
