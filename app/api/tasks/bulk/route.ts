import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskIds, action } = body;
    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json({ error: 'taskIds array is required' }, { status: 400 });
    }
    if (!action) {
      return NextResponse.json({ error: 'action specification is required' }, { status: 400 });
    }

    const result = await serverDb.bulkUpdateTasks(taskIds, action);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
