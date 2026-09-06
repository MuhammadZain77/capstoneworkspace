import { openDB, IDBPDatabase } from 'idb';
import { Workspace, Project, TaskDetailData } from '@/types';

const DB_NAME = 'workspace_manager_offline_db';
const DB_VERSION = 1;

export interface PendingMutation {
  id: string;
  timestamp: string;
  type: 'create_task' | 'update_task' | 'delete_task' | 'create_project' | 'create_workspace';
  payload: any;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDb() {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('workspaces')) {
          db.createObjectStore('workspaces', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('tasks')) {
          db.createObjectStore('tasks', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('pending_mutations')) {
          db.createObjectStore('pending_mutations', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveOfflineSnapshot(
  workspaces: Workspace[],
  projects: Project[],
  tasks: TaskDetailData[]
) {
  const db = await getDb();
  if (!db) return;

  const tx = db.transaction(['workspaces', 'projects', 'tasks', 'metadata'], 'readwrite');
  await tx.objectStore('workspaces').clear();
  for (const w of workspaces) {
    await tx.objectStore('workspaces').put(w);
  }

  await tx.objectStore('projects').clear();
  for (const p of projects) {
    await tx.objectStore('projects').put(p);
  }

  await tx.objectStore('tasks').clear();
  for (const t of tasks) {
    await tx.objectStore('tasks').put(t);
  }

  await tx.objectStore('metadata').put({
    key: 'last_synced',
    value: new Date().toISOString(),
  });

  await tx.done;
}

export async function loadOfflineSnapshot(): Promise<{
  workspaces: Workspace[];
  projects: Project[];
  tasks: TaskDetailData[];
  lastSynced: string | null;
} | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const workspaces = await db.getAll('workspaces');
    const projects = await db.getAll('projects');
    const tasks = await db.getAll('tasks');
    const meta = await db.get('metadata', 'last_synced');

    return {
      workspaces: workspaces || [],
      projects: projects || [],
      tasks: tasks || [],
      lastSynced: meta?.value || null,
    };
  } catch (error) {
    console.warn('Failed to load offline snapshot from IndexedDB:', error);
    return null;
  }
}

export async function queueMutation(
  type: PendingMutation['type'],
  payload: any
): Promise<PendingMutation> {
  const db = await getDb();
  const mutation: PendingMutation = {
    id: `mut-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    type,
    payload,
  };

  if (db) {
    await db.put('pending_mutations', mutation);
  }
  return mutation;
}

export async function getPendingMutations(): Promise<PendingMutation[]> {
  const db = await getDb();
  if (!db) return [];
  return (await db.getAll('pending_mutations')) || [];
}

export async function clearPendingMutations(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.clear('pending_mutations');
}

export async function syncPendingMutations(): Promise<{ syncedCount: number; errors: any[] }> {
  const mutations = await getPendingMutations();
  if (mutations.length === 0) return { syncedCount: 0, errors: [] };

  const errors: any[] = [];
  let syncedCount = 0;

  for (const m of mutations) {
    try {
      if (m.type === 'create_task') {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(m.payload),
        });
      } else if (m.type === 'update_task') {
        await fetch(`/api/tasks/${m.payload.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(m.payload.updates),
        });
      } else if (m.type === 'delete_task') {
        await fetch(`/api/tasks/${m.payload.id}`, {
          method: 'DELETE',
        });
      } else if (m.type === 'create_project') {
        await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(m.payload),
        });
      } else if (m.type === 'create_workspace') {
        await fetch('/api/workspaces', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(m.payload),
        });
      }
      syncedCount++;
    } catch (err) {
      errors.push({ mutationId: m.id, error: err });
    }
  }

  await clearPendingMutations();
  return { syncedCount, errors };
}
