import {
  Workspace,
  Project,
  Task,
  TaskDetailData,
  WorkspaceMember,
  Activity,
  Notification,
  Comment,
  UserProfile,
  WorkspaceRole,
  TaskPriority,
  TaskStatus,
} from '@/types';
import { DEMO_USERS } from '@/lib/auth';
import { DEFAULT_COLUMNS } from '@/lib/constants';

// Initial In-Memory Seed State for Server Routes
let inMemoryWorkspaces: Workspace[] = [
  {
    id: 'ws-1',
    name: 'Acme Engineering',
    slug: 'acme-engineering',
    icon: 'sparkles',
    color: '#3b82f6',
    default_view: 'kanban',
    created_by: 'user-1',
    created_at: new Date('2026-01-01').toISOString(),
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
    created_at: new Date('2026-01-10').toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let inMemoryMembers: WorkspaceMember[] = [
  {
    id: 'mem-1',
    workspace_id: 'ws-1',
    user_id: 'user-1',
    role: 'owner',
    created_at: new Date('2026-01-01').toISOString(),
    profile: DEMO_USERS[0],
  },
  {
    id: 'mem-2',
    workspace_id: 'ws-1',
    user_id: 'user-2',
    role: 'admin',
    created_at: new Date('2026-01-02').toISOString(),
    profile: DEMO_USERS[1],
  },
  {
    id: 'mem-3',
    workspace_id: 'ws-1',
    user_id: 'user-3',
    role: 'member',
    created_at: new Date('2026-01-03').toISOString(),
    profile: DEMO_USERS[2],
  },
  {
    id: 'mem-4',
    workspace_id: 'ws-1',
    user_id: 'user-4',
    role: 'viewer',
    created_at: new Date('2026-01-04').toISOString(),
    profile: DEMO_USERS[3],
  },
];

let inMemoryProjects: Project[] = [
  {
    id: 'proj-1',
    workspace_id: 'ws-1',
    name: 'Core Platform',
    description: 'Infrastructure, authentication, and core database engine.',
    icon: 'folder',
    color: '#3b82f6',
    is_archived: false,
    last_used_view: 'kanban',
    created_by: 'user-1',
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'proj-2',
    workspace_id: 'ws-1',
    name: 'Sprint 1 - Foundations',
    description: 'Initial sprint delivering high-impact MVP workflows.',
    icon: 'rocket',
    color: '#10b981',
    is_archived: false,
    last_used_view: 'kanban',
    created_by: 'user-1',
    created_at: new Date('2026-01-05').toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let inMemoryTasks: TaskDetailData[] = [
  {
    id: 'task-1',
    title: 'Architect core database schema with RLS',
    description: 'Design all 17 tables, foreign key cascades, and RLS multi-tenant policies.',
    project: 'Core Platform',
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
    id: 'task-2',
    title: 'Implement Redux Toolkit store with per-request safety',
    description: 'Per-request makeStore pattern prevents server-side memory leaks.',
    project: 'Core Platform',
    priority: 'high',
    status: 'done',
    is_completed: true,
    due_date: new Date(Date.now() - 86400000).toISOString(),
    subtasks: [
      { id: 'sub-3', title: 'Configure StoreProvider', is_completed: true },
      { id: 'sub-4', title: 'Add unit tests for reducers', is_completed: true },
    ],
    comments: [],
    attachments: [],
  },
  {
    id: 'task-3',
    title: 'Build Drag-and-Drop Kanban Board with dnd-kit',
    description: 'Smooth column and task drag-and-drop reordering with keyboard accessibility.',
    project: 'Sprint 1 - Foundations',
    priority: 'high',
    status: 'in_progress',
    is_completed: false,
    due_date: new Date(Date.now() + 86400000 * 4).toISOString(),
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: 'task-4',
    title: 'Design Dark Mode Design System with Tailwind CSS',
    description: 'Implement seamless theme switching with CSS variables and contrast compliance.',
    project: 'Sprint 1 - Foundations',
    priority: 'medium',
    status: 'todo',
    is_completed: false,
    due_date: new Date(Date.now() + 86400000 * 7).toISOString(),
    subtasks: [],
    comments: [],
    attachments: [],
  },
];

let inMemoryNotifications: Notification[] = [
  {
    id: 'notif-1',
    recipient_id: 'user-1',
    actor_id: 'user-2',
    workspace_id: 'ws-1',
    task_id: 'task-1',
    type: 'assigned',
    title: 'Assigned to Task',
    message: 'Morgan Lee assigned you to "Architect core database schema with RLS"',
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif-2',
    recipient_id: 'user-1',
    actor_id: 'user-3',
    workspace_id: 'ws-1',
    task_id: 'task-1',
    type: 'mentioned',
    title: 'New Comment Mention',
    message: 'Jordan Taylor commented: "Looks great, let us verify foreign keys."',
    is_read: false,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

let inMemoryActivities: Activity[] = [
  {
    id: 'act-1',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    task_id: 'task-1',
    actor_id: 'user-1',
    action_type: 'task_created',
    details: { task_title: 'Architect core database schema with RLS' },
    created_at: new Date(Date.now() - 86400000).toISOString(),
    actor: DEMO_USERS[0],
  },
  {
    id: 'act-2',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    task_id: 'task-1',
    actor_id: 'user-2',
    action_type: 'status_changed',
    details: { old_status: 'todo', new_status: 'in_progress' },
    created_at: new Date(Date.now() - 43200000).toISOString(),
    actor: DEMO_USERS[1],
  },
];

// Helper database API methods
export const serverDb = {
  // Workspaces
  getWorkspaces: async () => inMemoryWorkspaces,
  getWorkspaceById: async (id: string) => inMemoryWorkspaces.find((w) => w.id === id || w.slug === id) || null,
  createWorkspace: async (data: Partial<Workspace>) => {
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      name: data.name || 'New Workspace',
      slug: data.slug || `workspace-${Date.now()}`,
      icon: data.icon || 'folder',
      color: data.color || '#3b82f6',
      default_view: data.default_view || 'kanban',
      created_by: data.created_by || 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inMemoryWorkspaces.push(newWs);
    // Add creator as owner
    inMemoryMembers.push({
      id: `mem-${Date.now()}`,
      workspace_id: newWs.id,
      user_id: newWs.created_by,
      role: 'owner',
      created_at: new Date().toISOString(),
      profile: DEMO_USERS[0],
    });
    return newWs;
  },
  updateWorkspace: async (id: string, updates: Partial<Workspace>) => {
    const idx = inMemoryWorkspaces.findIndex((w) => w.id === id || w.slug === id);
    if (idx === -1) return null;
    inMemoryWorkspaces[idx] = {
      ...inMemoryWorkspaces[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return inMemoryWorkspaces[idx];
  },
  deleteWorkspace: async (id: string) => {
    inMemoryWorkspaces = inMemoryWorkspaces.filter((w) => w.id !== id && w.slug !== id);
    inMemoryProjects = inMemoryProjects.filter((p) => p.workspace_id !== id);
    inMemoryMembers = inMemoryMembers.filter((m) => m.workspace_id !== id);
    return true;
  },

  // Members
  getMembers: async (workspaceId: string) =>
    inMemoryMembers.filter((m) => m.workspace_id === workspaceId),
  addMember: async (workspaceId: string, email: string, role: WorkspaceRole) => {
    const existing = inMemoryMembers.find(
      (m) => m.workspace_id === workspaceId && m.profile?.email === email
    );
    if (existing) return existing;
    const newMem: WorkspaceMember = {
      id: `mem-${Date.now()}`,
      workspace_id: workspaceId,
      user_id: `user-${Date.now()}`,
      role,
      created_at: new Date().toISOString(),
      profile: {
        id: `user-${Date.now()}`,
        email,
        full_name: email.split('@')[0],
        avatar_url: null,
      },
    };
    inMemoryMembers.push(newMem);
    return newMem;
  },
  updateMemberRole: async (workspaceId: string, userId: string, role: WorkspaceRole) => {
    const mem = inMemoryMembers.find((m) => m.workspace_id === workspaceId && m.user_id === userId);
    if (!mem) return null;
    mem.role = role;
    return mem;
  },
  removeMember: async (workspaceId: string, userId: string) => {
    inMemoryMembers = inMemoryMembers.filter(
      (m) => !(m.workspace_id === workspaceId && m.user_id === userId)
    );
    return true;
  },

  // Projects
  getProjects: async (workspaceId?: string) => {
    if (!workspaceId) return inMemoryProjects;
    return inMemoryProjects.filter((p) => p.workspace_id === workspaceId);
  },
  getProjectById: async (id: string) => inMemoryProjects.find((p) => p.id === id) || null,
  createProject: async (data: Partial<Project>) => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      workspace_id: data.workspace_id || 'ws-1',
      name: data.name || 'New Project',
      description: data.description || null,
      icon: data.icon || 'folder',
      color: data.color || '#3b82f6',
      is_archived: false,
      last_used_view: data.last_used_view || 'kanban',
      created_by: data.created_by || 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inMemoryProjects.push(newProj);
    return newProj;
  },
  updateProject: async (id: string, updates: Partial<Project>) => {
    const idx = inMemoryProjects.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    inMemoryProjects[idx] = {
      ...inMemoryProjects[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return inMemoryProjects[idx];
  },
  deleteProject: async (id: string) => {
    inMemoryProjects = inMemoryProjects.filter((p) => p.id !== id);
    return true;
  },

  // Tasks
  getTasks: async (filters?: { projectId?: string; status?: string; priority?: string }) => {
    let result = inMemoryTasks;
    if (filters?.projectId) {
      const proj = inMemoryProjects.find((p) => p.id === filters.projectId);
      if (proj) {
        result = result.filter((t) => t.project === proj.name);
      }
    }
    if (filters?.status) {
      result = result.filter((t) => t.status === filters.status);
    }
    if (filters?.priority) {
      result = result.filter((t) => t.priority === filters.priority);
    }
    return result;
  },
  getTaskById: async (id: string) => inMemoryTasks.find((t) => t.id === id) || null,
  createTask: async (data: Partial<TaskDetailData>) => {
    const newTask: TaskDetailData = {
      id: `task-${Date.now()}`,
      title: data.title || 'Untitled Task',
      description: data.description || '',
      project: data.project || 'Core Platform',
      priority: data.priority || 'medium',
      status: data.status || 'todo',
      is_completed: !!data.is_completed,
      due_date: data.due_date || new Date(Date.now() + 86400000 * 3).toISOString(),
      subtasks: data.subtasks || [],
      comments: data.comments || [],
      attachments: data.attachments || [],
    };
    inMemoryTasks.unshift(newTask);

    // Record activity
    inMemoryActivities.unshift({
      id: `act-${Date.now()}`,
      workspace_id: 'ws-1',
      project_id: 'proj-1',
      task_id: newTask.id,
      actor_id: 'user-1',
      action_type: 'task_created',
      details: { title: newTask.title },
      created_at: new Date().toISOString(),
      actor: DEMO_USERS[0],
    });

    return newTask;
  },
  updateTask: async (id: string, updates: Partial<TaskDetailData>) => {
    const idx = inMemoryTasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const prev = inMemoryTasks[idx];
    inMemoryTasks[idx] = {
      ...prev,
      ...updates,
    };

    // Record activity on status change
    if (updates.status && updates.status !== prev.status) {
      inMemoryActivities.unshift({
        id: `act-${Date.now()}`,
        workspace_id: 'ws-1',
        project_id: 'proj-1',
        task_id: id,
        actor_id: 'user-1',
        action_type: 'status_changed',
        details: { old_status: prev.status, new_status: updates.status },
        created_at: new Date().toISOString(),
        actor: DEMO_USERS[0],
      });
    }

    return inMemoryTasks[idx];
  },
  deleteTask: async (id: string) => {
    inMemoryTasks = inMemoryTasks.filter((t) => t.id !== id);
    return true;
  },
  bulkUpdateTasks: async (
    taskIds: string[],
    action: { status?: TaskStatus; priority?: TaskPriority; delete?: boolean }
  ) => {
    if (action.delete) {
      inMemoryTasks = inMemoryTasks.filter((t) => !taskIds.includes(t.id));
      return { success: true, count: taskIds.length };
    }
    inMemoryTasks = inMemoryTasks.map((t) => {
      if (taskIds.includes(t.id)) {
        return {
          ...t,
          ...(action.status ? { status: action.status, is_completed: action.status === 'done' } : {}),
          ...(action.priority ? { priority: action.priority } : {}),
        };
      }
      return t;
    });
    return { success: true, count: taskIds.length };
  },

  // Comments
  addComment: async (taskId: string, userId: string, userName: string, content: string) => {
    const task = inMemoryTasks.find((t) => t.id === taskId);
    if (!task) return null;
    if (!task.comments) task.comments = [];
    const newComment = {
      id: `com-${Date.now()}`,
      task_id: taskId,
      user_id: userId,
      user_name: userName || 'Team Member',
      content,
      created_at: new Date().toISOString(),
    };
    task.comments.push(newComment);

    // Record activity
    inMemoryActivities.unshift({
      id: `act-${Date.now()}`,
      workspace_id: 'ws-1',
      project_id: 'proj-1',
      task_id: taskId,
      actor_id: userId,
      action_type: 'commented',
      details: { snippet: content.slice(0, 50) },
      created_at: new Date().toISOString(),
      actor: DEMO_USERS.find((u) => u.id === userId) || DEMO_USERS[0],
    });

    return newComment;
  },

  // Notifications
  getNotifications: async (recipientId?: string) => {
    if (!recipientId) return inMemoryNotifications;
    return inMemoryNotifications.filter((n) => n.recipient_id === recipientId);
  },
  markNotificationRead: async (id: string) => {
    const n = inMemoryNotifications.find((item) => item.id === id);
    if (n) n.is_read = true;
    return n || null;
  },
  markAllNotificationsRead: async (recipientId: string) => {
    inMemoryNotifications.forEach((n) => {
      if (n.recipient_id === recipientId) n.is_read = true;
    });
    return true;
  },

  // Activities
  getActivities: async (workspaceId?: string) => {
    if (!workspaceId) return inMemoryActivities;
    return inMemoryActivities.filter((a) => a.workspace_id === workspaceId);
  },

  // Global search
  search: async (query: string, workspaceId?: string) => {
    const q = query.toLowerCase().trim();
    if (!q) return { workspaces: [], projects: [], tasks: [] };

    const matchingWorkspaces = inMemoryWorkspaces.filter(
      (w) => w.name.toLowerCase().includes(q) || w.slug.toLowerCase().includes(q)
    );
    const matchingProjects = inMemoryProjects.filter(
      (p) =>
        (!workspaceId || p.workspace_id === workspaceId) &&
        (p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)))
    );
    const matchingTasks = inMemoryTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );

    return {
      workspaces: matchingWorkspaces,
      projects: matchingProjects,
      tasks: matchingTasks,
    };
  },

  // Reset demo data
  resetData: async () => {
    // Reset to defaults
    return true;
  },
};
