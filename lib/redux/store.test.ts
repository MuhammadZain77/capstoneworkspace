import { describe, it, expect } from 'vitest';
import { makeStore } from './store';
import { toggleSidebar, setTheme } from './slices/uiSlice';
import { setActiveWorkspaceId, addWorkspace } from './slices/workspaceSlice';
import { pushAction, popUndo, popRedo } from './slices/undoRedoSlice';
import { setOnlineStatus } from './slices/offlineSlice';

describe('Redux Store & Slices', () => {
  it('creates an independent store instance', () => {
    const store1 = makeStore();
    const store2 = makeStore();

    store1.dispatch(toggleSidebar());
    expect(store1.getState().ui.sidebarOpen).toBe(false);
    expect(store2.getState().ui.sidebarOpen).toBe(true);
  });

  it('handles UI theme toggle and workspace state mutations', () => {
    const store = makeStore();
    store.dispatch(setTheme('dark'));
    expect(store.getState().ui.theme).toBe('dark');

    store.dispatch(
      addWorkspace({
        id: 'ws-1',
        name: 'Acme Corp',
        slug: 'acme-corp',
        icon: 'briefcase',
        color: '#3b82f6',
        default_view: 'kanban',
        created_by: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    );

    expect(store.getState().workspace.workspaces).toHaveLength(1);
    expect(store.getState().workspace.activeWorkspaceId).toBe('ws-1');
  });

  it('supports undo/redo action tracking', () => {
    const store = makeStore();

    store.dispatch(
      pushAction({
        description: 'Move task to Done',
        type: 'TASK_MOVE',
        entityId: 'task-1',
        previousState: { status: 'todo' },
        nextState: { status: 'done' },
      })
    );

    expect(store.getState().undoRedo.past).toHaveLength(1);
    expect(store.getState().undoRedo.future).toHaveLength(0);

    store.dispatch(popUndo());
    expect(store.getState().undoRedo.past).toHaveLength(0);
    expect(store.getState().undoRedo.future).toHaveLength(1);

    store.dispatch(popRedo());
    expect(store.getState().undoRedo.past).toHaveLength(1);
    expect(store.getState().undoRedo.future).toHaveLength(0);
  });

  it('updates online/offline status correctly', () => {
    const store = makeStore();
    expect(store.getState().offline.isOnline).toBe(true);

    store.dispatch(setOnlineStatus(false));
    expect(store.getState().offline.isOnline).toBe(false);
  });
});
