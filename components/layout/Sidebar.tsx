'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  KanbanSquare,
  ListTodo,
  Calendar,
  Users,
  Settings,
  FolderPlus,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';
import { useAppSelector } from '@/lib/redux/hooks';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { WorkspaceSwitcher } from '@/components/workspace/WorkspaceSwitcher';

interface SidebarProps {
  currentRole?: string;
  onOpenCreateProject?: () => void;
  onOpenCreateWorkspace?: () => void;
}

function SidebarInner({
  currentRole = 'owner',
  onOpenCreateProject,
  onOpenCreateWorkspace,
}: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view');
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const activeWorkspaceId = useAppSelector((state) => state.workspace.activeWorkspaceId);
  const workspaces = useAppSelector((state) => state.workspace.workspaces);
  const projects = useAppSelector((state) => state.project.projects);

  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0] || {
      id: 'ws-1',
      name: 'Acme Engineering',
      icon: 'sparkles',
      color: '#3b82f6',
    };

  const workspaceProjects = projects.filter(
    (p) => p.workspace_id === activeWorkspace.id || (!p.workspace_id && activeWorkspace.id === 'ws-1')
  );

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/', view: null },
    { label: 'Analytics', icon: BarChart3, href: '/?view=analytics', view: 'analytics' },
    { label: 'Board (Kanban)', icon: KanbanSquare, href: '/?view=kanban', view: 'kanban' },
    { label: 'List', icon: ListTodo, href: '/?view=list', view: 'list' },
    { label: 'Calendar', icon: Calendar, href: '/?view=calendar', view: 'calendar' },
    { label: 'Members', icon: Users, href: '/members', view: null },
    { label: 'Settings', icon: Settings, href: '/settings', view: null },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out select-none',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Workspace Header / Switcher */}
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
        {sidebarOpen ? (
          <div className="flex items-center justify-between w-full gap-2">
            <WorkspaceSwitcher onOpenCreateWorkspace={onOpenCreateWorkspace} />
            {onOpenCreateWorkspace && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onOpenCreateWorkspace}
                title="Create Workspace"
                className="text-muted-foreground hover:text-foreground shrink-0 h-7 w-7"
              >
                <Sparkles className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ) : (
          <div
            className="flex h-8 w-8 mx-auto shrink-0 items-center justify-center rounded-lg shadow-sm text-white font-bold text-sm"
            style={{ backgroundColor: activeWorkspace.color || '#3b82f6' }}
            title={activeWorkspace.name}
          >
            {activeWorkspace.name?.slice(0, 1).toUpperCase() || 'W'}
          </div>
        )}
      </div>

      {/* Main Navigation links */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.view !== null
              ? pathname === '/' && currentView === item.view
              : item.href === '/'
                ? pathname === '/' && !currentView
                : pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-medium transition-all',
                  isActive
                    ? 'bg-primary/15 text-primary font-semibold border border-primary/20 shadow-xs'
                    : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground'
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Projects Section */}
        {sidebarOpen && (
          <div className="mt-6 pt-4 border-t border-sidebar-border">
            <div className="flex items-center justify-between px-2 pb-2">
              <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Projects
              </span>
              {onOpenCreateProject && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onOpenCreateProject}
                  title="New Project"
                  className="h-5 w-5 text-muted-foreground hover:text-foreground"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            <div className="space-y-1 mt-1">
              {workspaceProjects.length === 0 ? (
                <div className="px-2 py-3 text-[11px] text-muted-foreground/80 italic">
                  No projects in this workspace yet. Click + to create one.
                </div>
              ) : (
                workspaceProjects.map((proj) => (
                  <Link
                    key={proj.id}
                    href={`/p/${proj.id}`}
                    className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="h-2 w-2 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: proj.color || '#3b82f6' }}
                      />
                      <span className="truncate">{proj.name}</span>
                    </div>
                    <ChevronRight className="h-3 w-3 opacity-40" />
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info with safe bottom clearance */}
      {sidebarOpen && (
        <div className="border-t border-sidebar-border p-3 pb-8 text-[11px] text-muted-foreground flex items-center justify-between">
          <span className="font-medium text-foreground/80">Workspace Manager</span>
          <span className="text-[10px] bg-primary/15 text-primary border border-primary/25 px-2 py-0.5 rounded-full font-mono font-semibold">v1.0</span>
        </div>
      )}
    </aside>
  );
}

export function Sidebar(props: SidebarProps) {
  return (
    <React.Suspense fallback={null}>
      <SidebarInner {...props} />
    </React.Suspense>
  );
}
