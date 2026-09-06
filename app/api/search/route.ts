import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const workspaceId = searchParams.get('workspaceId') || undefined;

    const results = await serverDb.search(query, workspaceId);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
