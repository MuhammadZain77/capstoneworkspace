# Workspace Manager Database Architecture

This document describes the PostgreSQL relational database schema, Row Level Security (RLS) policies, storage configuration, and triggers for **Workspace Manager**.

---

## 1. Schema Overview

The database is built on normalized relational PostgreSQL tables using UUID primary keys, explicit foreign key constraints, timestamp tracking, and composite indexes.

```text
[auth.users] ──< [profiles] ──< [workspace_members] >── [workspaces]
                     │                                         │
                     │                                         ├──< [projects]
                     │                                         │         │
                     │                                         │         ├──< [kanban_columns]
                     │                                         │         └──< [tasks]
                     │                                         │                  │
                     │                                         │                  ├──< [subtasks]
                     │                                         │                  ├──< [comments]
                     │                                         │                  ├──< [attachments]
                     │                                         │                  └──< [task_labels] >── [labels]
                     │                                         └──< [activities]
                     └──< [notifications]
```

---

## 2. Table Specifications

### `profiles`
Extends `auth.users` with application-level user metadata.
- `id` (UUID, PK): References `auth.users.id` with `ON DELETE CASCADE`.
- `email` (TEXT, NOT NULL): Synchronized from `auth.users`.
- `full_name` (TEXT): Display name.
- `avatar_url` (TEXT): Profile photo image URL.
- `theme` (TEXT): User preference (`light`, `dark`, `system`).
- `created_at`, `updated_at` (TIMESTAMPTZ).

### `workspaces`
Primary tenancy boundary.
- `id` (UUID, PK): Auto-generated UUID.
- `name` (TEXT, NOT NULL): Workspace name.
- `slug` (TEXT, UNIQUE, NOT NULL): URL slug identifier.
- `icon` (TEXT): Visual icon identifier.
- `color` (TEXT): Hex color accent.
- `default_view` (TEXT): Default starting view (`kanban`, `list`, `calendar`).
- `created_by` (UUID): Creator profile ID.
- `created_at`, `updated_at` (TIMESTAMPTZ).

### `workspace_members`
User membership and role assignment within a workspace.
- `id` (UUID, PK).
- `workspace_id` (UUID, FK): References `workspaces.id` with `ON DELETE CASCADE`.
- `user_id` (UUID, FK): References `profiles.id` with `ON DELETE CASCADE`.
- `role` (TEXT, CHECK): Role tier (`owner`, `admin`, `member`, `viewer`).
- *Constraint*: `UNIQUE(workspace_id, user_id)`.

### `workspace_invitations`
Pending team member invitations.
- `id` (UUID, PK).
- `workspace_id` (UUID, FK).
- `email` (TEXT, NOT NULL).
- `role` (TEXT, CHECK: `admin`, `member`, `viewer`).
- `token` (TEXT, UNIQUE): Secure random token.
- `expires_at` (TIMESTAMPTZ).

### `projects`
Scattered team projects within a workspace.
- `id` (UUID, PK).
- `workspace_id` (UUID, FK): References `workspaces.id` with `ON DELETE CASCADE`.
- `name` (TEXT, NOT NULL).
- `description` (TEXT).
- `icon` (TEXT), `color` (TEXT).
- `is_archived` (BOOLEAN): Soft-archival flag.
- `last_used_view` (TEXT): Persisted user view preference.

### `kanban_columns`
Customizable board columns per project.
- `id` (UUID, PK).
- `project_id` (UUID, FK): References `projects.id` with `ON DELETE CASCADE`.
- `name` (TEXT, NOT NULL).
- `position` (INTEGER, NOT NULL): Order on board.
- `color` (TEXT).
- `is_default_done` (BOOLEAN): Tasks in this column are marked completed.

### `tasks`
Core task engine entity.
- `id` (UUID, PK).
- `workspace_id` (UUID, FK), `project_id` (UUID, FK).
- `parent_task_id` (UUID, FK, nullable): References `tasks.id` for nested checklist subtasks.
- `title` (TEXT, NOT NULL).
- `description` (TEXT).
- `status` (TEXT, NOT NULL).
- `column_id` (UUID, FK, nullable): References `kanban_columns.id`.
- `priority` (TEXT, CHECK: `urgent`, `high`, `medium`, `low`, `none`).
- `due_date` (TIMESTAMPTZ).
- `assignee_id` (UUID, FK, nullable): Assigned member.
- `created_by` (UUID, FK).
- `sort_order` (DOUBLE PRECISION): Drag-and-drop sort position.
- `is_completed` (BOOLEAN).

### `labels` & `task_labels`
Tagging system scoped to workspace.
- `labels`: `id`, `workspace_id`, `name`, `color`. Unique per `(workspace_id, name)`.
- `task_labels`: Many-to-many junction table (`task_id`, `label_id`).

### `comments`
Threaded discussion per task.
- `id` (UUID, PK).
- `task_id` (UUID, FK): References `tasks.id` with `ON DELETE CASCADE`.
- `user_id` (UUID, FK): References `profiles.id`.
- `content` (TEXT, NOT NULL).

### `attachments`
File attachments stored in Supabase Storage.
- `id` (UUID, PK).
- `task_id` (UUID, FK): References `tasks.id` with `ON DELETE CASCADE`.
- `file_name` (TEXT), `file_size` (BIGINT), `mime_type` (TEXT).
- `storage_path` (TEXT): Object path in `task-attachments` bucket.
- `uploaded_by` (UUID, FK).

### `activities`
Immutable audit log.
- `id` (UUID, PK).
- `workspace_id`, `project_id`, `task_id`.
- `actor_id` (UUID, FK).
- `action_type` (TEXT): `task_created`, `status_changed`, `assigned`, etc.
- `details` (JSONB): Structured payload.

### `notifications`
In-app user notifications.
- `id` (UUID, PK).
- `recipient_id` (UUID, FK): Isolated to the notified user.
- `actor_id` (UUID, FK).
- `type` (TEXT: `assigned`, `mentioned`, `due_soon`).
- `title` (TEXT), `message` (TEXT).
- `is_read` (BOOLEAN).

### `saved_filters`
User-defined task filtering presets.
- `id`, `user_id`, `workspace_id`, `name`, `filter_criteria` (JSONB).

### `project_templates` & `project_template_tasks`
Predefined starter workflow templates (`kanban_starter`, `software_sprint`, `bug_tracker`).

---

## 3. Row Level Security (RLS) Model

Every table enforces PostgreSQL Row Level Security to prevent unauthorized access, IDOR vulnerabilities, and cross-tenant data leaks:

1. **Workspace Boundary**:
   - Access to any workspace resource (projects, tasks, columns, comments, attachments) requires verified membership in `workspace_members`.
2. **Role Capability Gates**:
   - `owner`: Full control including workspace deletion, ownership transfer, and data reset.
   - `admin`: Project management, member invitation, role assignment, and comment moderation.
   - `member`: Read/write access to tasks, comments, and project workflows.
   - `viewer`: Strictly read-only access (`SELECT` permissions only).
3. **User Isolation**:
   - `notifications`, `user_preferences`, and `saved_filters` are strictly restricted to `auth.uid() = user_id`.

---

## 4. Supabase Storage Configuration

- **Bucket**: `task-attachments` (Private).
- **Size Limit**: 25 MB per file.
- **Allowed Types**: Images (`png`, `jpeg`, `gif`, `webp`, `svg`), Documents (`pdf`, `docx`), Plain text/Markdown, and Archives (`zip`).
- **Access Policies**: Only verified workspace members can view objects; only non-viewers can upload; only the original uploader or workspace admins can delete.
