import { describe, it, expect } from 'vitest';
import {
  canViewWorkspace,
  canManageWorkspace,
  canDeleteWorkspace,
  canManageMembers,
  canCreateTask,
  canEditTask,
  canDeleteComment,
  canImportData,
  canResetData,
} from './permissions';

describe('Permissions Logic', () => {
  it('allows all defined roles to view workspace, rejects null/undefined', () => {
    expect(canViewWorkspace('owner')).toBe(true);
    expect(canViewWorkspace('admin')).toBe(true);
    expect(canViewWorkspace('member')).toBe(true);
    expect(canViewWorkspace('viewer')).toBe(true);
    expect(canViewWorkspace(null)).toBe(false);
    expect(canViewWorkspace(undefined)).toBe(false);
  });

  it('restricts workspace deletion and data reset to owner only', () => {
    expect(canDeleteWorkspace('owner')).toBe(true);
    expect(canDeleteWorkspace('admin')).toBe(false);
    expect(canDeleteWorkspace('member')).toBe(false);
    expect(canDeleteWorkspace('viewer')).toBe(false);

    expect(canResetData('owner')).toBe(true);
    expect(canResetData('admin')).toBe(false);
  });

  it('restricts member management to owner and admin', () => {
    expect(canManageMembers('owner')).toBe(true);
    expect(canManageMembers('admin')).toBe(true);
    expect(canManageMembers('member')).toBe(false);
    expect(canManageMembers('viewer')).toBe(false);
  });

  it('blocks viewers from mutating tasks', () => {
    expect(canCreateTask('owner')).toBe(true);
    expect(canCreateTask('admin')).toBe(true);
    expect(canCreateTask('member')).toBe(true);
    expect(canCreateTask('viewer')).toBe(false);

    expect(canEditTask('viewer')).toBe(false);
  });

  it('handles comment deletion authorization correctly', () => {
    // Owner and admin can delete any comment
    expect(canDeleteComment('owner', 'user-1', 'user-2')).toBe(true);
    expect(canDeleteComment('admin', 'user-1', 'user-2')).toBe(true);

    // Member can delete own comment
    expect(canDeleteComment('member', 'user-1', 'user-1')).toBe(true);
    // Member cannot delete another member's comment
    expect(canDeleteComment('member', 'user-1', 'user-2')).toBe(false);

    // Viewer cannot delete even if author
    expect(canDeleteComment('viewer', 'user-1', 'user-1')).toBe(false);
  });

  it('restricts data import to owner and admin', () => {
    expect(canImportData('owner')).toBe(true);
    expect(canImportData('admin')).toBe(true);
    expect(canImportData('member')).toBe(false);
    expect(canImportData('viewer')).toBe(false);
  });
});
