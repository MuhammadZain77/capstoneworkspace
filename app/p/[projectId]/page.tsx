'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FolderKanban,
  Plus,
  KanbanSquare,
  ListTodo,
  Calendar as CalendarIcon,
  Settings,
  ArrowLeft,
  Users,
  Sparkles,
  Activity as ActivityIcon,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { KanbanBoard } from '@/features/views/KanbanBoard';
import { ListView } from '@/features/views/ListView';
import { CalendarView } from '@/features/views/CalendarView';
import { ActivityFeed } from '@/components/collaboration/ActivityFeed';
import { InteractiveAnalyticsDashboard } from '@/components/analytics/InteractiveAnalyticsDashboard';
import { CreateTaskModal } from '@/features/tasks/CreateTaskModal';
import { TaskDetailModal, TaskDetailData } from '@/features/tasks/TaskDetailModal';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { canCreateTask, canDeleteTask } from '@/lib/permissions';
import { DEFAULT_COLUMNS } from '@/lib/constants';
import { KanbanColumn, TaskPriority, TaskStatus } from '@/types';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.projectId as string) || 'proj-1';

  const dispatch = useAppDispatch();
  const currentRole = useAppSelector((state) => state.auth.currentRole);
  const reduxProjects = useAppSelector((state) => state.project.projects);
  const activeWorkspaceId = useAppSelector((state) => state.workspace.activeWorkspaceId);
  const workspaces = useAppSelector((state) => state.workspace.workspaces);

  // Find project from Redux — fallback only for the pre-seeded demo projects
  const DEMO_PROJECT_NAMES: Record<string, string> = {
    'proj-1': 'Core Platform',
    'proj-2': 'Sprint 1',
    'proj-3': 'Design System & Tokens',
    'proj-4': 'Mobile UX Architecture',
  };

  const project = reduxProjects.find((p) => p.id === projectId) || (
    DEMO_PROJECT_NAMES[projectId]
      ? {
          id: projectId,
          workspace_id: 'ws-1',
          name: DEMO_PROJECT_NAMES[projectId],
          description: 'Infrastructure, authentication, and core database engine.',
          icon: 'folder',
          color: '#3b82f6',
          is_archived: false,
          last_used_view: 'kanban',
          created_by: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      : null
  );

  const activeWorkspace =
    workspaces.find((w) => w.id === (project?.workspace_id || activeWorkspaceId)) ||
    workspaces[0] || { id: 'ws-1', name: 'Acme Engineering', color: '#3b82f6' };

  const [activeTab, setActiveTab] = React.useState<'kanban' | 'list' | 'calendar' | 'activity' | 'analytics'>('kanban');
  const [isCreateTaskOpen, setIsCreateTaskOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<TaskDetailData | null>(null);

  const [columns, setColumns] = React.useState<KanbanColumn[]>(
    DEFAULT_COLUMNS.map((c, i) => ({
      id: `col-${i}`,
      project_id: projectId,
      name: c.name,
      position: c.position,
      color: c.color,
      is_default_done: c.is_default_done,
    }))
  );

  // Only seed demo tasks for the pre-seeded projects; new projects start empty
  const isDemoProject = Object.keys(DEMO_PROJECT_NAMES).includes(projectId);
  const [tasks, setTasks] = React.useState<TaskDetailData[]>(
    isDemoProject
      ? [
          {
            id: `task-p-1`,
            title: `Architect core database schema with RLS`,
            description: `Create all 17 tables, foreign key cascades, and RLS multi-tenant policies.`,
            project: project?.name || 'Project',
            priority: 'urgent',
            status: 'in_progress',
            is_completed: false,
            due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
            subtasks: [
              { id: 'sub-1', title: 'Write migration SQL', is_completed: true },
              { id: 'sub-2', title: 'Test RLS with mock users', is_completed: false },
            ],
            comments: [
              {
                id: 'com-1',
                user_id: 'user-1',
                user_name: 'Alex Chen',
                content: 'RLS policies look good so far.',
                created_at: new Date().toISOString(),
              },
            ],
            attachments: [],
          },
          {
            id: `task-p-2`,
            title: `Implement Redux Toolkit store with per-request safety`,
            description: `Per-request makeStore pattern prevents server-side memory leaks.`,
            project: project?.name || 'Project',
            priority: 'high',
            status: 'done',
            is_completed: true,
            due_date: new Date().toISOString(),
            subtasks: [],
            comments: [],
            attachments: [],
          },
          {
            id: `task-p-3`,
            title: `Build fluid drag-and-drop Kanban board with dnd-kit`,
            description: `Support optimistic column transfers, keyboard navigation, and sound feedback.`,
            project: project?.name || 'Project',
            priority: 'high',
            status: 'todo',
            is_completed: false,
            due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
            subtasks: [],
            comments: [],
            attachments: [],
          },
        ]
      : [] // New projects start with an empty board
  );

  const userCanCreateTask = canCreateTask(currentRole);

  // If project not found in Redux and not a demo project, show not-found state
  if (!project) {
    return (
      <AppShell workspaceName={activeWorkspace.name}>
        <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
          <div className="p-4 rounded-2xl bg-muted/40">
            <FolderKanban className="h-12 w-12 text-muted-foreground/40" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Project not found</h2>
            <p className="text-sm text-muted-foreground mt-1">
              This project may have been deleted or you may not have access to it.
            </p>
          </div>
          <Button onClick={() => router.push('/')} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </AppShell>
    );
  }

  const handleCreateTask = (newTaskData: {
    title: string;
    description: string;
    projectId: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string;
  }) => {
    const newTask: TaskDetailData = {
      id: `task-${Date.now()}`,
      title: newTaskData.title,
      description: newTaskData.description || null,
      project: project.name,
      priority: newTaskData.priority,
      status: newTaskData.status,
      is_completed: newTaskData.status === 'done',
      due_date: newTaskData.dueDate || null,
      subtasks: [],
      comments: [],
      attachments: [],
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const deleteTask = (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!canDeleteTask(currentRole)) {
      toast.error('Permission Denied', {
        description: 'Viewers and Members cannot delete tasks.',
      });
      return;
    }
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    toast.success('Task deleted');
  };

  return (
    <AppShell
      workspaceName="Acme Engineering"
      projectName={project.name}
      onOpenCreateTask={() => setIsCreateTaskOpen(true)}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Project Header Banner */}
        <div className="solar-card rounded-2xl p-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => router.push('/')}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div
                  className="h-3 w-3 rounded-full shadow-xs"
                  style={{ backgroundColor: project.color }}
                />
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  {project.name}
                </h1>
                <Badge variant="outline" className="text-[11px] font-mono">
                  {tasks.length} tasks
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground max-w-2xl pl-9">
                {project.description || 'Project workspace board for cross-functional sprint tasks.'}
              </p>
            </div>

            {/* Right Action buttons */}
            <div className="flex items-center gap-2 pl-9 sm:pl-0">
              <div className="flex -space-x-1.5 mr-2">
                <Avatar fallback="AC" alt="Alex Chen" size="sm" className="ring-2 ring-card" />
                <Avatar fallback="SK" alt="Sarah Kim" size="sm" className="ring-2 ring-card" />
                <Avatar fallback="MJ" alt="Marcus Johnson" size="sm" className="ring-2 ring-card" />
              </div>

              <Button
                size="sm"
                disabled={!userCanCreateTask}
                onClick={() => setIsCreateTaskOpen(true)}
                className="h-8 text-xs flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Task</span>
              </Button>
            </div>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border/80 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'kanban'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
              }`}
            >
              <KanbanSquare className="h-3.5 w-3.5" />
              <span>Board</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
              }`}
            >
              <ListTodo className="h-3.5 w-3.5" />
              <span>List</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>Calendar</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('activity')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'activity'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
              }`}
            >
              <ActivityIcon className="h-3.5 w-3.5" />
              <span>Activity</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Charts & Analytics</span>
            </button>
          </div>
        </div>

        {/* View Content */}
        {activeTab === 'kanban' && (
          <KanbanBoard
            columns={columns}
            tasks={tasks}
            onTasksChange={setTasks}
            onSelectTask={setSelectedTask}
            onDeleteTask={deleteTask}
            onOpenCreateTask={() => setIsCreateTaskOpen(true)}
          />
        )}

        {activeTab === 'list' && (
          <ListView
            tasks={tasks}
            onTasksChange={setTasks}
            onSelectTask={setSelectedTask}
            onDeleteTask={deleteTask}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            tasks={tasks}
            onSelectTask={setSelectedTask}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityFeed projectId={project.id} />
        )}

        {activeTab === 'analytics' && (
          <InteractiveAnalyticsDashboard
            tasks={tasks}
            projects={[project]}
            workspaceName={project.name}
            onSelectTask={setSelectedTask}
          />
        )}
      </div>

      {/* Quick Create Task Modal */}
      <CreateTaskModal
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        onCreateTask={handleCreateTask}
        projects={[project]}
      />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          open={!!selectedTask}
          onOpenChange={(open) => {
            if (!open) setSelectedTask(null);
          }}
          task={selectedTask}
          onUpdateTask={(updated) => {
            setTasks((prev) =>
              prev.map((t) => (t.id === selectedTask.id ? { ...t, ...updated } : t))
            );
            setSelectedTask((prev) => (prev ? { ...prev, ...updated } : null));
          }}
          onDeleteTask={(taskId) => {
            deleteTask(taskId);
            setSelectedTask(null);
          }}
          onDuplicateTask={(t) => {
            const dup: TaskDetailData = {
              ...t,
              id: `task-${Date.now()}`,
              title: `${t.title} (Copy)`,
            };
            setTasks((prev) => [dup, ...prev]);
            toast.success('Task duplicated');
          }}
        />
      )}
    </AppShell>
  );
}
