import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { roleService } from '@/lib/services/roleService';

type Context = { params: Promise<{ id: string; permissionId: string }> };

export const DELETE = requireAdmin(async (_request: NextRequest, context: Context) => {
  try {
    const { id, permissionId } = await context.params;
    if (!id || !permissionId) return NextResponse.json({ error: 'Role and permission IDs required' }, { status: 400 });
    const role = await roleService.removePermissionFromRole(id, permissionId);
    return role
      ? NextResponse.json({ success: true, data: role })
      : NextResponse.json({ error: 'Role or permission not found' }, { status: 404 });
  } catch (error) {
    console.error('Failed to remove role permission:', error);
    return NextResponse.json({ error: 'Failed to remove permission from role' }, { status: 500 });
  }
});
