'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  CheckCircle2,
  Clock,
  Calendar,
  Tag,
  Paperclip,
  MessageSquare,
  Copy,
  Trash2,
  Plus,
  Send,
  CornerDownRight,
  ShieldAlert,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { TASK_PRIORITIES } from '@/lib/constants';
import { canEditTask, canDeleteTask, canComment, canDeleteComment } from '@/lib/permissions';
import { useAppSelector } from '@/lib/redux/hooks';
import { DEMO_USERS } from '@/lib/auth';
import { TaskPriority, TaskStatus, WorkspaceRole } from '@/types';

export interface TaskDetailData {
  id: string;
  title: string;
  description: string | null;
  project: string;
  priority: TaskPriority;
  status: TaskStatus;
  is_completed: boolean;
  due_date?: string | null;
  assignee?: { id: string; name: string; avatar?: string } | null;
  subtasks?: { id: string; title: string; is_completed: boolean }[];
  comments?: { id: string; user_id: string; user_name: string; avatar?: string; content: string; created_at: string }[];
  attachments?: { id: string; name: string; size: string }[];
  workspace_id?: string;
  project_id?: string;
}

interface TaskDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskDetailData | null;
  onUpdateTask: (updated: Partial<TaskDetailData>) => void;
  onDeleteTask: (id: string) => void;
  onDuplicateTask: (task: TaskDetailData) => void;
}

export function TaskDetailModal({
  open,
  onOpenChange,
  task,
  onUpdateTask,
  onDeleteTask,
  onDuplicateTask,
}: TaskDetailModalProps) {
  const currentRole = useAppSelector((state) => state.auth.currentRole);
  const currentUser = useAppSelector((state) => state.auth.user);

  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState('');
  const [commentText, setCommentText] = React.useState('');
  const [showMentionMenu, setShowMentionMenu] = React.useState(false);
  const [mentionFilter, setMentionFilter] = React.useState('');

  if (!task) return null;

  const editable = canEditTask(currentRole);
  const deletable = canDeleteTask(currentRole);
  const commentable = canComment(currentRole);

  const subtasks = task.subtasks || [];
  const comments = task.comments || [];
  const attachments = task.attachments || [];

  const handleToggleSubtask = (subtaskId: string) => {
    if (!editable) {
      toast.error('Permission Denied', { description: 'Viewers have read-only access.' });
      return;
    }
    const updatedSubtasks = subtasks.map((st) =>
      st.id === subtaskId ? { ...st, is_completed: !st.is_completed } : st
    );
    onUpdateTask({ subtasks: updatedSubtasks });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !editable) return;

    const newSubtask = {
      id: `subtask-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      is_completed: false,
    };
    onUpdateTask({ subtasks: [...subtasks, newSubtask] });
    setNewSubtaskTitle('');
    toast.success('Subtask added');
  };

  const handleConvertSubtaskToTask = (subtaskId: string) => {
    if (!editable) return;
    const st = subtasks.find((s) => s.id === subtaskId);
    if (!st) return;

    // Remove from subtasks
    onUpdateTask({ subtasks: subtasks.filter((s) => s.id !== subtaskId) });
    // Duplicate as full task
    onDuplicateTask({
      id: `task-${Date.now()}`,
      title: st.title,
      description: `Converted from subtask of "${task.title}"`,
      project: task.project,
      priority: 'medium',
      status: 'todo',
      is_completed: st.is_completed,
    });
    toast.success(`Converted subtask "${st.title}" to full task!`);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCommentText(val);

    const cursor = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursor);
    const lastAt = textBeforeCursor.lastIndexOf('@');

    if (lastAt !== -1 && cursor - lastAt <= 15 && !textBeforeCursor.slice(lastAt).includes(' ')) {
      setShowMentionMenu(true);
      setMentionFilter(textBeforeCursor.slice(lastAt + 1).toLowerCase());
    } else {
      setShowMentionMenu(false);
    }
  };

  const insertMention = (userName: string) => {
    const cursor = commentText.lastIndexOf('@');
    if (cursor !== -1) {
      const newText = `${commentText.slice(0, cursor)}@${userName} `;
      setCommentText(newText);
    }
    setShowMentionMenu(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !commentable) return;

    const newComment = {
      id: `comment-${Date.now()}`,
      user_id: currentUser?.id || 'demo-user',
      user_name: currentUser?.full_name || 'Team Member',
      avatar: currentUser?.avatar_url || undefined,
      content: commentText.trim(),
      created_at: new Date().toISOString(),
    };

    onUpdateTask({ comments: [...comments, newComment] });
    setCommentText('');
    toast.success('Comment posted');
  };

  const handleDeleteComment = (commentId: string, authorId: string) => {
    if (!canDeleteComment(currentRole, currentUser?.id, authorId)) {
      toast.error('Permission Denied', { description: 'You can only delete your own comments.' });
      return;
    }
    onUpdateTask({ comments: comments.filter((c) => c.id !== commentId) });
    toast.success('Comment deleted');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editable) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const newAttachment = {
      id: `att-${Date.now()}`,
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
    };

    onUpdateTask({ attachments: [...attachments, newAttachment] });
    toast.success(`Attached "${file.name}"`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header with Title and Action Buttons */}
        <DialogHeader className="border-b border-border pb-4 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1 pr-6">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-mono">
                  {task.project}
                </Badge>
                {!editable && (
                  <Badge variant="destructive" className="flex items-center gap-1 text-[10px]">
                    <ShieldAlert className="h-3 w-3" /> Viewer (Read-Only)
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-xl font-bold mt-1">
                {task.title}
              </DialogTitle>
            </div>

            <div className="flex items-center gap-1 shrink-0 pt-1 mr-6">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => {
                  onDuplicateTask(task);
                  toast.success(`Duplicated task "${task.title}"`);
                }}
                title="Duplicate task"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              {deletable && (
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => {
                    onDeleteTask(task.id);
                    onOpenChange(false);
                  }}
                  title="Delete task"
                  className="hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Column: Description, Subtasks, Comments */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Description
              </span>
              <p className="text-sm text-foreground bg-muted/20 p-3 rounded-lg border border-border/60 leading-relaxed">
                {task.description || <span className="italic text-muted-foreground">No description provided.</span>}
              </p>
            </div>

            {/* Nested Subtasks (Checklist) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Checklist ({subtasks.filter((s) => s.is_completed).length}/{subtasks.length})
                </span>
              </div>

              <div className="space-y-1.5">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/40 group border border-transparent hover:border-border transition-colors"
                  >
                    <div className="flex items-center gap-2.5 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleSubtask(st.id)}
                        className={`h-4 w-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                          st.is_completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-input hover:border-primary'
                        }`}
                      >
                        {st.is_completed && <CheckCircle2 className="h-3 w-3" />}
                      </button>
                      <span
                        className={`text-xs ${
                          st.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'
                        }`}
                      >
                        {st.title}
                      </span>
                    </div>

                    {editable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleConvertSubtaskToTask(st.id)}
                        className="h-6 text-[10px] px-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                        title="Convert to standalone task"
                      >
                        <CornerDownRight className="h-3 w-3 mr-1" />
                        Convert to task
                      </Button>
                    )}
                  </div>
                ))}

                {/* Add Subtask Form */}
                {editable && (
                  <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add an item to the checklist..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className="flex-1 h-8 rounded-md border border-input bg-transparent px-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <Button type="submit" size="sm" variant="secondary" className="h-8 px-2.5 text-xs">
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                  </form>
                )}
              </div>
            </div>

            {/* Comments & Discussion */}
            <div className="space-y-3 pt-4 border-t border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> Comments ({comments.length})
              </span>

              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No comments yet. Type below to start discussion.</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-2.5 bg-muted/20 p-2.5 rounded-lg border border-border/40 group">
                      <Avatar src={c.avatar} alt={c.user_name} size="sm" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{c.user_name}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {canDeleteComment(currentRole, currentUser?.id, c.user_id) && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(c.id, c.user_id)}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-0.5"
                                title="Delete comment"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{c.content}</p>
                      </div>
                    </div>
                  ))
                )}

                {/* Comment Input with @mention autocomplete */}
                {commentable && (
                  <div className="relative pt-2">
                    <div className="flex items-end gap-2">
                      <textarea
                        rows={2}
                        placeholder="Write a comment... Type @ to mention a team member"
                        value={commentText}
                        onChange={handleCommentChange}
                        className="flex-1 rounded-md border border-input bg-transparent p-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddComment}
                        disabled={!commentText.trim()}
                        className="h-8 px-3 text-xs flex items-center gap-1"
                      >
                        <Send className="h-3 w-3" /> Post
                      </Button>
                    </div>

                    {/* @mention autocomplete overlay */}
                    {showMentionMenu && (
                      <div className="absolute left-0 bottom-full mb-1 w-56 rounded-lg border border-border bg-card p-1 shadow-lg z-20">
                        <span className="text-[10px] font-semibold text-muted-foreground px-2 py-1 block border-b border-border">
                          Mention Member
                        </span>
                        {DEMO_USERS.filter((u) => (u.full_name || u.email).toLowerCase().includes(mentionFilter)).map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => insertMention(u.full_name || u.email)}
                            className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-left hover:bg-muted rounded-md cursor-pointer"
                          >
                            <Avatar src={u.avatar_url || undefined} alt={u.full_name || undefined} size="sm" />
                            <span>{u.full_name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Column: Status, Priority, Due Date, Assignee, Attachments */}
          <div className="space-y-5 bg-muted/10 p-4 rounded-xl border border-border">
            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Status</label>
              <select
                value={task.status}
                disabled={!editable}
                onChange={(e) => onUpdateTask({ status: e.target.value as TaskStatus })}
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Priority</label>
              <select
                value={task.priority}
                disabled={!editable}
                onChange={(e) => onUpdateTask({ priority: e.target.value as TaskPriority })}
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Due Date
              </label>
              <input
                type="date"
                disabled={!editable}
                value={task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ''}
                onChange={(e) => onUpdateTask({ due_date: e.target.value || null })}
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Assignee */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Assignee</label>
              <select
                disabled={!editable}
                value={task.assignee?.id || ''}
                onChange={(e) => {
                  const member = DEMO_USERS.find((u) => u.id === e.target.value);
                  onUpdateTask({
                    assignee: member ? { id: member.id, name: member.full_name || member.email, avatar: member.avatar_url || undefined } : null,
                  });
                }}
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Unassigned</option>
                {DEMO_USERS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Attachments Section */}
            <div className="space-y-2 pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Paperclip className="h-3 w-3" /> Attachments ({attachments.length})
                </span>
                {editable && (
                  <label className="text-[11px] text-primary hover:underline cursor-pointer">
                    Upload
                    <input type="file" onChange={handleFileUpload} className="hidden" />
                  </label>
                )}
              </div>

              <div className="space-y-1">
                {attachments.length === 0 ? (
                  <span className="text-[11px] text-muted-foreground italic">No files attached</span>
                ) : (
                  attachments.map((att) => (
                    <div key={att.id} className="flex items-center justify-between text-xs bg-muted/40 p-1.5 rounded border border-border">
                      <span className="truncate max-w-[130px]" title={att.name}>{att.name}</span>
                      <span className="text-[10px] text-muted-foreground">{att.size}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
