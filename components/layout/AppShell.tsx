'use client';

import * as React from 'react';
import { Toaster } from 'sonner';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAppSelector } from '@/lib/redux/hooks';

import { CommandPalette } from '@/components/navigation/CommandPalette';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { CreateWorkspaceModal } from '@/features/workspaces/CreateWorkspaceModal';

interface AppShellProps {
  children: React.ReactNode;
  projectName?: string;
  workspaceName?: string;
  currentRole?: string;
  onOpenCreateProject?: () => void;
  onOpenCreateWorkspace?: () => void;
  onOpenCreateTask?: () => void;
}

export function AppShell({
  children,
  projectName,
  workspaceName = 'Main Workspace',
  currentRole: propRole,
  onOpenCreateProject,
  onOpenCreateWorkspace,
  onOpenCreateTask,
}: AppShellProps) {
  const theme = useAppSelector((state) => state.ui.theme);
  const activeRole = useAppSelector((state) => state.auth.currentRole);
  const currentRole = propRole || activeRole;

  const [internalCreateWorkspaceOpen, setInternalCreateWorkspaceOpen] = React.useState(false);

  const handleOpenCreateWorkspace = onOpenCreateWorkspace || (() => setInternalCreateWorkspaceOpen(true));

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground antialiased">
      {/* Sidebar */}
      <Sidebar
        currentRole={currentRole}
        onOpenCreateProject={onOpenCreateProject}
        onOpenCreateWorkspace={handleOpenCreateWorkspace}
      />

      {/* Main Layout */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          workspaceName={workspaceName}
          projectName={projectName}
          onOpenCreateWorkspace={handleOpenCreateWorkspace}
        />

        {/* Scrollable page body */}
        <main className="flex-1 overflow-y-auto bg-background/50 p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette
        onOpenCreateTask={onOpenCreateTask}
        onOpenCreateProject={onOpenCreateProject}
      />

      {/* Slide-out Notification Center Drawer */}
      <NotificationCenter />

      {/* Fallback Create Workspace Modal (only when no parent-level handler provided) */}
      {!onOpenCreateWorkspace && (
        <CreateWorkspaceModal
          open={internalCreateWorkspaceOpen}
          onOpenChange={setInternalCreateWorkspaceOpen}
        />
      )}

      {/* Toast notifications container with undo action support */}
      <Toaster
        theme={theme === 'dark' ? 'dark' : 'light'}
        position="bottom-right"
        richColors
        closeButton
      />
    </div>
  );
}
