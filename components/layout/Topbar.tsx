'use client';

import * as React from 'react';
import {
  Menu,
  Search,
  Bell,
  Command,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  toggleSidebar,
  setCommandPaletteOpen,
  setNotificationCenterOpen,
} from '@/lib/redux/slices/uiSlice';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { OfflineBadge } from '@/components/common/OfflineBadge';

import { MockUserSwitcher } from '@/features/auth/MockUserSwitcher';
import { WorkspaceSwitcher } from '@/components/workspace/WorkspaceSwitcher';

interface TopbarProps {
  workspaceName?: string;
  projectName?: string;
  onOpenCreateWorkspace?: () => void;
}

export function Topbar({
  workspaceName = 'Main Workspace',
  projectName,
  onOpenCreateWorkspace,
}: TopbarProps) {
  const dispatch = useAppDispatch();
  const unreadCount = useAppSelector((state) => state.notification.unreadCount);

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md">
      {/* Left section: Hamburger & Workspace Switcher */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => dispatch(toggleSidebar())}
          className="text-muted-foreground hover:text-foreground"
          title="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>

        <div className="flex items-center gap-2">
          <WorkspaceSwitcher onOpenCreateWorkspace={onOpenCreateWorkspace} />
          {projectName && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="text-xs font-semibold text-foreground/90">{projectName}</span>
            </>
          )}
        </div>
      </div>

      {/* Middle section: Global Search / Cmd+K trigger */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <button
          type="button"
          onClick={() => dispatch(setCommandPaletteOpen(true))}
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-muted/40 px-3 text-xs text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            <span>Search tasks, projects, or commands...</span>
          </span>
          <kbd className="pointer-events-none hidden select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <Command className="h-2.5 w-2.5" /> K
          </kbd>
        </button>
      </div>

      {/* Right section: Offline Badge, Theme, Notifications, Multi-user Switcher */}
      <div className="flex items-center gap-2">
        <OfflineBadge />

        <div className="h-4 w-px bg-border mx-1" />

        <ThemeToggle />

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative text-muted-foreground hover:text-foreground"
          onClick={() => dispatch(setNotificationCenterOpen(true))}
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Multi-User Role Switcher */}
        <div className="pl-1">
          <MockUserSwitcher />
        </div>
      </div>
    </header>
  );
}
