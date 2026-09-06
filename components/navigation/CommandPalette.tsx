'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  LayoutDashboard,
  KanbanSquare,
  ListTodo,
  Calendar,
  Users,
  Settings,
  Plus,
  FolderPlus,
  Sun,
  Moon,
  Search,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { setCommandPaletteOpen, setTheme } from '@/lib/redux/slices/uiSlice';
import { switchDemoUser } from '@/lib/redux/slices/authSlice';
import { DEMO_USERS } from '@/lib/auth';
import { Dialog } from '@/components/ui/dialog';

interface CommandPaletteProps {
  onOpenCreateTask?: () => void;
  onOpenCreateProject?: () => void;
}

export function CommandPalette({
  onOpenCreateTask,
  onOpenCreateProject,
}: CommandPaletteProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.ui.commandPaletteOpen);
  const theme = useAppSelector((state) => state.ui.theme);

  // Global Cmd+K / Ctrl+K keyboard shortcut listener
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        dispatch(setCommandPaletteOpen(!open));
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [dispatch, open]);

  const runCommand = (command: () => void) => {
    dispatch(setCommandPaletteOpen(false));
    command();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => dispatch(setCommandPaletteOpen(val))}>
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-2xl animate-in zoom-in-95">
        <Command className="flex flex-col w-full text-foreground">
          <div className="flex items-center border-b border-border px-3.5">
            <Search className="mr-2.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              placeholder="Type a command or search..."
              className="flex h-12 w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 space-y-1">
            <Command.Empty className="py-6 text-center text-xs text-muted-foreground">
              No matching commands or pages found.
            </Command.Empty>

            {/* Navigation Group */}
            <Command.Group heading="Navigation" className="text-[10px] font-semibold text-muted-foreground uppercase px-2 py-1.5">
              <Command.Item
                onSelect={() => runCommand(() => router.push('/'))}
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer hover:bg-muted aria-selected:bg-primary/10 aria-selected:text-primary transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-primary" />
                <span>Dashboard Overview</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push('/?view=kanban'))}
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer hover:bg-muted aria-selected:bg-primary/10 aria-selected:text-primary transition-colors"
              >
                <KanbanSquare className="h-4 w-4 text-accent" />
                <span>Board (Kanban View)</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push('/?view=list'))}
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer hover:bg-muted aria-selected:bg-primary/10 aria-selected:text-primary transition-colors"
              >
                <ListTodo className="h-4 w-4 text-emerald-500" />
                <span>List / Table View</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push('/?view=calendar'))}
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer hover:bg-muted aria-selected:bg-primary/10 aria-selected:text-primary transition-colors"
              >
                <Calendar className="h-4 w-4 text-amber-500" />
                <span>Calendar View</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push('/members'))}
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer hover:bg-muted aria-selected:bg-primary/10 aria-selected:text-primary transition-colors"
              >
                <Users className="h-4 w-4 text-purple-500" />
                <span>Workspace Members</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push('/settings'))}
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer hover:bg-muted aria-selected:bg-primary/10 aria-selected:text-primary transition-colors"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span>Workspace Settings</span>
              </Command.Item>
            </Command.Group>

            {/* Quick Actions */}
            <Command.Group heading="Actions" className="text-[10px] font-semibold text-muted-foreground uppercase px-2 py-1.5 mt-2 border-t border-border/60 pt-2">
              {onOpenCreateTask && (
                <Command.Item
                  onSelect={() => runCommand(onOpenCreateTask)}
                  className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer hover:bg-muted aria-selected:bg-primary/10 aria-selected:text-primary transition-colors"
                >
                  <Plus className="h-4 w-4 text-primary" />
                  <span>Create New Task</span>
                </Command.Item>
              )}

              {onOpenCreateProject && (
                <Command.Item
                  onSelect={() => runCommand(onOpenCreateProject)}
                  className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer hover:bg-muted aria-selected:bg-primary/10 aria-selected:text-primary transition-colors"
                >
                  <FolderPlus className="h-4 w-4 text-emerald-500" />
                  <span>Create New Project</span>
                </Command.Item>
              )}

              <Command.Item
                onSelect={() =>
                  runCommand(() => {
                    const next = theme === 'dark' ? 'light' : 'dark';
                    dispatch(setTheme(next));
                    localStorage.setItem('wm_theme', next);
                    document.documentElement.classList.remove('light', 'dark');
                    document.documentElement.classList.add(next);
                    toast.success(`Theme switched to ${next.toUpperCase()}`);
                  })
                }
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer hover:bg-muted aria-selected:bg-primary/10 aria-selected:text-primary transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-blue-400" />}
                <span>Toggle Light / Solarized Dark</span>
              </Command.Item>
            </Command.Group>

            {/* Switch Account */}
            <Command.Group heading="Switch Role Account" className="text-[10px] font-semibold text-muted-foreground uppercase px-2 py-1.5 mt-2 border-t border-border/60 pt-2">
              {DEMO_USERS.map((user) => (
                <Command.Item
                  key={user.id}
                  onSelect={() =>
                    runCommand(() => {
                      dispatch(switchDemoUser(user.id));
                      toast.success(`Active user switched to ${user.full_name} (${user.role.toUpperCase()})`);
                    })
                  }
                  className="flex items-center justify-between px-2.5 py-2 text-xs rounded-lg cursor-pointer hover:bg-muted aria-selected:bg-primary/10 aria-selected:text-primary transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-primary" />
                    <span>{user.full_name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">{user.role}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          <div className="border-t border-border p-2.5 text-[10px] text-muted-foreground flex items-center justify-between px-4 bg-muted/20">
            <span>Use ↑ ↓ to navigate, Enter to select, Esc to close</span>
            <span className="font-mono">Cmd + K</span>
          </div>
        </Command>
      </div>
    </Dialog>
  );
}
