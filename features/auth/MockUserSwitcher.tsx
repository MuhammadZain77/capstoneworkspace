'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ShieldCheck, ChevronDown, Check, Users, LogOut, LogIn } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { switchDemoUser, logoutUser } from '@/lib/redux/slices/authSlice';
import { DEMO_USERS } from '@/lib/auth';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { WorkspaceRole } from '@/types';
import { supabase } from '@/lib/supabase/client';

export function MockUserSwitcher() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const currentRole = useAppSelector((state) => state.auth.currentRole);
  const [isOpen, setIsOpen] = React.useState(false);

  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectUser = (userId: string, role: WorkspaceRole, name: string) => {
    dispatch(switchDemoUser(userId));
    setIsOpen(false);
    toast.success(`Switched active user to ${name}`, {
      description: `Active role updated to ${role.toUpperCase()}. Permissions adjusted.`,
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore if Supabase unconfigured
    }
    dispatch(logoutUser());
    setIsOpen(false);
    toast.info('Signed out of session');
    router.push('/login');
  };

  const getRoleBadgeVariant = (role: WorkspaceRole) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'warning';
      case 'member':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card/80 px-2.5 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-accent/60 cursor-pointer shadow-xs"
        title="Switch user to evaluate role permissions"
      >
        <Avatar
          src={currentUser?.avatar_url}
          alt={currentUser?.full_name || 'User'}
          size="sm"
        />
        <div className="flex flex-col text-left">
          <span className="truncate font-semibold max-w-[110px]">
            {currentUser?.full_name || 'User'}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
            {currentRole}
          </span>
        </div>
        <ChevronDown className="h-3 w-3 text-muted-foreground ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-68 rounded-xl border border-border bg-card p-1.5 shadow-xl z-50 animate-in fade-in-80 zoom-in-95">
          <div className="px-2 py-1.5 border-b border-border/80 mb-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span>Switch Demo Account</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Test roles & permissions across Owner, Admin, Member, and Viewer.
            </p>
          </div>

          <div className="space-y-0.5">
            {DEMO_USERS.map((u) => {
              const isSelected = currentUser?.id === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectUser(u.id, u.role, u.full_name || u.email)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'hover:bg-muted/70 text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar
                      src={u.avatar_url}
                      alt={u.full_name || u.email}
                      size="sm"
                    />
                    <div className="flex flex-col text-left">
                      <span className="font-medium text-xs">{u.full_name}</span>
                      <span className="text-[10px] text-muted-foreground">{u.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant={getRoleBadgeVariant(u.role)}
                      className="text-[9px] px-1 py-0 uppercase"
                    >
                      {u.role}
                    </Badge>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-2 border-t border-border/80 pt-1.5 space-y-0.5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push('/login');
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign in with another account</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
