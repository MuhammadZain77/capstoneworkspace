'use client';

import * as React from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  UserCheck,
  AtSign,
  Info,
  Clock,
  Check,
  Sparkles,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { setNotificationCenterOpen } from '@/lib/redux/slices/uiSlice';
import {
  markAsRead,
  markAllAsRead,
  setNotifications,
} from '@/lib/redux/slices/notificationSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Notification } from '@/types';

export function NotificationCenter() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.notificationCenterOpen);
  const notifications = useAppSelector((state) => state.notification.items);
  const unreadCount = useAppSelector((state) => state.notification.unreadCount);

  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

  // Seed sample realistic notifications if empty
  React.useEffect(() => {
    if (notifications.length === 0) {
      const sampleNotifications: Notification[] = [
        {
          id: 'notif-1',
          recipient_id: 'user-1',
          actor_id: 'user-2',
          workspace_id: 'ws-1',
          task_id: 'task-1',
          type: 'assigned',
          title: 'Assigned to a new task',
          message: 'Sarah Kim assigned you to "Configure PostgreSQL database schema with RLS".',
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
        },
        {
          id: 'notif-2',
          recipient_id: 'user-1',
          actor_id: 'user-3',
          workspace_id: 'ws-1',
          task_id: 'task-1',
          type: 'mentioned',
          title: 'Mentioned in comment',
          message: 'Marcus Johnson mentioned you: "@Alex Chen could you check the RLS policy for the tasks table?"',
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        },
        {
          id: 'notif-3',
          recipient_id: 'user-1',
          actor_id: 'user-2',
          workspace_id: 'ws-1',
          task_id: 'task-2',
          type: 'due_soon',
          title: 'Task due soon',
          message: '"Implement Redux Toolkit store with per-request safety" is due today.',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        },
      ];
      dispatch(setNotifications(sampleNotifications));
    }
  }, [dispatch, notifications.length]);

  if (!isOpen) return null;

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'assigned':
        return <UserCheck className="h-4 w-4 text-primary" />;
      case 'mentioned':
        return <AtSign className="h-4 w-4 text-purple-400" />;
      case 'due_soon':
      default:
        return <Clock className="h-4 w-4 text-amber-400" />;
    }
  };

  const formatTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => dispatch(setNotificationCenterOpen(false))}
      />

      {/* Slide-out Panel */}
      <aside className="relative z-50 flex h-full w-full max-w-sm flex-col border-l border-border bg-card shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0">
                {unreadCount} new
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(markAllAsRead())}
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                title="Mark all as read"
              >
                <Check className="h-3 w-3 mr-1" />
                <span>Mark all read</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => dispatch(setNotificationCenterOpen(false))}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Subheader */}
        <div className="flex items-center gap-2 border-b border-border/80 px-4 py-2 bg-muted/20">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`text-xs font-medium px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`text-xs font-medium px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              filter === 'unread'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/60">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center h-48">
              <Sparkles className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs font-medium text-foreground">No notifications</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {filter === 'unread'
                  ? "You're all caught up! No unread messages."
                  : 'Activity updates and alerts will appear here.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => dispatch(markAsRead(item.id))}
                className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-muted/30 ${
                  !item.is_read ? 'bg-primary/5' : ''
                }`}
              >
                <div className="mt-0.5 p-2 rounded-lg bg-card border border-border shrink-0 shadow-xs">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-xs leading-tight truncate ${!item.is_read ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
                      {item.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                      {formatTime(item.created_at)}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {item.message}
                  </p>

                  {!item.is_read && (
                    <div className="pt-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
