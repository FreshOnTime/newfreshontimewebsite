import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireRoles, AuthenticatedRequest } from '@/lib/middleware/auth';
import { sendSuccess, sendNotFound, sendInternalError, sendBadRequest } from '@/lib/utils/apiResponses';

// DELETE /api/products/[id]/permanent - Permanently delete a product (admin / inventory_manager)
export const DELETE = requireRoles(['admin', 'inventory_manager'])(async (
  _req: AuthenticatedRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context!.params;

    if (!id) {
      return sendBadRequest('Product ID is required');
    }

    // Real hard delete. Prisma throws P2025 when the record does not exist.
    await prisma.product.delete({ where: { id } });

    return sendSuccess('Product permanently deleted successfully');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return sendNotFound('Product not found');
    }

    console.error('Permanent delete product error:', error);
    return sendInternalError('Failed to permanently delete product');
  }
});
