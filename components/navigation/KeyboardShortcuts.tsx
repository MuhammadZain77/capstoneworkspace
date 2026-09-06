'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/redux/hooks';
import { setCommandPaletteOpen } from '@/lib/redux/slices/uiSlice';

interface KeyboardShortcutsProps {
  onOpenCreateTask?: () => void;
  onSelectView?: (view: 'dashboard' | 'kanban' | 'list' | 'calendar') => void;
}

export function KeyboardShortcuts({
  onOpenCreateTask,
  onSelectView,
}: KeyboardShortcutsProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in inputs or textareas
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      // Ignore if Cmd or Ctrl is pressed (handled separately like Cmd+K)
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'c':
          e.preventDefault();
          if (onOpenCreateTask) onOpenCreateTask();
          break;
        case 'k':
          e.preventDefault();
          if (onSelectView) onSelectView('kanban');
          break;
        case 'l':
          e.preventDefault();
          if (onSelectView) onSelectView('list');
          break;
        case 'd':
          e.preventDefault();
          if (onSelectView) onSelectView('dashboard');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, onOpenCreateTask, onSelectView]);

  return null;
}
