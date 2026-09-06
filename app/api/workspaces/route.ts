import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server/db';

export async function GET() {
  try {
    const workspaces = await serverDb.getWorkspaces();
    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 });
    }
    const newWorkspace = await serverDb.createWorkspace(body);
    return NextResponse.json({ workspace: newWorkspace }, { status: 201 });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
