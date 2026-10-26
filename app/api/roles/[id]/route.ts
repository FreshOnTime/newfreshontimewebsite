import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { roleService } from '@/lib/services/roleService';
import { sendSuccess, sendInternalError, sendNotFound, sendBadRequest } from '@/lib/utils/apiResponses';

type Context = { params: Promise<{ id: string }> };
const roleUpdate = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  permissions: z.array(z.string().min(1)).max(100).optional(),
}).refine((value) => Object.keys(value).length > 0, 'No role changes provided');

export const GET = requireAdmin(async (_request: NextRequest, context: Context) => {
  try {
    const { id } = await context.params;
    const role = await roleService.getRoleById(id);
    return role ? sendSuccess('Role retrieved successfully', role) : sendNotFound('Role not found');
  } catch (error) {
    console.error('Error fetching role:', error);
    return sendInternalError('Failed to fetch role');
  }
});

export const PUT = requireAdmin(async (request: NextRequest, context: Context) => {
  try {
    const { id } = await context.params;
    const role = await roleService.updateRole(id, roleUpdate.parse(await request.json()));
    return role ? sendSuccess('Role updated successfully', role) : sendNotFound('Role not found');
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) return sendBadRequest('Invalid role update');
    if (error instanceof Error && error.message.includes('already exists')) return sendBadRequest(error.message);
    console.error('Error updating role:', error);
    return sendInternalError('Failed to update role');
  }
});

export const DELETE = requireAdmin(async (_request: NextRequest, context: Context) => {
  try {
    await roleService.deleteRole((await context.params).id);
    return sendSuccess('Role deleted successfully');
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) return sendNotFound('Role not found');
    console.error('Error deleting role:', error);
    return sendInternalError('Failed to delete role');
  }
});
