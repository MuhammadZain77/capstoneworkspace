import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server/db';

export async function POST(
  request: Request,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await context.params;
    const body = await request.json();
    const { userId, userName, content } = body;
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    const comment = await serverDb.addComment(
      taskId,
      userId || 'user-1',
      userName || 'Current User',
      content
    );

    if (!comment) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
