'use client';

import * as React from 'react';
import {
  ArrowUpDown,
  CheckCircle2,
  Calendar,
  User,
  Trash2,
  CheckSquare,
  Square,
  Layers,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { TaskDetailData } from '@/features/tasks/TaskDetailModal';
import { TaskPriority, TaskStatus, GroupByType } from '@/types';
import { TASK_PRIORITIES } from '@/lib/constants';
import { canDeleteTask, canEditTask } from '@/lib/permissions';
import { useAppSelector } from '@/lib/redux/hooks';

interface ListViewProps {
  tasks: TaskDetailData[];
  onTasksChange: (tasks: TaskDetailData[]) => void;
  onSelectTask: (task: TaskDetailData) => void;
  onDeleteTask: (id: string, e: React.MouseEvent) => void;
}

export function ListView({
  tasks,
  onTasksChange,
  onSelectTask,
  onDeleteTask,
}: ListViewProps) {
  const currentRole = useAppSelector((state) => state.auth.currentRole);
  const editable = canEditTask(currentRole);
  const deletable = canDeleteTask(currentRole);

  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [groupBy, setGroupBy] = React.useState<GroupByType>('status');
  const [sortBy, setSortBy] = React.useState<'title' | 'priority' | 'due_date' | 'status'>('title');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  const [filterSearch, setFilterSearch] = React.useState('');

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTasks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTasks.map((t) => t.id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkStatusChange = (newStatus: TaskStatus) => {
    if (!editable) return;
    onTasksChange(
      tasks.map((t) =>
        selectedIds.includes(t.id)
          ? { ...t, status: newStatus, is_completed: newStatus === 'done' }
          : t
      )
    );
    toast.success(`Updated ${selectedIds.length} tasks to ${newStatus.replace('_', ' ')}`);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (!deletable) return;
    const count = selectedIds.length;
    const remainingTasks = tasks.filter((t) => !selectedIds.includes(t.id));
    onTasksChange(remainingTasks);
    toast(`Deleted ${count} tasks`);
    setSelectedIds([]);
  };

  // Filter and sort
  const filteredTasks = tasks
    .filter((t) =>
      t.title.toLowerCase().includes(filterSearch.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(filterSearch.toLowerCase()))
    )
    .sort((a, b) => {
      let comp = 0;
      if (sortBy === 'title') comp = a.title.localeCompare(b.title);
      if (sortBy === 'status') comp = a.status.localeCompare(b.status);
      if (sortBy === 'priority') {
        const order = { urgent: 4, high: 3, medium: 2, low: 1, none: 0 };
        comp = (order[a.priority] || 0) - (order[b.priority] || 0);
      }
      if (sortBy === 'due_date') {
        comp = (a.due_date || '').localeCompare(b.due_date || '');
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

  // Grouping
  const groupedTasks: { [groupKey: string]: TaskDetailData[] } = {};
  if (groupBy === 'none') {
    groupedTasks['All Tasks'] = filteredTasks;
  } else {
    filteredTasks.forEach((task) => {
      let key = 'Other';
      if (groupBy === 'status') key = task.status.replace('_', ' ').toUpperCase();
      if (groupBy === 'priority') key = task.priority.toUpperCase();
      if (groupBy === 'assignee') key = task.assignee?.name || 'Unassigned';

      if (!groupedTasks[key]) groupedTasks[key] = [];
      groupedTasks[key].push(task);
    });
  }

  const getPriorityBadge = (prio: TaskPriority) => {
    switch (prio) {
      case 'urgent':
        return <Badge variant="destructive" className="text-[10px] uppercase">Urgent</Badge>;
      case 'high':
        return <Badge variant="warning" className="text-[10px] uppercase">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-[10px] uppercase">Medium</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] uppercase">Low</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar: Group-by, Search, Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/60 p-3 rounded-xl border border-border">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter tasks in table..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Layers className="h-3.5 w-3.5" />
            <span>Group by:</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupByType)}
              className="h-7 rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground"
            >
              <option value="none">None</option>
              <option value="status">Status</option>
              <option value="priority">Priority</option>
              <option value="assignee">Assignee</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-7 rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground"
            >
              <option value="title">Title</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
              <option value="due_date">Due Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Floating Bulk Action Bar when items selected */}
      {selectedIds.length > 0 && (
        <div className="sticky top-16 z-20 flex items-center justify-between gap-4 rounded-xl border border-primary/50 bg-card p-3 shadow-xl animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs">
              {selectedIds.length} Selected
            </Badge>
            <span className="text-xs text-muted-foreground">Bulk operations:</span>
          </div>

          <div className="flex items-center gap-2">
            {editable && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatusChange('todo')}
                  className="h-7 text-xs"
                >
                  Mark To Do
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatusChange('in_progress')}
                  className="h-7 text-xs"
                >
                  Mark In Progress
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatusChange('done')}
                  className="h-7 text-xs"
                >
                  Mark Done
                </Button>
              </>
            )}

            {deletable && (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
                className="h-7 text-xs flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                <span>Delete</span>
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds([])}
              className="h-7 text-xs text-muted-foreground"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Tasks Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-muted-foreground select-none">
              <th className="w-10 p-3 text-center">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  {selectedIds.length === filteredTasks.length && filteredTasks.length > 0 ? (
                    <CheckSquare className="h-4 w-4 text-primary" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="p-3 font-semibold text-foreground">Task Title</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Priority</th>
              <th className="p-3 font-semibold">Due Date</th>
              <th className="p-3 font-semibold">Assignee</th>
              <th className="w-12 p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(groupedTasks).map(([groupTitle, groupItems]) => (
              <React.Fragment key={groupTitle}>
                {groupBy !== 'none' && (
                  <tr className="border-b border-border bg-muted/20">
                    <td colSpan={7} className="p-2.5 px-4 font-bold text-[11px] text-primary tracking-wider uppercase">
                      {groupTitle} ({groupItems.length})
                    </td>
                  </tr>
                )}

                {groupItems.map((task) => {
                  const isSelected = selectedIds.includes(task.id);
                  return (
                    <tr
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className={`border-b border-border/60 transition-colors hover:bg-muted/40 cursor-pointer ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="p-3 text-center" onClick={(e) => toggleSelectOne(task.id, e)}>
                        <button type="button" className="cursor-pointer text-muted-foreground hover:text-primary">
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      <td className="p-3 font-medium text-foreground">
                        <div className="flex flex-col">
                          <span className={task.is_completed ? 'line-through text-muted-foreground' : ''}>
                            {task.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{task.project}</span>
                        </div>
                      </td>

                      <td className="p-3">
                        <Badge
                          variant={task.status === 'done' ? 'success' : 'outline'}
                          className="capitalize text-[10px]"
                        >
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </td>

                      <td className="p-3">{getPriorityBadge(task.priority)}</td>

                      <td className="p-3 text-muted-foreground">
                        {task.due_date ? (
                          <span className="flex items-center gap-1 text-[11px]">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>

                      <td className="p-3">
                        {task.assignee ? (
                          <div className="flex items-center gap-1.5">
                            <Avatar src={task.assignee.avatar} alt={task.assignee.name} size="sm" />
                            <span className="text-foreground">{task.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60">Unassigned</span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        {deletable && (
                          <button
                            type="button"
                            onClick={(e) => onDeleteTask(task.id, e)}
                            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
