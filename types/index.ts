export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | string;

export type ViewType = 'kanban' | 'list' | 'calendar';

export type GroupByType = 'assignee' | 'status' | 'priority' | 'label' | 'none';

export type ThemeType = 'light' | 'dark' | 'system';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  theme?: ThemeType;
  created_at?: string;
  updated_at?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  default_view: ViewType;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
  profile?: UserProfile;
}

export interface WorkspaceInvitation {
  id: string;
  workspace_id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  invited_by: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface KanbanColumn {
  id: string;
  project_id: string;
  name: string;
  position: number;
  color?: string | null;
  is_default_done: boolean;
  created_at?: string;
}

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  is_archived: boolean;
  last_used_view: ViewType;
  created_by: string;
  created_at: string;
  updated_at: string;
  columns?: KanbanColumn[];
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  created_at: string;
  profile?: UserProfile;
}

export interface Label {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
}

export interface Attachment {
  id: string;
  task_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  uploaded_by: string;
  created_at: string;
  public_url?: string;
}

export interface Task {
  id: string;
  project_id: string;
  workspace_id: string;
  parent_task_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  column_id: string | null;
  priority: TaskPriority;
  due_date: string | null;
  assignee_id: string | null;
  created_by: string;
  sort_order: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  assignee?: UserProfile | null;
  labels?: Label[];
  subtasks?: Task[];
  subtask_count?: number;
  completed_subtask_count?: number;
  comment_count?: number;
  attachment_count?: number;
  attachments?: Attachment[];
}

export interface TaskDetailData {
  id: string;
  title: string;
  description: string | null;
  project: string;
  priority: TaskPriority;
  status: TaskStatus;
  is_completed: boolean;
  due_date?: string | null;
  assignee?: { id: string; name: string; avatar?: string } | null;
  subtasks?: { id: string; title: string; is_completed: boolean }[];
  comments?: { id: string; user_id: string; user_name: string; avatar?: string; content: string; created_at: string }[];
  attachments?: { id: string; name: string; size: string }[];
  workspace_id?: string;
  project_id?: string;
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  user_name?: string;
  content: string;
  created_at: string;
  updated_at?: string;
  author?: UserProfile;
}

export interface Activity {
  id: string;
  workspace_id: string;
  project_id: string | null;
  task_id: string | null;
  actor_id: string;
  action_type: string;
  details: Record<string, unknown>;
  created_at: string;
  actor?: UserProfile;
}

export interface Notification {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  workspace_id: string;
  task_id: string | null;
  type: 'assigned' | 'mentioned' | 'due_soon';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  actor?: UserProfile;
}

export interface UserPreferences {
  user_id: string;
  notify_assigned: boolean;
  notify_mentioned: boolean;
  notify_due_soon: boolean;
  default_workspace_id: string | null;
  theme: ThemeType;
  updated_at?: string;
}

export interface FilterCriteria {
  searchQuery?: string;
  assigneeId?: string | null;
  priorities?: TaskPriority[];
  statuses?: string[];
  labelIds?: string[];
  dueDateRange?: {
    from?: string | null;
    to?: string | null;
  };
  sortBy?: 'due_date' | 'priority' | 'created_at' | 'alphabetical';
  sortOrder?: 'asc' | 'desc';
}

export interface SavedFilter {
  id: string;
  user_id: string;
  workspace_id: string;
  name: string;
  filter_criteria: FilterCriteria;
  created_at: string;
}
