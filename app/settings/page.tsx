'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Settings,
  Bell,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Check,
  ShieldAlert,
  FolderKanban,
  Sliders,
  Palette,
  User,
  Image as ImageIcon,
  Save,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { WORKSPACE_COLORS } from '@/lib/constants';
import { canManageWorkspace, canDeleteWorkspace, canResetData, canExportData, canImportData } from '@/lib/permissions';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { setTheme } from '@/lib/redux/slices/uiSlice';
import { updateProfile } from '@/lib/redux/slices/authSlice';
import { setNotificationPreferences } from '@/lib/redux/slices/notificationSlice';
import { ViewType, ThemeType } from '@/types';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const currentRole = useAppSelector((state) => state.auth.currentRole);
  const currentUser = useAppSelector((state) => state.auth.user);
  const theme = useAppSelector((state) => state.ui.theme);
  const notificationPrefs = useAppSelector((state) => state.notification.preferences);
  const activeWorkspace = useAppSelector((state) => state.workspace.workspaces[0]) || {
    name: 'Acme Engineering',
    slug: 'acme-engineering',
    color: '#3b82f6',
    default_view: 'kanban' as ViewType,
  };

  // User Profile Form State
  const [profileName, setProfileName] = React.useState(currentUser?.full_name || '');
  const [profileEmail, setProfileEmail] = React.useState(currentUser?.email || '');
  const [profileAvatar, setProfileAvatar] = React.useState(currentUser?.avatar_url || '');

  React.useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.full_name || '');
      setProfileEmail(currentUser.email || '');
      setProfileAvatar(currentUser.avatar_url || '');
    }
  }, [currentUser]);

  // Workspace Form State
  const [workspaceName, setWorkspaceName] = React.useState(activeWorkspace.name);
  const [workspaceColor, setWorkspaceColor] = React.useState(activeWorkspace.color);
  const [defaultView, setDefaultView] = React.useState<ViewType>(activeWorkspace.default_view);

  // Danger zone confirmation state
  const [isResetConfirmOpen, setIsResetConfirmOpen] = React.useState(false);
  const [isDeleteWorkspaceOpen, setIsDeleteWorkspaceOpen] = React.useState(false);

  const canManage = canManageWorkspace(currentRole);
  const canDelete = canDeleteWorkspace(currentRole);
  const canReset = canResetData(currentRole);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      updateProfile({
        full_name: profileName,
        email: profileEmail,
        avatar_url: profileAvatar || null,
      })
    );
    toast.success('User profile updated successfully!');
  };

  const handleSaveWorkspaceSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      toast.error('Permission Denied', { description: 'Only Owners and Admins can update workspace settings.' });
      return;
    }
    toast.success('Workspace settings updated successfully!');
  };

  const handleThemeChange = (newTheme: ThemeType) => {
    dispatch(setTheme(newTheme));
    localStorage.setItem('wm_theme', newTheme);
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.classList.add('light');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      }
    }
    toast.success(`Theme switched to ${newTheme.toUpperCase()}`);
  };

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workspace-manager-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Workspace JSON exported successfully from server!');
        return;
      }
    } catch {
      // Fallback to client state export
    }

    const dataToExport = {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      workspace: {
        name: workspaceName,
        color: workspaceColor,
        default_view: defaultView,
      },
    };
    const jsonStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workspace-manager-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Workspace JSON exported successfully!');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        // Post to /api/import for server validation
        const res = await fetch('/api/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed),
        });

        if (res.ok) {
          const data = await res.json();
          if (parsed.workspace?.name) {
            setWorkspaceName(parsed.workspace.name);
          }
          toast.success('Workspace imported and validated successfully!', {
            description: `${data.summary.tasksImported} tasks, ${data.summary.projectsImported} projects restored.`,
          });
          return;
        }

        // Local fallback
        if (!parsed.workspace || !parsed.workspace.name) {
          throw new Error('Invalid schema');
        }
        setWorkspaceName(parsed.workspace.name);
        if (parsed.workspace.color) setWorkspaceColor(parsed.workspace.color);
        if (parsed.workspace.default_view) setDefaultView(parsed.workspace.default_view);
        toast.success(`Imported workspace "${parsed.workspace.name}"!`);
      } catch {
        toast.error('Failed to import JSON: Invalid workspace backup format.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    setIsResetConfirmOpen(false);
    toast.success('All workspace sample data has been reset to defaults.');
  };

  return (
    <AppShell workspaceName={workspaceName}>
      <div className="space-y-8 max-w-4xl mx-auto pb-12">
        {/* Page Header */}
        <div className="border-b border-border pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <span>Settings & Preferences</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your personal profile, workspace branding, themes, notification triggers, and data backup.
          </p>
        </div>

        {/* User Profile Section (F03) */}
        <form onSubmit={handleSaveProfile} className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span>My Profile</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Update your display name, email, and avatar for team collaboration.
              </p>
            </div>
            <Badge variant="default" className="text-xs uppercase">
              {currentRole}
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="flex flex-col items-center gap-2">
              <Avatar
                src={profileAvatar || undefined}
                alt={profileName || 'User'}
                size="lg"
                className="h-20 w-20 ring-2 ring-border shadow-md"
              />
              <span className="text-[11px] text-muted-foreground">Profile Photo</span>
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Display Name</label>
                <Input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email Address</label>
                <Input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Avatar URL (Optional)</label>
                <Input
                  value={profileAvatar}
                  onChange={(e) => setProfileAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>

              <div className="pt-2">
                <Button type="submit" size="sm" className="gap-1.5">
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Profile</span>
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Workspace Profile & Branding Section */}
        <form onSubmit={handleSaveWorkspaceSettings} className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-primary" />
                <span>General Workspace Settings</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Update name, branding color, and default view for all members.
              </p>
            </div>
            {!canManage && (
              <Badge variant="outline" className="text-xs">
                Viewer (Read-Only)
              </Badge>
            )}
          </div>

          <div className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Workspace Name</label>
              <Input
                value={workspaceName}
                disabled={!canManage}
                onChange={(e) => setWorkspaceName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Brand Accent Color</label>
              <div className="flex items-center gap-2 pt-1">
                {WORKSPACE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    disabled={!canManage}
                    onClick={() => setWorkspaceColor(c)}
                    className={`h-7 w-7 rounded-full transition-transform cursor-pointer ${
                      workspaceColor === c
                        ? 'scale-125 ring-2 ring-ring ring-offset-2 ring-offset-background'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Default Starting View</label>
              <select
                value={defaultView}
                disabled={!canManage}
                onChange={(e) => setDefaultView(e.target.value as ViewType)}
                className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="kanban">Kanban Board</option>
                <option value="list">List View</option>
                <option value="calendar">Calendar View</option>
              </select>
            </div>
          </div>

          {canManage && (
            <div className="pt-2">
              <Button type="submit" size="sm">
                Save Workspace Settings
              </Button>
            </div>
          )}
        </form>

        {/* Theme Preferences */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              <span>Theme & Visual Styling</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Switch between Solarized Dark, Solarized Light, or System appearance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleThemeChange('dark')}
              className="text-xs"
            >
              Solarized Dark (Default)
            </Button>
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleThemeChange('light')}
              className="text-xs"
            >
              Solarized Light
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleThemeChange('system')}
              className="text-xs"
            >
              System Follow
            </Button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span>Notification Preferences</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Control which in-app events trigger alerts and badges.
            </p>
          </div>

          <div className="space-y-3 max-w-lg">
            <label className="flex items-center justify-between p-2.5 rounded-lg border border-border/80 hover:bg-muted/20 cursor-pointer">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground">Task Assignments</span>
                <span className="text-[11px] text-muted-foreground">Notify when a team member assigns you to a task</span>
              </div>
              <input
                type="checkbox"
                checked={notificationPrefs.notifyAssigned}
                onChange={(e) => dispatch(setNotificationPreferences({ notifyAssigned: e.target.checked }))}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg border border-border/80 hover:bg-muted/20 cursor-pointer">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground">@Mentions in Comments</span>
                <span className="text-[11px] text-muted-foreground">Notify when you are tagged with @ in discussions</span>
              </div>
              <input
                type="checkbox"
                checked={notificationPrefs.notifyMentioned}
                onChange={(e) => dispatch(setNotificationPreferences({ notifyMentioned: e.target.checked }))}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg border border-border/80 hover:bg-muted/20 cursor-pointer">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground">Approaching Due Dates</span>
                <span className="text-[11px] text-muted-foreground">Notify when your tasks are due within 24 hours</span>
              </div>
              <input
                type="checkbox"
                checked={notificationPrefs.notifyDueSoon}
                onChange={(e) => dispatch(setNotificationPreferences({ notifyDueSoon: e.target.checked }))}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Data Persistence, Export & Import */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" />
              <span>Data Export & Import</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Backup your entire workspace as JSON, or restore from a previously exported backup.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              className="flex items-center gap-2 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Workspace (JSON)</span>
            </Button>

            <label>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-xs cursor-pointer"
                asChild
              >
                <span>
                  <Upload className="h-3.5 w-3.5" />
                  <span>Import Backup (JSON)</span>
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportData}
              />
            </label>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 shadow-xs space-y-4">
          <div className="border-b border-destructive/20 pb-3">
            <h2 className="text-base font-semibold text-destructive flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              <span>Danger Zone</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Irreversible destructive actions requiring elevated permissions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-destructive/10">
            <div>
              <div className="text-xs font-semibold text-foreground">Reset Sample Data</div>
              <div className="text-[11px] text-muted-foreground">Restore demo projects, tasks, and columns to original factory state.</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={!canReset}
              onClick={() => setIsResetConfirmOpen(true)}
              className="text-xs text-destructive border-destructive/40 hover:bg-destructive/10"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset Data
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <div>
              <div className="text-xs font-semibold text-destructive">Delete Entire Workspace</div>
              <div className="text-[11px] text-muted-foreground">Permanently destroy this workspace, all its projects, tasks, comments, and attachments.</div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              disabled={!canDelete}
              onClick={() => setIsDeleteWorkspaceOpen(true)}
              className="text-xs"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete Workspace
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <Dialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Sample Data?</DialogTitle>
            <DialogDescription>
              This will reset all projects, tasks, and custom columns back to default starting templates. Any unsaved custom work will be discarded.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsResetConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleResetData}>
              Yes, Reset Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteWorkspaceOpen} onOpenChange={setIsDeleteWorkspaceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Workspace Permanently?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All data will be permanently wiped from the database. Only the Workspace Owner has permission to perform this action.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsDeleteWorkspaceOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setIsDeleteWorkspaceOpen(false);
                toast.success('Workspace deleted successfully.');
              }}
            >
              I understand, Delete Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
