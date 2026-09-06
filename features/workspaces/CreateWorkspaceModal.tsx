'use client';

import * as React from 'react';
import { Sparkles, Check, LayoutDashboard, KanbanSquare, ListTodo, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { addWorkspace, setActiveWorkspaceId } from '@/lib/redux/slices/workspaceSlice';
import { Workspace, ViewType } from '@/types';

interface CreateWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkspaceCreated?: (workspace: Workspace) => void;
}

const WORKSPACE_COLORS = [
  { name: 'Cobalt Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Electric Purple', value: '#8b5cf6' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Cyan', value: '#06b6d4' },
];

export function CreateWorkspaceModal({
  open,
  onOpenChange,
  onWorkspaceCreated,
}: CreateWorkspaceModalProps) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [color, setColor] = React.useState('#3b82f6');
  const [defaultView, setDefaultView] = React.useState<ViewType>('kanban');

  React.useEffect(() => {
    if (open) {
      setName('');
      setSlug('');
      setColor('#3b82f6');
      setDefaultView('kanban');
    }
  }, [open]);

  const handleNameChange = (val: string) => {
    setName(val);
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(autoSlug);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Workspace name is required');
      return;
    }

    const newWorkspace: Workspace = {
      id: `ws-${Date.now()}`,
      name: name.trim(),
      slug: slug || `workspace-${Date.now()}`,
      icon: 'sparkles',
      color,
      default_view: defaultView,
      created_by: currentUser?.id || 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dispatch(addWorkspace(newWorkspace));
    dispatch(setActiveWorkspaceId(newWorkspace.id));

    if (onWorkspaceCreated) {
      onWorkspaceCreated(newWorkspace);
    }

    toast.success(`Workspace "${newWorkspace.name}" created!`, {
      description: 'Switched to new workspace. You can now create projects and tasks here.',
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Multi-Tenant Architecture</span>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">Create New Workspace</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Workspaces are isolated environments for your team projects, boards, and tasks.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Workspace Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Workspace Name <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. Mobile Engineering, Marketing, Growth..."
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="h-9 text-xs"
              autoFocus
            />
          </div>

          {/* Workspace Slug */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Workspace URL Slug
            </label>
            <div className="flex items-center rounded-md border border-input bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground font-mono">
              <span className="opacity-60">app.workspace.io/</span>
              <span className="text-foreground font-semibold">{slug || 'workspace-slug'}</span>
            </div>
          </div>

          {/* Workspace Color */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Brand Color</label>
            <div className="flex items-center gap-2.5 pt-1">
              {WORKSPACE_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className="relative flex h-7 w-7 items-center justify-center rounded-full transition-transform hover:scale-110 cursor-pointer shadow-xs"
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                >
                  {color === c.value && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Default View */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Default Project View</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDefaultView('kanban')}
                className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 text-xs transition-all cursor-pointer ${
                  defaultView === 'kanban'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted/40'
                }`}
              >
                <KanbanSquare className="h-4 w-4" />
                <span>Kanban</span>
              </button>

              <button
                type="button"
                onClick={() => setDefaultView('list')}
                className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 text-xs transition-all cursor-pointer ${
                  defaultView === 'list'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted/40'
                }`}
              >
                <ListTodo className="h-4 w-4" />
                <span>List</span>
              </button>

              <button
                type="button"
                onClick={() => setDefaultView('calendar')}
                className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 text-xs transition-all cursor-pointer ${
                  defaultView === 'calendar'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted/40'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Calendar</span>
              </button>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()} className="text-xs h-9 font-semibold">
              Create Workspace
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
