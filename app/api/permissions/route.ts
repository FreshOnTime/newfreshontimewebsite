import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { permissionService } from '@/lib/services/permissionService';
import { sendSuccess, sendInternalError, sendCreated, sendBadRequest } from '@/lib/utils/apiResponses';

const permissionInput = z.object({
  resource: z.string().trim().min(1).max(120),
  operation: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(1000),
});

export const GET = requireAdmin(async (_request: NextRequest) => {
  try {
    return sendSuccess('Permissions retrieved successfully', await permissionService.getAllPermissions());
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return sendInternalError('Failed to fetch permissions');
  }
});

export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    const permission = await permissionService.createPermission(permissionInput.parse(await request.json()));
    return sendCreated('Permission created successfully', permission);
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) return sendBadRequest('Invalid permission input');
    if (error instanceof Error && error.message.includes('already exists')) return sendBadRequest(error.message);
    console.error('Error creating permission:', error);
    return sendInternalError('Failed to create permission');
  }
});
