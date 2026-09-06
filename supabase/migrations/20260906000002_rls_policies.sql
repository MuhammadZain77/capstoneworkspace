-- Workspace Manager Row Level Security (RLS) Policies
-- Migration: 20260906000002_rls_policies.sql

-- Helper function to check if user is a member of a workspace
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = ws_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is an owner or admin of a workspace
CREATE OR REPLACE FUNCTION public.is_workspace_admin(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = ws_id 
          AND user_id = auth.uid() 
          AND role IN ('owner', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is an owner of a workspace
CREATE OR REPLACE FUNCTION public.is_workspace_owner(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = ws_id 
          AND user_id = auth.uid() 
          AND role = 'owner'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 2. WORKSPACES
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workspaces they belong to"
    ON public.workspaces FOR SELECT
    TO authenticated
    USING (public.is_workspace_member(id));

CREATE POLICY "Authenticated users can create workspaces"
    ON public.workspaces FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owners and admins can update workspace"
    ON public.workspaces FOR UPDATE
    TO authenticated
    USING (public.is_workspace_admin(id))
    WITH CHECK (public.is_workspace_admin(id));

CREATE POLICY "Only owners can delete workspace"
    ON public.workspaces FOR DELETE
    TO authenticated
    USING (public.is_workspace_owner(id));

-- Trigger: Automatically add creator as owner when workspace is created
CREATE OR REPLACE FUNCTION public.handle_new_workspace()
RETURNS TRIGGER AS $$
BEGIN
    IF auth.uid() IS NOT NULL THEN
        INSERT INTO public.workspace_members (workspace_id, user_id, role)
        VALUES (NEW.id, auth.uid(), 'owner')
        ON CONFLICT (workspace_id, user_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_workspace_created ON public.workspaces;
CREATE TRIGGER on_workspace_created
    AFTER INSERT ON public.workspaces
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_workspace();

-- 3. WORKSPACE MEMBERS
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view other members in their workspace"
    ON public.workspace_members FOR SELECT
    TO authenticated
    USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Admins and owners can add members"
    ON public.workspace_members FOR INSERT
    TO authenticated
    WITH CHECK (public.is_workspace_admin(workspace_id));

CREATE POLICY "Admins and owners can update member roles"
    ON public.workspace_members FOR UPDATE
    TO authenticated
    USING (public.is_workspace_admin(workspace_id))
    WITH CHECK (public.is_workspace_admin(workspace_id));

CREATE POLICY "Admins and owners can remove members"
    ON public.workspace_members FOR DELETE
    TO authenticated
    USING (public.is_workspace_admin(workspace_id) OR user_id = auth.uid());

-- 4. PROJECTS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view projects in their workspace"
    ON public.projects FOR SELECT
    TO authenticated
    USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Non-viewers can create projects"
    ON public.projects FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_workspace_member(workspace_id) AND
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_id = projects.workspace_id 
              AND user_id = auth.uid()
              AND role IN ('owner', 'admin', 'member')
        )
    );

CREATE POLICY "Non-viewers can update projects"
    ON public.projects FOR UPDATE
    TO authenticated
    USING (
        public.is_workspace_member(workspace_id) AND
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_id = projects.workspace_id 
              AND user_id = auth.uid()
              AND role IN ('owner', 'admin', 'member')
        )
    );

CREATE POLICY "Admins and owners can delete projects"
    ON public.projects FOR DELETE
    TO authenticated
    USING (public.is_workspace_admin(workspace_id));

-- 5. KANBAN COLUMNS
ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view kanban columns"
    ON public.kanban_columns FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = kanban_columns.project_id
              AND public.is_workspace_member(projects.workspace_id)
        )
    );

CREATE POLICY "Non-viewers can manage kanban columns"
    ON public.kanban_columns FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
            WHERE p.id = kanban_columns.project_id
              AND wm.user_id = auth.uid()
              AND wm.role IN ('owner', 'admin', 'member')
        )
    );

-- 6. TASKS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view tasks"
    ON public.tasks FOR SELECT
    TO authenticated
    USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Non-viewers can create tasks"
    ON public.tasks FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_id = tasks.workspace_id 
              AND user_id = auth.uid() 
              AND role IN ('owner', 'admin', 'member')
        )
    );

CREATE POLICY "Non-viewers can update tasks"
    ON public.tasks FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_id = tasks.workspace_id 
              AND user_id = auth.uid() 
              AND role IN ('owner', 'admin', 'member')
        )
    );

CREATE POLICY "Non-viewers can delete tasks"
    ON public.tasks FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_id = tasks.workspace_id 
              AND user_id = auth.uid() 
              AND role IN ('owner', 'admin', 'member')
        )
    );

-- 7. COMMENTS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view comments"
    ON public.comments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tasks
            WHERE tasks.id = comments.task_id
              AND public.is_workspace_member(tasks.workspace_id)
        )
    );

CREATE POLICY "Members can add comments"
    ON public.comments FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.tasks
            WHERE tasks.id = comments.task_id
              AND public.is_workspace_member(tasks.workspace_id)
        )
    );

CREATE POLICY "Users can update own comments"
    ON public.comments FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments, admins can moderate"
    ON public.comments FOR DELETE
    TO authenticated
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id = comments.task_id
              AND public.is_workspace_admin(t.workspace_id)
        )
    );

-- 8. ACTIVITIES
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view activities"
    ON public.activities FOR SELECT
    TO authenticated
    USING (public.is_workspace_member(workspace_id));

CREATE POLICY "System and members can insert activities"
    ON public.activities FOR INSERT
    TO authenticated
    WITH CHECK (public.is_workspace_member(workspace_id));

-- 9. NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view only their own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update only their own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (auth.uid() = recipient_id)
    WITH CHECK (auth.uid() = recipient_id);

-- 10. USER PREFERENCES
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
    ON public.user_preferences FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON public.user_preferences FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 11. SAVED FILTERS
ALTER TABLE public.saved_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saved filters"
    ON public.saved_filters FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
