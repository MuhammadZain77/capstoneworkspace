import { TaskPriority, WorkspaceRole } from '@/types';

export const WORKSPACE_ROLES: { label: string; value: WorkspaceRole; description: string }[] = [
  { label: 'Owner', value: 'owner', description: 'Full access to workspace, settings, billing, and member roles' },
  { label: 'Admin', value: 'admin', description: 'Can manage projects, members, tasks, and column settings' },
  { label: 'Member', value: 'member', description: 'Can create and edit tasks, comments, and project content' },
  { label: 'Viewer', value: 'viewer', description: 'Read-only access to projects and tasks' },
];

export const TASK_PRIORITIES: { label: string; value: TaskPriority; color: string; bg: string }[] = [
  { label: 'Urgent', value: 'urgent', color: '#ef4444', bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50' },
  { label: 'High', value: 'high', color: '#f97316', bg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/50' },
  { label: 'Medium', value: 'medium', color: '#eab308', bg: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50' },
  { label: 'Low', value: 'low', color: '#3b82f6', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50' },
  { label: 'None', value: 'none', color: '#6b7280', bg: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800' },
];

export const DEFAULT_COLUMNS = [
  { name: 'To Do', position: 0, color: '#94a3b8', is_default_done: false },
  { name: 'In Progress', position: 1, color: '#3b82f6', is_default_done: false },
  { name: 'Review', position: 2, color: '#a855f7', is_default_done: false },
  { name: 'Done', position: 3, color: '#22c55e', is_default_done: true },
];

export const PROJECT_TEMPLATES = [
  {
    id: 'kanban_starter',
    name: 'Kanban Starter',
    description: 'A flexible, simple board to track items through To Do, In Progress, Review, and Done.',
    icon: 'layout',
    color: '#3b82f6',
    columns: DEFAULT_COLUMNS,
    starterTasks: [
      { title: 'Welcome to Workspace Manager 🎉', description: 'Explore boards, list, calendar views, and drag tasks around!', priority: 'high', status: 'To Do' },
      { title: 'Try pressing Cmd + K for Command Palette', description: 'Quickly switch workspaces, search, and perform actions.', priority: 'medium', status: 'To Do' },
      { title: 'Add a subtask checklist', description: 'Open this task to view subtasks and comments.', priority: 'medium', status: 'In Progress' },
      { title: 'Project kick-off meeting', description: 'Review goals with the team.', priority: 'low', status: 'Done' },
    ],
  },
  {
    id: 'software_sprint',
    name: 'Software Sprint',
    description: 'Engineered for agile software teams with Backlog, Sprint, Testing, and Deployed stages.',
    icon: 'code',
    color: '#10b981',
    columns: [
      { name: 'Backlog', position: 0, color: '#64748b', is_default_done: false },
      { name: 'In Development', position: 1, color: '#3b82f6', is_default_done: false },
      { name: 'Code Review & QA', position: 2, color: '#eab308', is_default_done: false },
      { name: 'Released', position: 3, color: '#10b981', is_default_done: true },
    ],
    starterTasks: [
      { title: 'Implement OAuth authentication', description: 'Support Supabase Auth with Google and GitHub.', priority: 'urgent', status: 'Backlog' },
      { title: 'Optimize database indexes', description: 'Add composite indexes for tasks by workspace and project.', priority: 'high', status: 'In Development' },
      { title: 'Set up end-to-end integration tests', description: 'Cover critical path with Playwright.', priority: 'medium', status: 'Code Review & QA' },
    ],
  },
  {
    id: 'bug_tracker',
    name: 'Bug Tracker',
    description: 'Track, triage, diagnose, and resolve defects with severity tagging.',
    icon: 'bug',
    color: '#ef4444',
    columns: [
      { name: 'Reported', position: 0, color: '#ef4444', is_default_done: false },
      { name: 'Investigating', position: 1, color: '#f97316', is_default_done: false },
      { name: 'Fix in Progress', position: 2, color: '#3b82f6', is_default_done: false },
      { name: 'Resolved', position: 3, color: '#22c55e', is_default_done: true },
    ],
    starterTasks: [
      { title: 'Fix drag-and-drop boundary clipping on mobile', description: 'Touch events need auto-scrolling container behavior.', priority: 'high', status: 'Reported' },
      { title: 'Prevent session timeout during offline sync', description: 'Revalidate tokens before replaying mutation queue.', priority: 'medium', status: 'Investigating' },
    ],
  },
];

export const WORKSPACE_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#14b8a6', // Teal
];
