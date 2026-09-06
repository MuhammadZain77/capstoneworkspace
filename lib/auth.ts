import { UserProfile, WorkspaceRole } from '@/types';

export interface DemoUser extends UserProfile {
  role: WorkspaceRole;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'alex.chen@workspace.dev',
    full_name: 'Alex Chen',
    avatar_url:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    role: 'owner',
    theme: 'system',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'sarah.kim@workspace.dev',
    full_name: 'Sarah Kim',
    avatar_url:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    role: 'admin',
    theme: 'system',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'marcus.johnson@workspace.dev',
    full_name: 'Marcus Johnson',
    avatar_url:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    role: 'member',
    theme: 'system',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'elena.rostova@workspace.dev',
    full_name: 'Elena Rostova',
    avatar_url:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces',
    role: 'viewer',
    theme: 'system',
  },
];
