import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server/db';
import { WorkspaceRole } from '@/types';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ workspaceId: string; userId: string }> }
) {
  try {
    const { workspaceId, userId } = await context.params;
    const body = await request.json();
    const { role } = body;
    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }
    const updated = await serverDb.updateMemberRole(workspaceId, userId, role as WorkspaceRole);
    if (!updated) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    return NextResponse.json({ member: updated });
  } catch (error) {
    console.error('Error updating member role:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ workspaceId: string; userId: string }> }
) {
  try {
    const { workspaceId, userId } = await context.params;
    await serverDb.removeMember(workspaceId, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
