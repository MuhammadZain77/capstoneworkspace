-- Workspace Manager Seed Data
-- supabase/seed.sql

-- 1. Insert Project Templates
INSERT INTO public.project_templates (id, name, description, icon, color)
VALUES
    ('kanban_starter', 'Kanban Starter', 'A flexible, simple board to track items through To Do, In Progress, Review, and Done.', 'layout', '#3b82f6'),
    ('software_sprint', 'Software Sprint', 'Engineered for agile software teams with Backlog, Sprint, Testing, and Deployed stages.', 'code', '#10b981'),
    ('bug_tracker', 'Bug Tracker', 'Track, triage, diagnose, and resolve defects with severity tagging.', 'bug', '#ef4444')
ON CONFLICT (id) DO NOTHING;

-- Template Tasks
INSERT INTO public.project_template_tasks (template_id, title, description, priority, status, sort_order)
VALUES
    ('kanban_starter', 'Welcome to Workspace Manager 🎉', 'Explore boards, list, calendar views, and drag tasks around!', 'high', 'todo', 1),
    ('kanban_starter', 'Try pressing Cmd + K for Command Palette', 'Quickly switch workspaces, search, and perform actions.', 'medium', 'todo', 2),
    ('kanban_starter', 'Add a subtask checklist', 'Open this task to view subtasks and comments.', 'medium', 'in_progress', 3),
    ('kanban_starter', 'Project kick-off meeting', 'Review goals with the team.', 'low', 'done', 4),
    ('software_sprint', 'Implement OAuth authentication', 'Support Supabase Auth with Google and GitHub.', 'urgent', 'todo', 1),
    ('software_sprint', 'Optimize database indexes', 'Add composite indexes for tasks by workspace and project.', 'high', 'in_progress', 2),
    ('software_sprint', 'Set up end-to-end integration tests', 'Cover critical path with Playwright.', 'medium', 'review', 3),
    ('bug_tracker', 'Fix drag-and-drop boundary clipping on mobile', 'Touch events need auto-scrolling container behavior.', 'high', 'todo', 1),
    ('bug_tracker', 'Prevent session timeout during offline sync', 'Revalidate tokens before replaying mutation queue.', 'medium', 'in_progress', 2)
ON CONFLICT DO NOTHING;

-- 2. Mock Users / Profiles for local demo testing
-- UUID constants for reliable foreign key linking
DO $$
DECLARE
    owner_id UUID := '11111111-1111-1111-1111-111111111111';
    admin_id UUID := '22222222-2222-2222-2222-222222222222';
    member_id UUID := '33333333-3333-3333-3333-333333333333';
    viewer_id UUID := '44444444-4444-4444-4444-444444444444';
    ws_id UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    proj_core_id UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    proj_sprint_id UUID := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
    col_todo UUID := 'dddddddd-dddd-dddd-dddd-dddddddddddd';
    col_prog UUID := 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
    col_rev UUID := 'ffffffff-ffff-ffff-ffff-ffffffffffff';
    col_done UUID := '99999999-9999-9999-9999-999999999999';
    task_1 UUID := 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1';
    task_2 UUID := 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2';
    task_3 UUID := 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3';
    task_4 UUID := 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4';
BEGIN
    -- Insert demo profiles (if auth.users has them or in standalone profile testing)
    INSERT INTO public.profiles (id, email, full_name, avatar_url, theme)
    VALUES
        (owner_id, 'alex.chen@workspace.dev', 'Alex Chen (Owner)', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces', 'system'),
        (admin_id, 'sarah.kim@workspace.dev', 'Sarah Kim (Admin)', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces', 'system'),
        (member_id, 'marcus.johnson@workspace.dev', 'Marcus Johnson (Member)', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces', 'system'),
        (viewer_id, 'elena.rostova@workspace.dev', 'Elena Rostova (Viewer)', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces', 'system')
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url;

    -- Insert Workspace
    INSERT INTO public.workspaces (id, name, slug, icon, color, default_view, created_by)
    VALUES (ws_id, 'Acme Engineering', 'acme-engineering', 'briefcase', '#3b82f6', 'kanban', owner_id)
    ON CONFLICT (id) DO NOTHING;

    -- Workspace Members
    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES
        (ws_id, owner_id, 'owner'),
        (ws_id, admin_id, 'admin'),
        (ws_id, member_id, 'member'),
        (ws_id, viewer_id, 'viewer')
    ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = EXCLUDED.role;

    -- Projects
    INSERT INTO public.projects (id, workspace_id, name, description, icon, color, created_by)
    VALUES
        (proj_core_id, ws_id, 'Core Platform', 'Infrastructure, authentication, and core database engine.', 'server', '#3b82f6', owner_id),
        (proj_sprint_id, ws_id, 'Sprint 1', 'Frontend Kanban board and real-time collaboration features.', 'zap', '#10b981', admin_id)
    ON CONFLICT (id) DO NOTHING;

    -- Kanban Columns for Core Platform
    INSERT INTO public.kanban_columns (id, project_id, name, position, color, is_default_done)
    VALUES
        (col_todo, proj_core_id, 'To Do', 0, '#94a3b8', false),
        (col_prog, proj_core_id, 'In Progress', 1, '#3b82f6', false),
        (col_rev, proj_core_id, 'Review', 2, '#a855f7', false),
        (col_done, proj_core_id, 'Done', 3, '#22c55e', true)
    ON CONFLICT (id) DO NOTHING;

    -- Tasks
    INSERT INTO public.tasks (id, workspace_id, project_id, title, description, status, column_id, priority, due_date, assignee_id, created_by, is_completed)
    VALUES
        (task_1, ws_id, proj_core_id, 'Configure PostgreSQL database schema with RLS', 'Set up migrations, foreign key constraints, cascade rules, and security policies.', 'in_progress', col_prog, 'urgent', NOW() + INTERVAL '2 days', owner_id, owner_id, false),
        (task_2, ws_id, proj_core_id, 'Implement Redux Toolkit store with per-request safety', 'Configure makeStore, typed hooks, StoreProvider, and slice architecture.', 'done', col_done, 'high', NOW() - INTERVAL '1 day', admin_id, owner_id, true),
        (task_3, ws_id, proj_core_id, 'Build drag-and-drop Kanban board using dnd-kit', 'Implement fluid column reordering and optimistic drag-and-drop state rollback.', 'todo', col_todo, 'high', NOW() + INTERVAL '5 days', member_id, admin_id, false),
        (task_4, ws_id, proj_core_id, 'Wire up IndexedDB offline synchronization engine', 'Support local mutation replay with conflict resolution and offline indicators.', 'todo', col_todo, 'medium', NOW() + INTERVAL '7 days', member_id, owner_id, false)
    ON CONFLICT (id) DO NOTHING;

    -- Subtask checklist for Task 1
    INSERT INTO public.tasks (workspace_id, project_id, parent_task_id, title, status, priority, created_by, is_completed)
    VALUES
        (ws_id, proj_core_id, task_1, 'Draft table schemas and migrations', 'done', 'high', owner_id, true),
        (ws_id, proj_core_id, task_1, 'Write comprehensive RLS policies', 'in_progress', 'urgent', owner_id, false),
        (ws_id, proj_core_id, task_1, 'Verify tenant isolation with multi-user tests', 'todo', 'high', owner_id, false)
    ON CONFLICT DO NOTHING;

    -- Labels
    INSERT INTO public.labels (workspace_id, name, color)
    VALUES
        (ws_id, 'Backend', '#3b82f6'),
        (ws_id, 'Security', '#ef4444'),
        (ws_id, 'Frontend', '#10b981'),
        (ws_id, 'DevOps', '#8b5cf6')
    ON CONFLICT (workspace_id, name) DO NOTHING;

    -- Activity entries
    INSERT INTO public.activities (workspace_id, project_id, task_id, actor_id, action_type, details)
    VALUES
        (ws_id, proj_core_id, task_1, owner_id, 'task_created', '{"title": "Configure PostgreSQL database schema with RLS"}'::jsonb),
        (ws_id, proj_core_id, task_2, admin_id, 'status_changed', '{"from": "in_progress", "to": "done"}'::jsonb)
    ON CONFLICT DO NOTHING;

    -- Notifications
    INSERT INTO public.notifications (recipient_id, actor_id, workspace_id, task_id, type, title, message)
    VALUES
        (owner_id, admin_id, ws_id, task_2, 'assigned', 'Task Completed', 'Sarah Kim marked "Implement Redux Toolkit store" as Done.')
    ON CONFLICT DO NOTHING;
END $$;
