'use client';

import * as React from 'react';
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
import { TASK_PRIORITIES } from '@/lib/constants';
import { TaskPriority, TaskStatus } from '@/types';

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: { id: string; name: string }[];
  onCreateTask: (task: {
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    projectId: string;
    dueDate?: string;
  }) => void;
}

export function CreateTaskModal({
  open,
  onOpenChange,
  projects,
  onCreateTask,
}: CreateTaskModalProps) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [priority, setPriority] = React.useState<TaskPriority>('medium');
  const [status, setStatus] = React.useState<TaskStatus>('todo');
  const [projectId, setProjectId] = React.useState(projects[0]?.id || 'default');
  const [dueDate, setDueDate] = React.useState('');

  React.useEffect(() => {
    if (projects.length > 0 && (!projectId || projectId === 'default')) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    onCreateTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      projectId,
      dueDate: dueDate || undefined,
    });

    toast.success(`Task "${title.trim()}" created!`, {
      description: `Added to ${projects.find((p) => p.id === projectId)?.name || 'project'}.`,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('todo');
    setDueDate('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new actionable task to your workspace project.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="task-title" className="text-xs font-semibold text-foreground">
                Task Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="task-title"
                placeholder="e.g. Design user profile settings page"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="task-desc" className="text-xs font-semibold text-foreground">
                Description
              </label>
              <textarea
                id="task-desc"
                rows={3}
                placeholder="Provide additional context, requirements, or links..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Project & Status Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="task-project" className="text-xs font-semibold text-foreground">
                  Project
                </label>
                <select
                  id="task-project"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="task-status" className="text-xs font-semibold text-foreground">
                  Status
                </label>
                <select
                  id="task-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            {/* Priority & Due Date Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="task-priority" className="text-xs font-semibold text-foreground">
                  Priority
                </label>
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {TASK_PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="task-due" className="text-xs font-semibold text-foreground">
                  Due Date
                </label>
                <Input
                  id="task-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
