'use client';

import * as React from 'react';
import {
  ChevronDown,
  Plus,
  Check,
  Building2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { setActiveWorkspaceId } from '@/lib/redux/slices/workspaceSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Workspace } from '@/types';

interface WorkspaceSwitcherProps {
  onOpenCreateWorkspace?: () => void;
  compact?: boolean;
}

export function WorkspaceSwitcher({
  onOpenCreateWorkspace,
  compact = false,
}: WorkspaceSwitcherProps) {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const workspaces = useAppSelector((state) => state.workspace.workspaces);
  const activeWorkspaceId = useAppSelector((state) => state.workspace.activeWorkspaceId);
  const currentRole = useAppSelector((state) => state.auth.currentRole);

  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0] || {
      id: 'ws-1',
      name: 'Acme Engineering',
      color: '#3b82f6',
    };

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectWorkspace = (w: Workspace) => {
    dispatch(setActiveWorkspaceId(w.id));
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-card/70 px-2.5 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-muted/60 hover:border-primary/40 cursor-pointer shadow-xs"
        title="Switch Workspace"
      >
        <div
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white shadow-xs"
          style={{ backgroundColor: activeWorkspace.color || '#3b82f6' }}
        >
          {activeWorkspace.name?.slice(0, 1).toUpperCase() || 'W'}
        </div>

        <span className="truncate max-w-[140px] text-left">{activeWorkspace.name}</span>

        {!compact && (
          <Badge variant="outline" className="hidden sm:inline-flex h-4 px-1 text-[9px] font-normal uppercase tracking-wider">
            {currentRole}
          </Badge>
        )}

        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-64 rounded-xl border border-border bg-card p-1.5 shadow-2xl animate-in fade-in-50 zoom-in-95">
          <div className="px-2 py-1.5 border-b border-border/60">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Workspaces ({workspaces.length})
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
            {workspaces.map((w) => {
              const isCurrent = w.id === activeWorkspace.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => handleSelectWorkspace(w)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors cursor-pointer text-left ${
                    isCurrent
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-foreground hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white shadow-xs"
                      style={{ backgroundColor: w.color || '#3b82f6' }}
                    >
                      {w.name?.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="truncate">{w.name}</span>
                  </div>

                  {isCurrent && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Action to create new workspace */}
          <div className="pt-1 border-t border-border/60 mt-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onOpenCreateWorkspace) {
                  onOpenCreateWorkspace();
                }
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Workspace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
