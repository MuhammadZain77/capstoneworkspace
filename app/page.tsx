'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Users,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Trash2,
  KanbanSquare,
  ListTodo,
  Calendar as CalendarIcon,
  LayoutDashboard,
  Activity as ActivityIcon,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PROJECT_TEMPLATES, DEFAULT_COLUMNS } from '@/lib/constants';
import { CreateTaskModal } from '@/features/tasks/CreateTaskModal';
import { CreateProjectModal } from '@/features/projects/CreateProjectModal';
import { TaskDetailModal, TaskDetailData } from '@/features/tasks/TaskDetailModal';
import { KanbanBoard } from '@/features/views/KanbanBoard';
import { ListView } from '@/features/views/ListView';
import { CalendarView } from '@/features/views/CalendarView';
import { ActivityFeed } from '@/components/collaboration/ActivityFeed';
import { InteractiveAnalyticsDashboard } from '@/components/analytics/InteractiveAnalyticsDashboard';
import { ColumnChart } from '@/components/analytics/ColumnChart';
import { DonutChart } from '@/components/analytics/DonutChart';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { addProject, setProjects } from '@/lib/redux/slices/projectSlice';
import { setWorkspaces, setActiveWorkspaceId } from '@/lib/redux/slices/workspaceSlice';
import { pushAction } from '@/lib/redux/slices/undoRedoSlice';
import { canCreateTask, canCreateProject, canDeleteTask } from '@/lib/permissions';
import { KeyboardShortcuts } from '@/components/navigation/KeyboardShortcuts';
import { CreateWorkspaceModal } from '@/features/workspaces/CreateWorkspaceModal';
import { Project, TaskPriority, TaskStatus, KanbanColumn, Workspace } from '@/types';

function MainWorkspaceContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlView = searchParams.get('view');

  const reduxProjects = useAppSelector((state) => state.project.projects);
  const reduxWorkspaces = useAppSelector((state) => state.workspace.workspaces);
  const activeWorkspaceId = useAppSelector((state) => state.workspace.activeWorkspaceId);
  const currentRole = useAppSelector((state) => state.auth.currentRole);
  const currentUser = useAppSelector((state) => state.auth.user);

  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'analytics' | 'kanban' | 'list' | 'calendar' | 'activity'>(
    urlView === 'kanban' || urlView === 'list' || urlView === 'calendar' || urlView === 'activity' || urlView === 'analytics'
      ? (urlView as any)
      : 'dashboard'
  );

  React.useEffect(() => {
    if (urlView === 'kanban' || urlView === 'list' || urlView === 'calendar' || urlView === 'activity' || urlView === 'analytics') {
      setActiveTab(urlView as any);
    } else if (!urlView) {
      setActiveTab('dashboard');
    }
  }, [urlView]);

  const [isCreateTaskOpen, setIsCreateTaskOpen] = React.useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = React.useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<TaskDetailData | null>(null);

  // Initialize workspaces if empty
  React.useEffect(() => {
    if (reduxWorkspaces.length === 0) {
      const initialWorkspaces: Workspace[] = [
        {
          id: 'ws-1',
          name: 'Acme Engineering',
          slug: 'acme-engineering',
          icon: 'sparkles',
          color: '#3b82f6',
          default_view: 'kanban',
          created_by: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'ws-2',
          name: 'Product & Design',
          slug: 'product-design',
          icon: 'palette',
          color: '#8b5cf6',
          default_view: 'kanban',
          created_by: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      dispatch(setWorkspaces(initialWorkspaces));
      dispatch(setActiveWorkspaceId('ws-1'));
    }
  }, [dispatch, reduxWorkspaces.length]);

  const [columns] = React.useState<KanbanColumn[]>(
    DEFAULT_COLUMNS.map((c, i) => ({
      id: `col-${i}`,
      project_id: 'proj-1',
      name: c.name,
      position: c.position,
      color: c.color,
      is_default_done: c.is_default_done,
    }))
  );

  // Initial projects if empty
  React.useEffect(() => {
    if (reduxProjects.length === 0) {
      const initialProjects: Project[] = [
        {
          id: 'proj-1',
          workspace_id: 'ws-1',
          name: 'Core Platform',
          description: 'Infrastructure, authentication, and core database engine.',
          icon: 'server',
          color: '#3b82f6',
          is_archived: false,
          last_used_view: 'kanban',
          created_by: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'proj-2',
          workspace_id: 'ws-1',
          name: 'Sprint 1',
          description: 'Frontend Kanban board and real-time collaboration features.',
          icon: 'zap',
          color: '#10b981',
          is_archived: false,
          last_used_view: 'kanban',
          created_by: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'proj-3',
          workspace_id: 'ws-2',
          name: 'Design System & Tokens',
          description: 'Color palettes, accessible contrast tokens, and interactive components.',
          icon: 'palette',
          color: '#ec4899',
          is_archived: false,
          last_used_view: 'kanban',
          created_by: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'proj-4',
          workspace_id: 'ws-2',
          name: 'Mobile UX Architecture',
          description: 'Responsive drawer navigation, touch gestures, and micro-interactions.',
          icon: 'smartphone',
          color: '#8b5cf6',
          is_archived: false,
          last_used_view: 'kanban',
          created_by: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      dispatch(setProjects(initialProjects));
    }
  }, [dispatch, reduxProjects.length]);

  const [tasks, setTasks] = React.useState<TaskDetailData[]>([
    {
      id: 'task-1',
      workspace_id: 'ws-1',
      title: 'Configure PostgreSQL database schema with RLS',
      description: 'Set up migrations, foreign key constraints, cascade rules, and security policies.',
      project: 'Core Platform',
      priority: 'urgent',
      status: 'in_progress',
      is_completed: false,
      due_date: '2026-09-10',
      assignee: { id: '11111111-1111-1111-1111-111111111111', name: 'Alex Chen (Owner)' },
      subtasks: [
        { id: 'st-1', title: 'Draft table schemas and migrations', is_completed: true },
        { id: 'st-2', title: 'Write comprehensive RLS policies', is_completed: false },
        { id: 'st-3', title: 'Verify tenant isolation with multi-user tests', is_completed: false },
      ],
      comments: [
        {
          id: 'c-1',
          user_id: '22222222-2222-2222-2222-222222222222',
          user_name: 'Sarah Kim (Admin)',
          content: 'I verified the RLS rules for workspaces and projects. Working cleanly!',
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
      attachments: [{ id: 'att-1', name: 'schema-architecture-v1.pdf', size: '1.4 MB' }],
    },
    {
      id: 'task-2',
      workspace_id: 'ws-1',
      title: 'Implement Redux Toolkit store with per-request safety',
      description: 'Configure makeStore, typed hooks, StoreProvider, and slice architecture.',
      project: 'Core Platform',
      priority: 'high',
      status: 'done',
      is_completed: true,
      assignee: { id: '22222222-2222-2222-2222-222222222222', name: 'Sarah Kim (Admin)' },
      subtasks: [
        { id: 'st-4', title: 'Configure client StoreProvider', is_completed: true },
        { id: 'st-5', title: 'Build undoRedo and offline slices', is_completed: true },
      ],
      comments: [],
      attachments: [],
    },
    {
      id: 'task-3',
      workspace_id: 'ws-1',
      title: 'Build drag-and-drop Kanban board using dnd-kit',
      description: 'Implement fluid column reordering and optimistic drag-and-drop state rollback.',
      project: 'Sprint 1',
      priority: 'high',
      status: 'todo',
      is_completed: false,
      assignee: { id: '33333333-3333-3333-3333-333333333333', name: 'Marcus Johnson (Member)' },
      subtasks: [],
      comments: [],
      attachments: [],
    },
    {
      id: 'task-4',
      workspace_id: 'ws-1',
      title: 'Wire up IndexedDB offline synchronization engine',
      description: 'Support local mutation replay with conflict resolution and offline indicators.',
      project: 'Sprint 1',
      priority: 'medium',
      status: 'todo',
      is_completed: false,
      assignee: { id: '33333333-3333-3333-3333-333333333333', name: 'Marcus Johnson (Member)' },
      subtasks: [],
      comments: [],
      attachments: [],
    },
    {
      id: 'task-5',
      workspace_id: 'ws-2',
      title: 'Audit WCAG 2.1 AA color contrast for dark mode',
      description: 'Ensure all text tokens satisfy 4.5:1 ratio against card and canvas backgrounds.',
      project: 'Design System & Tokens',
      priority: 'urgent',
      status: 'in_progress',
      is_completed: false,
      assignee: { id: '11111111-1111-1111-1111-111111111111', name: 'Alex Chen (Owner)' },
      subtasks: [
        { id: 'st-6', title: 'Verify primary buttons', is_completed: true },
        { id: 'st-7', title: 'Verify muted text readability', is_completed: true },
      ],
      comments: [],
      attachments: [],
    },
    {
      id: 'task-6',
      workspace_id: 'ws-2',
      title: 'Create high-fidelity mobile prototype',
      description: 'Design responsive drawer navigation and gesture-friendly task cards.',
      project: 'Mobile UX Architecture',
      priority: 'high',
      status: 'todo',
      is_completed: false,
      assignee: { id: '22222222-2222-2222-2222-222222222222', name: 'Sarah Kim (Admin)' },
      subtasks: [],
      comments: [],
      attachments: [],
    },
  ]);

  const handleUpdateTaskDetail = (updated: Partial<TaskDetailData>) => {
    if (!selectedTask) return;
    const nextTask = { ...selectedTask, ...updated };
    setSelectedTask(nextTask);
    setTasks((prev) => prev.map((t) => (t.id === nextTask.id ? nextTask : t)));
  };

  const handleDuplicateTask = (taskToDup: TaskDetailData) => {
    const duplicated: TaskDetailData = {
      ...taskToDup,
      id: `task-${Date.now()}`,
      title: `${taskToDup.title} (Copy)`,
      is_completed: false,
      status: 'todo',
    };
    setTasks((prev) => [duplicated, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.is_completed;
          const nextStatus = nextCompleted ? ('done' as TaskStatus) : ('in_progress' as TaskStatus);

          dispatch(
            pushAction({
              description: `Task "${t.title}" status updated`,
              type: 'TASK_EDIT',
              entityId: t.id,
              previousState: { is_completed: t.is_completed, status: t.status },
              nextState: { is_completed: nextCompleted, status: nextStatus },
            })
          );

          return {
            ...t,
            is_completed: nextCompleted,
            status: nextStatus,
          };
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const taskToDelete = tasks.find((t) => t.id === id);
    if (!taskToDelete) return;

    setTasks((prev) => prev.filter((t) => t.id !== id));

    toast(`Task "${taskToDelete.title}" deleted`, {
      action: {
        label: 'Undo',
        onClick: () => {
          setTasks((prev) => [taskToDelete, ...prev]);
          toast.success(`Task "${taskToDelete.title}" restored`);
        },
      },
    });
  };

  const effectiveWorkspaceId = activeWorkspaceId || 'ws-1';
  const activeWorkspace =
    reduxWorkspaces.find((w) => w.id === effectiveWorkspaceId) || reduxWorkspaces[0] || {
      id: 'ws-1',
      name: 'Acme Engineering',
      color: '#3b82f6',
    };

  const currentWorkspaceProjects = reduxProjects.filter(
    (p) => p.workspace_id === effectiveWorkspaceId
  );

  const currentWorkspaceTasks = tasks.filter(
    (t) => t.workspace_id === effectiveWorkspaceId || (!t.workspace_id && effectiveWorkspaceId === 'ws-1')
  );

  const handleCreateTask = (newTaskData: {
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    projectId: string;
    dueDate?: string;
  }) => {
    const matchedProject = reduxProjects.find((p) => p.id === newTaskData.projectId);
    const newTask: TaskDetailData = {
      id: `task-${Date.now()}`,
      workspace_id: effectiveWorkspaceId,
      project_id: newTaskData.projectId,
      title: newTaskData.title,
      description: newTaskData.description || null,
      project: matchedProject ? matchedProject.name : (currentWorkspaceProjects[0]?.name || 'General'),
      priority: newTaskData.priority,
      status: newTaskData.status,
      is_completed: newTaskData.status === 'done',
      due_date: newTaskData.dueDate || null,
      subtasks: [],
      comments: [],
      attachments: [],
    };

    setTasks((prev) => [newTask, ...prev]);

    dispatch(
      pushAction({
        description: `Created task "${newTask.title}" in ${activeWorkspace.name}`,
        type: 'TASK_EDIT',
        entityId: newTask.id,
        previousState: null,
        nextState: newTask,
      })
    );
  };

  const handleCreateProject = (newProjectData: {
    name: string;
    description: string;
    color: string;
    templateId?: string;
  }) => {
    const newProjId = `proj-${Date.now()}`;
    const newProj: Project = {
      id: newProjId,
      workspace_id: effectiveWorkspaceId,
      name: newProjectData.name,
      description: newProjectData.description || null,
      icon: 'folder',
      color: newProjectData.color,
      is_archived: false,
      last_used_view: 'kanban',
      created_by: currentUser?.id || 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dispatch(addProject(newProj));

    // If template selected, add starter tasks in this workspace
    if (newProjectData.templateId) {
      const template = PROJECT_TEMPLATES.find((t) => t.id === newProjectData.templateId);
      if (template) {
        const starterTasks: TaskDetailData[] = template.starterTasks.map((st, idx) => ({
          id: `task-${Date.now()}-${idx}`,
          workspace_id: effectiveWorkspaceId,
          title: st.title,
          description: st.description || null,
          project: newProj.name,
          project_id: newProjId,
          priority: st.priority as TaskPriority,
          status: 'todo' as TaskStatus,
          is_completed: false,
          subtasks: [],
          comments: [],
          attachments: [],
        }));
        setTasks((prev) => [...starterTasks, ...prev]);
      }
    }

    // Navigate to the newly created project
    router.push(`/p/${newProjId}`);
  };

  const handleApplyTemplate = (templateId: string) => {
    if (!userCanCreateProject) {
      toast.error('Permission Denied', {
        description: 'Viewers have read-only access. Switch to Owner, Admin, or Member to deploy project templates.',
      });
      return;
    }

    const tmpl = PROJECT_TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;

    handleCreateProject({
      name: `${tmpl.name} Project`,
      description: tmpl.description,
      color: tmpl.color,
      templateId: tmpl.id,
    });

    toast.success(`Deployed ${tmpl.name}!`, {
      description: `Created project with ${tmpl.columns.length} columns and ${tmpl.starterTasks.length} tasks in ${activeWorkspace.name}.`,
    });
  };

  const completedCount = currentWorkspaceTasks.filter((t) => t.is_completed).length;
  const pendingCount = currentWorkspaceTasks.length - completedCount;
  const activeProjectsCount = currentWorkspaceProjects.length;

  const userCanCreateTask = canCreateTask(currentRole);
  const userCanCreateProject = canCreateProject(currentRole);

  return (
    <AppShell
      workspaceName={activeWorkspace.name}
      onOpenCreateWorkspace={() => setIsCreateWorkspaceOpen(true)}
      onOpenCreateProject={() => {
        if (!userCanCreateProject) {
          toast.error('Permission Denied', {
            description: 'Viewers have read-only access. Switch to Owner, Admin, or Member to create projects.',
          });
          return;
        }
        setIsCreateProjectOpen(true);
      }}
      onOpenCreateTask={() => {
        if (!userCanCreateTask) {
          toast.error('Permission Denied', {
            description: 'Viewers have read-only access.',
          });
          return;
        }
        setIsCreateTaskOpen(true);
      }}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Navigation View Switcher Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border/80 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Analytics & Charts</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'kanban'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
              }`}
            >
              <KanbanSquare className="h-3.5 w-3.5" />
              <span>Board (Kanban)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
              }`}
            >
              <ListTodo className="h-3.5 w-3.5" />
              <span>List View</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-primary text-primary-foreground shadow-sm'
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
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
              }`}
            >
              <ActivityIcon className="h-3.5 w-3.5" />
              <span>Activity Log</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              id="btn-create-task"
              disabled={!userCanCreateTask}
              onClick={() => {
                if (!userCanCreateTask) {
                  toast.error('Permission Denied', {
                    description: 'Viewers have read-only access. Switch to Owner, Admin, or Member to create tasks.',
                  });
                  return;
                }
                setIsCreateTaskOpen(true);
              }}
              className="flex items-center gap-2 h-9 text-xs font-semibold shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Create Task</span>
            </Button>
            <Button
              id="btn-new-project"
              variant="outline"
              disabled={!userCanCreateProject}
              onClick={() => {
                if (!userCanCreateProject) {
                  toast.error('Permission Denied', {
                    description: 'Viewers have read-only access. Switch to Owner, Admin, or Member to create projects.',
                  });
                  return;
                }
                setIsCreateProjectOpen(true);
              }}
              className="flex items-center gap-2 h-9 text-xs font-semibold"
            >
              <FolderKanban className="h-4 w-4" />
              <span>New Project</span>
            </Button>
          </div>
        </div>

        {/* View 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in-50">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-border/90 bg-gradient-to-r from-card via-card to-primary/10 p-6 shadow-sm">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="tracking-wide uppercase text-[11px]">{activeWorkspace.name} • Active Workspace</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Welcome back, {currentUser?.full_name || 'Team Member'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  Collaborative project management in <span className="font-semibold text-foreground">{activeWorkspace.name}</span>.
                  {' '}{currentWorkspaceProjects.length} active projects and {currentWorkspaceTasks.length} tasks in this workspace.
                </p>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="solar-card rounded-xl p-4.5 group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Active Projects</span>
                  <span className="p-2 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/25">
                    <FolderKanban className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-foreground">{activeProjectsCount}</span>
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
                    <TrendingUp className="h-3 w-3" /> +{activeProjectsCount} active
                  </span>
                </div>
              </div>

              <div className="solar-card rounded-xl p-4.5 group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Tasks to Complete</span>
                  <span className="p-2 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/25">
                    <Clock className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-foreground">{pendingCount}</span>
                  <span className="text-xs text-muted-foreground font-medium">in active sprint</span>
                </div>
              </div>

              <div className="solar-card rounded-xl p-4.5 group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Completed Tasks</span>
                  <span className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-foreground">{completedCount}</span>
                  <span className="text-xs text-emerald-400 font-medium">
                    {tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}% progress
                  </span>
                </div>
              </div>

              <div className="solar-card rounded-xl p-4.5 group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Workspace Members</span>
                  <span className="p-2 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/25">
                    <Users className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-foreground">4</span>
                  <span className="text-xs text-muted-foreground font-medium">Owner, Admin, Members</span>
                </div>
              </div>
            </div>

            {/* ─── Projects Grid ──────────────────────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Projects</h2>
                  <p className="text-xs text-muted-foreground">
                    All projects in <span className="font-semibold text-foreground">{activeWorkspace.name}</span>
                  </p>
                </div>
                {userCanCreateProject && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsCreateProjectOpen(true)}
                    className="h-8 text-xs flex items-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Project</span>
                  </Button>
                )}
              </div>

              {currentWorkspaceProjects.length === 0 ? (
                <div className="solar-card rounded-xl p-8 text-center space-y-3 border-2 border-dashed border-border/60">
                  <div className="flex justify-center">
                    <span className="p-3 rounded-xl bg-primary/10 text-primary">
                      <FolderKanban className="h-8 w-8" />
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">No projects yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Create your first project to get started organizing tasks and workflows.
                    </p>
                  </div>
                  {userCanCreateProject && (
                    <Button size="sm" onClick={() => setIsCreateProjectOpen(true)} className="h-8 text-xs">
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Create First Project
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {currentWorkspaceProjects.map((proj) => {
                    const projTaskCount = tasks.filter(
                      (t) => t.project === proj.name || (t as any).project_id === proj.id
                    ).length;
                    const projDoneCount = tasks.filter(
                      (t) => (t.project === proj.name || (t as any).project_id === proj.id) && t.is_completed
                    ).length;
                    const progressPct = projTaskCount > 0 ? Math.round((projDoneCount / projTaskCount) * 100) : 0;

                    return (
                      <div
                        key={proj.id}
                        onClick={() => router.push(`/p/${proj.id}`)}
                        className="solar-card rounded-xl p-4 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group border border-border/70 space-y-3"
                      >
                        {/* Color dot + name */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                              style={{ backgroundColor: proj.color || '#3b82f6' }}
                            />
                            <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {proj.name}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-[10px] shrink-0 font-mono">
                            {projTaskCount} tasks
                          </Badge>
                        </div>

                        {/* Description */}
                        {proj.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {proj.description}
                          </p>
                        )}

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>{projDoneCount} done</span>
                            <span>{progressPct}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${progressPct}%`,
                                backgroundColor: proj.color || '#3b82f6',
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {proj.last_used_view || 'kanban'} view
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Project card */}
                  {userCanCreateProject && (
                    <div
                      onClick={() => setIsCreateProjectOpen(true)}
                      className="rounded-xl p-4 cursor-pointer border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group flex flex-col items-center justify-center gap-2 min-h-[140px]"
                    >
                      <span className="p-2.5 rounded-lg bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Plus className="h-5 w-5" />
                      </span>
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                        New Project
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Interactive Data Charts Spotlight (Column Chart & Donut Chart) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ColumnChart
                data={[
                  { label: 'To Do', value: currentWorkspaceTasks.filter((t) => t.status === 'todo').length, color: '#3b82f6' },
                  { label: 'In Progress', value: currentWorkspaceTasks.filter((t) => t.status === 'in_progress').length, color: '#8b5cf6' },
                  { label: 'Review', value: currentWorkspaceTasks.filter((t) => t.status === 'review').length, color: '#06b6d4' },
                  { label: 'Done', value: completedCount, color: '#10b981' },
                ]}
                title="Workflow Status Distribution (Column Chart)"
                subtitle={`Live task counts across workflow columns in ${activeWorkspace.name}`}
              />

              <DonutChart
                data={[
                  { label: 'Urgent', value: currentWorkspaceTasks.filter((t) => t.priority === 'urgent').length, color: '#f43f5e' },
                  { label: 'High', value: currentWorkspaceTasks.filter((t) => t.priority === 'high').length, color: '#f59e0b' },
                  { label: 'Medium', value: currentWorkspaceTasks.filter((t) => t.priority === 'medium').length, color: '#06b6d4' },
                  { label: 'Low', value: currentWorkspaceTasks.filter((t) => t.priority === 'low').length, color: '#10b981' },
                ].filter((s) => s.value > 0)}
                title="Priority Urgency Breakdown (Donut Chart)"
                subtitle="Categorized tasks by urgency weighting"
                centerSubtitle="Total Tasks"
              />
            </div>

            {/* Two-Column Section: Project Templates & Priority Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Priority Tasks List */}
              <div className="lg:col-span-2 solar-card rounded-xl p-5.5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Priority Tasks</h2>
                    <p className="text-xs text-muted-foreground">Scoped to {activeWorkspace.name} — click task name to open details</p>
                  </div>
                  <Badge variant="outline" className="text-xs font-medium">
                    {currentWorkspaceTasks.length} tasks
                  </Badge>
                </div>

                <div className="divide-y divide-border/80">
                  {currentWorkspaceTasks.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No tasks in <span className="font-semibold text-foreground">{activeWorkspace.name}</span> yet. Click <span className="font-semibold text-foreground">+ Create Task</span> above to add one.
                    </div>
                  ) : (
                    currentWorkspaceTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between py-3.5 px-2 transition-all hover:bg-muted/40 rounded-lg group"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleTask(task.id)}
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all cursor-pointer ${
                              task.is_completed
                                ? 'border-emerald-500/80 bg-emerald-500 text-white shadow-xs'
                                : 'border-input hover:border-primary bg-card/60'
                            }`}
                          >
                            {task.is_completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                          </button>

                          <div
                            className="space-y-0.5 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setSelectedTask(task)}
                          >
                            <p
                              className={`text-sm font-medium ${
                                task.is_completed
                                  ? 'line-through text-muted-foreground/70'
                                  : 'text-foreground'
                              }`}
                            >
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-medium text-muted-foreground/90">{task.project}</span>
                              {task.subtasks && task.subtasks.length > 0 && (
                                <span>• {task.subtasks.filter((s) => s.is_completed).length}/{task.subtasks.length} checklist</span>
                              )}
                              {task.comments && task.comments.length > 0 && (
                                <span>• {task.comments.length} comments</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              task.priority === 'urgent'
                                ? 'destructive'
                                : task.priority === 'high'
                                ? 'warning'
                                : 'secondary'
                            }
                            className="capitalize text-[11px]"
                          >
                            {task.priority}
                          </Badge>
                          <Badge
                            variant={task.is_completed ? 'success' : 'outline'}
                            className="capitalize text-[11px]"
                          >
                            {task.status.replace('_', ' ')}
                          </Badge>

                          {canDeleteTask(currentRole) && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => deleteTask(task.id, e)}
                              title="Delete task"
                              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Project Templates Card */}
              <div className="solar-card rounded-xl p-5.5 space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Starter Templates</h2>
                  <p className="text-xs text-muted-foreground">Click any template to deploy instantly</p>
                </div>

                <div className="space-y-3">
                  {PROJECT_TEMPLATES.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => handleApplyTemplate(tmpl.id)}
                      className="group flex flex-col gap-1.5 rounded-xl border border-border/80 bg-card/60 p-3.5 transition-all hover:border-primary/60 hover:bg-card hover:shadow-xs cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-foreground flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full shadow-xs"
                            style={{ backgroundColor: tmpl.color }}
                          />
                          {tmpl.name}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {tmpl.description}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] text-muted-foreground/80 font-mono">
                          {tmpl.columns.length} columns • {tmpl.starterTasks.length} starter tasks
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View 2: Drag-and-Drop Kanban Board */}
        {activeTab === 'kanban' && (
          <div className="animate-in fade-in-50">
            <KanbanBoard
              columns={columns}
              tasks={currentWorkspaceTasks}
              onTasksChange={(updated) => {
                setTasks((prev) => {
                  const otherTasks = prev.filter(
                    (t) => t.workspace_id !== effectiveWorkspaceId && (t.workspace_id || effectiveWorkspaceId !== 'ws-1')
                  );
                  return [...otherTasks, ...updated];
                });
              }}
              onSelectTask={setSelectedTask}
              onDeleteTask={deleteTask}
              onOpenCreateTask={() => setIsCreateTaskOpen(true)}
            />
          </div>
        )}

        {/* View 3: Sortable List / Table with Bulk Actions */}
        {activeTab === 'list' && (
          <div className="animate-in fade-in-50">
            <ListView
              tasks={currentWorkspaceTasks}
              onTasksChange={(updated) => {
                setTasks((prev) => {
                  const otherTasks = prev.filter(
                    (t) => t.workspace_id !== effectiveWorkspaceId && (t.workspace_id || effectiveWorkspaceId !== 'ws-1')
                  );
                  return [...otherTasks, ...updated];
                });
              }}
              onSelectTask={setSelectedTask}
              onDeleteTask={deleteTask}
            />
          </div>
        )}

        {/* View 4: Month Calendar Grid with Due Dates */}
        {activeTab === 'calendar' && (
          <div className="animate-in fade-in-50">
            <CalendarView
              tasks={currentWorkspaceTasks}
              onSelectTask={setSelectedTask}
            />
          </div>
        )}

        {/* View 5: Activity Log and Audit Timeline */}
        {activeTab === 'activity' && (
          <div className="animate-in fade-in-50">
            <ActivityFeed workspaceId={activeWorkspace.id} />
          </div>
        )}

        {/* View 6: Deep-Dive Interactive Analytics & Charts */}
        {activeTab === 'analytics' && (
          <div className="animate-in fade-in-50">
            <InteractiveAnalyticsDashboard
              tasks={currentWorkspaceTasks}
              projects={currentWorkspaceProjects}
              workspaceName={activeWorkspace.name}
              onSelectTask={setSelectedTask}
            />
          </div>
        )}
      </div>

      {/* Task Creation Modal */}
      <CreateTaskModal
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        projects={currentWorkspaceProjects.map((p) => ({ id: p.id, name: p.name }))}
        onCreateTask={handleCreateTask}
      />

      {/* Project Creation Modal */}
      <CreateProjectModal
        open={isCreateProjectOpen}
        onOpenChange={setIsCreateProjectOpen}
        onCreateProject={handleCreateProject}
      />

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        open={isCreateWorkspaceOpen}
        onOpenChange={setIsCreateWorkspaceOpen}
      />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          open={!!selectedTask}
          onOpenChange={(open) => {
            if (!open) setSelectedTask(null);
          }}
          task={selectedTask}
          onUpdateTask={handleUpdateTaskDetail}
          onDeleteTask={(id) => {
            deleteTask(id, { stopPropagation: () => {} } as React.MouseEvent);
            setSelectedTask(null);
          }}
          onDuplicateTask={handleDuplicateTask}
        />
      )}

      {/* Global Keyboard Shortcuts (C: create, K: kanban, L: list, D: dashboard) */}
      <KeyboardShortcuts
        onOpenCreateTask={() => setIsCreateTaskOpen(true)}
        onSelectView={(v) => setActiveTab(v)}
      />
    </AppShell>
  );
}

export default function Home() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading workspace...</div>}>
      <MainWorkspaceContent />
    </React.Suspense>
  );
}
