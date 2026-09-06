import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server/db';

export async function GET(
  request: Request,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;
    const workspace = await serverDb.getWorkspaceById(workspaceId);
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }
    return NextResponse.json({ workspace });
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;
    const body = await request.json();
    const updated = await serverDb.updateWorkspace(workspaceId, body);
    if (!updated) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }
    return NextResponse.json({ workspace: updated });
  } catch (error) {
    console.error('Error updating workspace:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;
    await serverDb.deleteWorkspace(workspaceId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
