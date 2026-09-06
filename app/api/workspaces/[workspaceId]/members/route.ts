import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server/db';
import { WorkspaceRole } from '@/types';

export async function GET(
  request: Request,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;
    const members = await serverDb.getMembers(workspaceId);
    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;
    const body = await request.json();
    const { email, role = 'member' } = body;
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    const newMember = await serverDb.addMember(workspaceId, email, role as WorkspaceRole);
    return NextResponse.json({ member: newMember }, { status: 201 });
  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
