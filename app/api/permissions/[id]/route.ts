import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { permissionService } from '@/lib/services/permissionService';
import { sendSuccess, sendInternalError, sendNotFound, sendBadRequest } from '@/lib/utils/apiResponses';

type Context = { params: Promise<{ id: string }> };
const updateInput = z.object({
  resource: z.string().trim().min(1).max(120).optional(),
  operation: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().min(1).max(1000).optional(),
}).refine((value) => Object.keys(value).length > 0, 'No permission changes provided');

export const PUT = requireAdmin(async (request: NextRequest, context: Context) => {
  try {
    const updated = await permissionService.updatePermission(
      (await context.params).id, updateInput.parse(await request.json()),
    );
    return updated ? sendSuccess('Permission updated successfully', updated) : sendNotFound('Permission not found');
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) return sendBadRequest('Invalid permission update');
    if (error instanceof Error && error.message.includes('already exists')) return sendBadRequest(error.message);
    console.error('Error updating permission:', error);
    return sendInternalError('Failed to update permission');
  }
});

export const DELETE = requireAdmin(async (_request: NextRequest, context: Context) => {
  try {
    await permissionService.deletePermission((await context.params).id);
    return sendSuccess('Permission deleted successfully');
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) return sendNotFound('Permission not found');
    console.error('Error deleting permission:', error);
    return sendInternalError('Failed to delete permission');
  }
});
