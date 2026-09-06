import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws-1';

    const workspace = await serverDb.getWorkspaceById(workspaceId);
    const projects = await serverDb.getProjects(workspaceId);
    const tasks = await serverDb.getTasks();
    const members = await serverDb.getMembers(workspaceId);

    const payload = {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      workspace,
      projects,
      tasks,
      members,
    };

    return NextResponse.json(payload, {
      headers: {
        'Content-Disposition': `attachment; filename="workspace-export-${workspaceId}.json"`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error exporting workspace data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
