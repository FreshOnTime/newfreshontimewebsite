import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { roleService } from '@/lib/services/roleService';

type Context = { params: Promise<{ id: string }> };
const input = z.object({ permissionId: z.string().trim().min(1).max(200) });

export const POST = requireAdmin(async (request: NextRequest, context: Context) => {
  try {
    const { id } = await context.params;
    const { permissionId } = input.parse(await request.json());
    const role = await roleService.addPermissionToRole(id, permissionId);
    return role
      ? NextResponse.json({ success: true, data: role })
      : NextResponse.json({ error: 'Role or permission not found' }, { status: 404 });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError)
      return NextResponse.json({ error: 'A valid permission ID is required' }, { status: 400 });
    console.error('Failed to add role permission:', error);
    return NextResponse.json({ error: 'Failed to add permission to role' }, { status: 500 });
  }
});
