import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { roleService } from '@/lib/services/roleService';
import { sendSuccess, sendInternalError, sendCreated, sendBadRequest } from '@/lib/utils/apiResponses';

const roleInput = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).nullable().optional(),
  permissions: z.array(z.string().min(1)).max(100).optional(),
});

export const GET = requireAdmin(async (_request: NextRequest) => {
  try {
    return sendSuccess('Roles retrieved successfully', await roleService.getAllRoles());
  } catch (error) {
    console.error('Error fetching roles:', error);
    return sendInternalError('Failed to fetch roles');
  }
});

export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    const body = roleInput.parse(await request.json());
    const role = await roleService.createRole(body);
    return sendCreated('Role created successfully', role);
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) return sendBadRequest('Invalid role input');
    if (error instanceof Error && error.message.includes('already exists')) return sendBadRequest(error.message);
    console.error('Error creating role:', error);
    return sendInternalError('Failed to create role');
  }
});
