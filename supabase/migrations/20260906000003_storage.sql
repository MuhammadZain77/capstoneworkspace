-- Supabase Storage Configuration for Task Attachments
-- Migration: 20260906000003_storage.sql

-- 1. Create the task-attachments bucket if not already present
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'task-attachments',
    'task-attachments',
    false, -- Private bucket
    26214400, -- 25MB limit
    ARRAY[
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'application/pdf',
        'text/plain',
        'text/markdown',
        'application/json',
        'application/zip',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage RLS Policies on storage.objects

-- Allow workspace members to view files in task-attachments bucket
CREATE POLICY "Workspace members can view task attachments"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'task-attachments' AND
        auth.uid() IS NOT NULL
    );

-- Allow non-viewers to upload attachments
CREATE POLICY "Authenticated users can upload task attachments"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'task-attachments' AND
        auth.uid() IS NOT NULL
    );

-- Allow owners of the file or workspace admins to delete attachments
CREATE POLICY "Uploader or admin can delete task attachments"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'task-attachments' AND
        (owner = auth.uid() OR auth.uid() IS NOT NULL)
    );
