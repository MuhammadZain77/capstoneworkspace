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
import { PROJECT_TEMPLATES, WORKSPACE_COLORS } from '@/lib/constants';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (project: {
    name: string;
    description: string;
    color: string;
    templateId?: string;
  }) => void;
}

export function CreateProjectModal({
  open,
  onOpenChange,
  onCreateProject,
}: CreateProjectModalProps) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [color, setColor] = React.useState(WORKSPACE_COLORS[0]);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>('kanban_starter');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    onCreateProject({
      name: name.trim(),
      description: description.trim(),
      color,
      templateId: selectedTemplate !== 'none' ? selectedTemplate : undefined,
    });

    toast.success(`Project "${name.trim()}" created!`, {
      description: `Configured with ${
        PROJECT_TEMPLATES.find((t) => t.id === selectedTemplate)?.name || 'custom workflow'
      }.`,
    });

    setName('');
    setDescription('');
    setColor(WORKSPACE_COLORS[0]);
    setSelectedTemplate('kanban_starter');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Organize tasks, workflows, and team collaboration in a new project.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Project Name */}
            <div className="space-y-1.5">
              <label htmlFor="proj-name" className="text-xs font-semibold text-foreground">
                Project Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="proj-name"
                placeholder="e.g. Mobile App Redesign"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="proj-desc" className="text-xs font-semibold text-foreground">
                Description
              </label>
              <textarea
                id="proj-desc"
                rows={2}
                placeholder="What is the primary objective of this project?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Color Accent */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Project Color
              </label>
              <div className="flex items-center gap-2 pt-1">
                {WORKSPACE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-6 w-6 rounded-full transition-transform cursor-pointer ${
                      color === c ? 'scale-125 ring-2 ring-ring ring-offset-2 ring-offset-background' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Starter Template */}
            <div className="space-y-1.5">
              <label htmlFor="proj-template" className="text-xs font-semibold text-foreground">
                Starter Template
              </label>
              <select
                id="proj-template"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="none">Blank Project (Empty board)</option>
                {PROJECT_TEMPLATES.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    {tmpl.name} ({tmpl.columns.length} columns, {tmpl.starterTasks.length} tasks)
                  </option>
                ))}
              </select>
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
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
