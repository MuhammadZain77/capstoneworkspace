import { WorkspaceRole } from '@/types';

export interface PermissionsContext {
  role?: WorkspaceRole | null;
  userId?: string | null;
  resourceOwnerId?: string | null;
}

export function canViewWorkspace(role?: WorkspaceRole | null): boolean {
  return !!role;
}

export function canManageWorkspace(role?: WorkspaceRole | null): boolean {
  return role === 'owner' || role === 'admin';
}

export function canDeleteWorkspace(role?: WorkspaceRole | null): boolean {
  return role === 'owner';
}

export function canManageMembers(role?: WorkspaceRole | null): boolean {
  return role === 'owner' || role === 'admin';
}

export function canChangeMemberRole(currentRole?: WorkspaceRole | null, targetRole?: WorkspaceRole | null): boolean {
  if (currentRole === 'owner') return true;
  if (currentRole === 'admin') {
    // Admin cannot elevate to owner or demote an owner
    return targetRole !== 'owner';
  }
  return false;
}

export function canCreateProject(role?: WorkspaceRole | null): boolean {
  return role === 'owner' || role === 'admin' || role === 'member';
}

export function canEditProject(role?: WorkspaceRole | null): boolean {
  return role === 'owner' || role === 'admin' || role === 'member';
}

export function canDeleteProject(role?: WorkspaceRole | null): boolean {
  return role === 'owner' || role === 'admin';
}

export function canCreateTask(role?: WorkspaceRole | null): boolean {
  return role === 'owner' || role === 'admin' || role === 'member';
}

export function canEditTask(role?: WorkspaceRole | null): boolean {
  return role === 'owner' || role === 'admin' || role === 'member';
}

export function canDeleteTask(role?: WorkspaceRole | null): boolean {
  return role === 'owner' || role === 'admin' || role === 'member';
}

export function canAssignTask(role?: WorkspaceRole | null): boolean {
  return role === 'owner' || role === 'admin' || role === 'member';
}

export function canComment(role?: WorkspaceRole | null): boolean {
  return role === 'owner' || role === 'admin' || role === 'member';
}

export function canDeleteComment(
  role?: WorkspaceRole | null,
  currentUserId?: string | null,
  commentAuthorId?: string | null
): boolean {
  if (!role || role === 'viewer') return false;
  if (role === 'owner' || role === 'admin') return true;
  return !!currentUserId && currentUserId === commentAuthorId;
}

export function canManageColumns(role?: WorkspaceRole | null): boolean {
  return role === 'owner' || role === 'admin' || role === 'member';
}

export function canExportData(role?: WorkspaceRole | null): boolean {
  return role === 'owner' || role === 'admin' || role === 'member';
}

export function canImportData(role?: WorkspaceRole | null): boolean {
  return role === 'owner' || role === 'admin';
}

export function canResetData(role?: WorkspaceRole | null): boolean {
  return role === 'owner';
}
