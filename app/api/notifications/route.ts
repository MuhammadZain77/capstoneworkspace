import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/server/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const recipientId = searchParams.get('recipientId') || undefined;
    const notifications = await serverDb.getNotifications(recipientId);
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { notificationId, markAll, recipientId } = body;

    if (markAll && recipientId) {
      await serverDb.markAllNotificationsRead(recipientId);
      return NextResponse.json({ success: true });
    }

    if (notificationId) {
      const updated = await serverDb.markNotificationRead(notificationId);
      return NextResponse.json({ notification: updated });
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
