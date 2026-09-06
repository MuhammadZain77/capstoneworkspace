'use client';

import * as React from 'react';
import {
  Activity as ActivityIcon,
  PlusCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  ArrowRight,
  Filter,
  User,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity } from '@/types';
import { DEMO_USERS } from '@/lib/auth';

interface ActivityFeedProps {
  workspaceId?: string;
  projectId?: string;
  taskId?: string;
}

const SAMPLE_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    task_id: 'task-1',
    actor_id: 'user-1',
    action_type: 'task_created',
    details: { task_title: 'Architect core database schema with RLS' },
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    actor: DEMO_USERS[0],
  },
  {
    id: 'act-2',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    task_id: 'task-1',
    actor_id: 'user-2',
    action_type: 'status_changed',
    details: { task_title: 'Architect core database schema with RLS', old_status: 'todo', new_status: 'in_progress' },
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    actor: DEMO_USERS[1],
  },
  {
    id: 'act-3',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    task_id: 'task-1',
    actor_id: 'user-1',
    action_type: 'commented',
    details: { task_title: 'Architect core database schema with RLS', snippet: 'RLS policies look good so far.' },
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    actor: DEMO_USERS[0],
  },
  {
    id: 'act-4',
    workspace_id: 'ws-1',
    project_id: 'proj-2',
    task_id: 'task-3',
    actor_id: 'user-3',
    action_type: 'assigned',
    details: { task_title: 'Build Drag-and-Drop Kanban Board with dnd-kit', assignee_name: 'Jordan Taylor' },
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    actor: DEMO_USERS[2],
  },
  {
    id: 'act-5',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    task_id: 'task-2',
    actor_id: 'user-1',
    action_type: 'task_completed',
    details: { task_title: 'Implement Redux Toolkit store with per-request safety' },
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    actor: DEMO_USERS[0],
  },
];

export function ActivityFeed({ workspaceId, projectId, taskId }: ActivityFeedProps) {
  const [activities, setActivities] = React.useState<Activity[]>(SAMPLE_ACTIVITIES);
  const [actionFilter, setActionFilter] = React.useState<string>('all');
  const [actorFilter, setActorFilter] = React.useState<string>('all');

  React.useEffect(() => {
    // Fetch live activities from API if available
    const fetchActivities = async () => {
      try {
        const res = await fetch(`/api/activities${workspaceId ? `?workspaceId=${workspaceId}` : ''}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.activities && data.activities.length > 0) {
            setActivities(data.activities);
          }
        }
      } catch {
        // Fallback to sample activities
      }
    };
    fetchActivities();
  }, [workspaceId]);

  const filtered = activities.filter((act) => {
    if (projectId && act.project_id && act.project_id !== projectId) return false;
    if (taskId && act.task_id && act.task_id !== taskId) return false;
    if (actionFilter !== 'all' && act.action_type !== actionFilter) return false;
    if (actorFilter !== 'all' && act.actor_id !== actorFilter) return false;
    return true;
  });

  const getActionBadge = (type: string) => {
    switch (type) {
      case 'task_created':
        return <Badge variant="default" className="text-[9px] px-1 py-0 uppercase bg-blue-600">Created</Badge>;
      case 'status_changed':
        return <Badge variant="secondary" className="text-[9px] px-1 py-0 uppercase">Status</Badge>;
      case 'task_completed':
        return <Badge variant="default" className="text-[9px] px-1 py-0 uppercase bg-emerald-600">Done</Badge>;
      case 'commented':
        return <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase">Comment</Badge>;
      case 'assigned':
        return <Badge variant="warning" className="text-[9px] px-1 py-0 uppercase">Assigned</Badge>;
      default:
        return <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase">{type}</Badge>;
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <ActivityIcon className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Activity Log</h3>
          <Badge variant="outline" className="text-[10px] ml-1">
            {filtered.length} events
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="h-7 rounded-md border border-input bg-background px-2 text-[11px] text-foreground"
          >
            <option value="all">All Actions</option>
            <option value="task_created">Task Created</option>
            <option value="status_changed">Status Changed</option>
            <option value="task_completed">Completed</option>
            <option value="commented">Commented</option>
            <option value="assigned">Assigned</option>
          </select>

          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="h-7 rounded-md border border-input bg-background px-2 text-[11px] text-foreground"
          >
            <option value="all">All Members</option>
            {DEMO_USERS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground">
            No activity matches the current filters.
          </div>
        ) : (
          filtered.map((act) => (
            <div
              key={act.id}
              className="flex items-start gap-3 text-xs p-2 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/60"
            >
              <Avatar
                src={act.actor?.avatar_url}
                alt={act.actor?.full_name || 'User'}
                size="sm"
                className="mt-0.5"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">
                    {act.actor?.full_name || 'Team Member'}
                  </span>
                  {getActionBadge(act.action_type)}
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {formatRelativeTime(act.created_at)}
                  </span>
                </div>

                <div className="text-muted-foreground mt-0.5 leading-relaxed">
                  {act.action_type === 'task_created' && (
                    <span>
                      Created task <strong className="text-foreground">{String((act.details as any)?.task_title || 'Task')}</strong>
                    </span>
                  )}
                  {act.action_type === 'status_changed' && (
                    <span>
                      Moved <strong className="text-foreground">{String((act.details as any)?.task_title || 'Task')}</strong> to{' '}
                      <span className="font-medium text-foreground uppercase text-[10px]">
                        {String((act.details as any)?.new_status || '').replace('_', ' ')}
                      </span>
                    </span>
                  )}
                  {act.action_type === 'task_completed' && (
                    <span>
                      Marked <strong className="text-foreground">{String((act.details as any)?.task_title || 'Task')}</strong> as completed
                    </span>
                  )}
                  {act.action_type === 'commented' && (
                    <span>
                      Commented on <strong className="text-foreground">{String((act.details as any)?.task_title || 'Task')}</strong>:{' '}
                      <em>&quot;{String((act.details as any)?.snippet || '')}&quot;</em>
                    </span>
                  )}
                  {act.action_type === 'assigned' && (
                    <span>
                      Assigned <strong className="text-foreground">{String((act.details as any)?.task_title || 'Task')}</strong> to{' '}
                      {String((act.details as any)?.assignee_name || 'member')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
