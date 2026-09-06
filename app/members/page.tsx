'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  Mail,
  Calendar,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { DEMO_USERS, DemoUser } from '@/lib/auth';
import { WORKSPACE_ROLES } from '@/lib/constants';
import { canManageMembers, canChangeMemberRole } from '@/lib/permissions';
import { useAppSelector } from '@/lib/redux/hooks';
import { WorkspaceRole } from '@/types';

export default function MembersPage() {
  const currentRole = useAppSelector((state) => state.auth.currentRole);
  const currentUser = useAppSelector((state) => state.auth.user);

  const [members, setMembers] = React.useState<DemoUser[]>(DEMO_USERS);
  const [search, setSearch] = React.useState('');
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState<WorkspaceRole>('member');

  const canManage = canManageMembers(currentRole);

  const handleRoleChange = (userId: string, newRole: WorkspaceRole) => {
    if (!canManage) {
      toast.error('Permission Denied', { description: 'Only Owners and Admins can manage roles.' });
      return;
    }

    setMembers((prev) =>
      prev.map((m) => (m.id === userId ? { ...m, role: newRole } : m))
    );

    const targetUser = members.find((m) => m.id === userId);
    toast.success(`Updated role for ${targetUser?.full_name || 'member'} to ${newRole.toUpperCase()}`);
  };

  const handleRemoveMember = (userId: string) => {
    if (!canManage) return;
    const targetUser = members.find((m) => m.id === userId);
    if (targetUser?.role === 'owner') {
      toast.error('Cannot remove workspace owner');
      return;
    }

    setMembers((prev) => prev.filter((m) => m.id !== userId));
    toast.success(`Removed ${targetUser?.full_name || 'member'} from workspace`);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !canManage) return;

    const newMember: DemoUser = {
      id: `user-${Date.now()}`,
      email: inviteEmail.trim(),
      full_name: inviteEmail.split('@')[0],
      avatar_url: null,
      role: inviteRole,
      theme: 'system',
    };

    setMembers((prev) => [...prev, newMember]);
    toast.success(`Invitation sent to ${inviteEmail}`, {
      description: `Added with role: ${inviteRole.toUpperCase()}`,
    });

    setInviteEmail('');
    setInviteRole('member');
    setIsInviteOpen(false);
  };

  const filteredMembers = members.filter(
    (m) =>
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.full_name && m.full_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppShell workspaceName="Acme Engineering">
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <span>Workspace Members</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Manage team access, assign roles, and invite collaborative team members.
            </p>
          </div>

          {canManage && (
            <Button
              onClick={() => setIsInviteOpen(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Invite Member</span>
            </Button>
          )}
        </div>

        {/* Search & Member count bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search members by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <Badge variant="outline" className="text-xs">
            {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
          </Badge>
        </div>

        {/* Member Directory Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                <th className="p-3 font-semibold text-foreground">User</th>
                <th className="p-3 font-semibold">Email</th>
                <th className="p-3 font-semibold">Role</th>
                <th className="w-20 p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {filteredMembers.map((member) => {
                const isSelf = member.id === currentUser?.id;
                return (
                  <tr key={member.id} className="transition-colors hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          src={member.avatar_url}
                          alt={member.full_name || member.email}
                          fallback={member.full_name?.slice(0, 2).toUpperCase()}
                          size="md"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">
                            {member.full_name || 'Member'} {isSelf && <span className="text-[10px] text-primary font-normal">(You)</span>}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Joined recently
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 text-muted-foreground font-mono text-[11px]">
                      {member.email}
                    </td>

                    <td className="p-3">
                      {canManage && member.role !== 'owner' ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as WorkspaceRole)}
                          className="h-7 rounded-md border border-input bg-background px-2 text-xs font-semibold capitalize focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          {WORKSPACE_ROLES.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Badge
                          variant={member.role === 'owner' ? 'default' : member.role === 'admin' ? 'warning' : 'secondary'}
                          className="uppercase text-[10px]"
                        >
                          {member.role}
                        </Badge>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      {canManage && member.role !== 'owner' && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors cursor-pointer"
                          title="Remove member"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent onClose={() => setIsInviteOpen(false)} className="max-w-md">
          <form onSubmit={handleInvite}>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join Acme Engineering workspace.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email Address</label>
                <Input
                  type="email"
                  placeholder="collaborator@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                  className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="admin">Admin (Can manage projects, members, and tasks)</option>
                  <option value="member">Member (Can create & edit tasks and comments)</option>
                  <option value="viewer">Viewer (Read-only access)</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
