'use client';

import * as React from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  CheckCircle2,
  Clock,
  MessageSquare,
  Paperclip,
  Trash2,
  Copy,
  MoreHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { TaskDetailData } from '@/features/tasks/TaskDetailModal';
import { KanbanColumn, TaskPriority, TaskStatus } from '@/types';
import { canEditTask, canDeleteTask } from '@/lib/permissions';
import { useAppSelector } from '@/lib/redux/hooks';

// Sortable Task Card Component
function SortableTaskCard({
  task,
  onSelectTask,
  onDeleteTask,
}: {
  task: TaskDetailData;
  onSelectTask: (t: TaskDetailData) => void;
  onDeleteTask: (id: string, e: React.MouseEvent) => void;
}) {
  const currentRole = useAppSelector((state) => state.auth.currentRole);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const getPriorityBadge = (prio: TaskPriority) => {
    switch (prio) {
      case 'urgent':
        return <Badge variant="destructive" className="text-[9px] px-1.5 py-0 uppercase">Urgent</Badge>;
      case 'high':
        return <Badge variant="warning" className="text-[9px] px-1.5 py-0 uppercase">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-[9px] px-1.5 py-0 uppercase">Medium</Badge>;
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelectTask(task)}
      className="group relative flex flex-col gap-2.5 rounded-xl border border-border/80 bg-card p-3.5 shadow-xs transition-all hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 cursor-grab active:cursor-grabbing select-none"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-xs text-foreground leading-snug">
          {task.title}
        </span>
        {canDeleteTask(currentRole) && (
          <button
            type="button"
            onClick={(e) => onDeleteTask(task.id, e)}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-0.5 rounded transition-opacity cursor-pointer"
            title="Delete task"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {task.description && (
        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Task Meta Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-2">
          {getPriorityBadge(task.priority)}

          {task.subtasks && task.subtasks.length > 0 && (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              {task.subtasks.filter((s) => s.is_completed).length}/{task.subtasks.length}
            </span>
          )}

          {task.comments && task.comments.length > 0 && (
            <span className="flex items-center gap-0.5">
              <MessageSquare className="h-3 w-3" />
              {task.comments.length}
            </span>
          )}

          {task.attachments && task.attachments.length > 0 && (
            <span className="flex items-center gap-0.5">
              <Paperclip className="h-3 w-3" />
              {task.attachments.length}
            </span>
          )}
        </div>

        {task.assignee && (
          <Avatar
            src={task.assignee.avatar}
            alt={task.assignee.name}
            fallback={task.assignee.name.slice(0, 2).toUpperCase()}
            size="sm"
          />
        )}
      </div>
    </div>
  );
}

// Kanban Column Component
function KanbanColumnContainer({
  column,
  tasks,
  onSelectTask,
  onDeleteTask,
  onQuickAddTask,
}: {
  column: KanbanColumn;
  tasks: TaskDetailData[];
  onSelectTask: (t: TaskDetailData) => void;
  onDeleteTask: (id: string, e: React.MouseEvent) => void;
  onQuickAddTask: (columnId: string) => void;
}) {
  const currentRole = useAppSelector((state) => state.auth.currentRole);
  const taskIds = React.useMemo(() => tasks.map((t) => t.id), [tasks]);

  return (
    <div className="flex flex-col flex-1 min-w-[280px] max-w-[340px] rounded-2xl border border-border/80 bg-card/40 p-3 shadow-xs backdrop-blur-xs">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: column.color || '#3b82f6' }}
          />
          <h3 className="font-semibold text-xs tracking-wide text-foreground uppercase">
            {column.name}
          </h3>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
            {tasks.length}
          </span>
        </div>

        {canEditTask(currentRole) && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onQuickAddTask(column.id)}
            title={`Add task to ${column.name}`}
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Task Cards Sortable Area */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2.5 overflow-y-auto min-h-[150px] p-0.5">
          {tasks.length === 0 ? (
            <div className="flex h-28 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 p-4 text-center">
              <span className="text-[11px] text-muted-foreground/80">No tasks in this stage</span>
              {canEditTask(currentRole) && (
                <button
                  type="button"
                  onClick={() => onQuickAddTask(column.id)}
                  className="mt-1.5 text-[11px] font-medium text-primary hover:underline cursor-pointer"
                >
                  + Add task
                </button>
              )}
            </div>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onSelectTask={onSelectTask}
                onDeleteTask={onDeleteTask}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// Full Interactive Kanban Board
interface KanbanBoardProps {
  columns: KanbanColumn[];
  tasks: TaskDetailData[];
  onTasksChange: (tasks: TaskDetailData[]) => void;
  onSelectTask: (task: TaskDetailData) => void;
  onDeleteTask: (id: string, e: React.MouseEvent) => void;
  onOpenCreateTask: (defaultStatus?: string) => void;
  onAddColumn?: () => void;
}

export function KanbanBoard({
  columns,
  tasks,
  onTasksChange,
  onSelectTask,
  onDeleteTask,
  onOpenCreateTask,
  onAddColumn,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = React.useState<TaskDetailData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required to trigger drag, allowing clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Determine target column
    const overColumn = columns.find((c) => c.id === overId || c.name.toLowerCase() === overId);
    const overTask = tasks.find((t) => t.id === overId);

    const targetStatus = overColumn
      ? (overColumn.name.toLowerCase().replace(' ', '_') as TaskStatus)
      : overTask
      ? overTask.status
      : null;

    if (!targetStatus) return;

    const activeTaskItem = tasks.find((t) => t.id === activeId);
    if (activeTaskItem && activeTaskItem.status !== targetStatus) {
      onTasksChange(
        tasks.map((t) =>
          t.id === activeId
            ? {
                ...t,
                status: targetStatus,
                is_completed: targetStatus === 'done',
              }
            : t
        )
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const currentTask = tasks.find((t) => t.id === activeId);
    if (!currentTask) return;

    // Check if dropped directly onto a column container
    const targetColumn = columns.find(
      (c) => c.id === overId || c.name.toLowerCase() === overId.toLowerCase()
    );

    if (targetColumn) {
      const targetStatus = targetColumn.name.toLowerCase().replace(' ', '_') as TaskStatus;
      if (currentTask.status !== targetStatus) {
        onTasksChange(
          tasks.map((t) =>
            t.id === activeId
              ? {
                  ...t,
                  status: targetStatus,
                  is_completed: targetColumn.is_default_done,
                }
              : t
          )
        );
        toast.success(`Moved "${currentTask.title}" to ${targetColumn.name}`);
      }
      return;
    }

    // Reorder within tasks list
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask && overTask.status !== currentTask.status) {
      onTasksChange(
        tasks.map((t) =>
          t.id === activeId
            ? {
                ...t,
                status: overTask.status,
                is_completed: overTask.is_completed,
              }
            : t
        )
      );
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 items-start min-h-[calc(100vh-210px)]">
        {columns.map((column) => {
          // Normalize column matching
          const colStatus = column.name.toLowerCase().replace(' ', '_');
          const columnTasks = tasks.filter(
            (t) =>
              t.status.toLowerCase().replace(' ', '_') === colStatus ||
              (colStatus === 'to_do' && t.status === 'todo') ||
              (colStatus === 'todo' && t.status === 'to_do')
          );

          return (
            <KanbanColumnContainer
              key={column.id}
              column={column}
              tasks={columnTasks}
              onSelectTask={onSelectTask}
              onDeleteTask={onDeleteTask}
              onQuickAddTask={() => onOpenCreateTask(colStatus)}
            />
          );
        })}

        {/* Add Column Button */}
        {onAddColumn && (
          <button
            type="button"
            onClick={onAddColumn}
            className="flex h-12 min-w-[200px] items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 bg-card/40 text-xs font-semibold text-muted-foreground hover:border-primary hover:bg-card hover:text-foreground transition-all cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Stage Column</span>
          </button>
        )}
      </div>

      {/* Drag Overlay for smooth drag feedback */}
      <DragOverlay>
        {activeTask && (
          <div className="rotate-2 scale-105 rounded-xl border border-primary bg-card p-3.5 shadow-2xl">
            <span className="font-semibold text-xs text-foreground">
              {activeTask.title}
            </span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
