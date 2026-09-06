import { describe, it, expect } from 'vitest';
import { serverDb } from './db';

describe('serverDb repository', () => {
  it('fetches workspaces and seeded members', async () => {
    const workspaces = await serverDb.getWorkspaces();
    expect(workspaces.length).toBeGreaterThan(0);
    expect(workspaces[0].name).toBe('Acme Engineering');

    const members = await serverDb.getMembers('ws-1');
    expect(members.length).toBeGreaterThanOrEqual(4);
    const owner = members.find((m) => m.role === 'owner');
    expect(owner).toBeDefined();
  });

  it('creates, updates, and deletes tasks cleanly', async () => {
    const created = await serverDb.createTask({
      title: 'Automated Test Task',
      description: 'Verifying server db task lifecycle',
      priority: 'high',
      status: 'todo',
    });
    expect(created.id).toBeDefined();
    expect(created.title).toBe('Automated Test Task');

    const updated = await serverDb.updateTask(created.id, {
      status: 'done',
      is_completed: true,
    });
    expect(updated?.status).toBe('done');
    expect(updated?.is_completed).toBe(true);

    const deleted = await serverDb.deleteTask(created.id);
    expect(deleted).toBe(true);

    const found = await serverDb.getTaskById(created.id);
    expect(found).toBeNull();
  });

  it('performs bulk task updates and deletions', async () => {
    const taskA = await serverDb.createTask({ title: 'Task A', status: 'todo' });
    const taskB = await serverDb.createTask({ title: 'Task B', status: 'todo' });

    const bulkRes = await serverDb.bulkUpdateTasks([taskA.id, taskB.id], {
      status: 'in_progress',
      priority: 'urgent',
    });
    expect(bulkRes.success).toBe(true);
    expect(bulkRes.count).toBe(2);

    const checkA = await serverDb.getTaskById(taskA.id);
    expect(checkA?.status).toBe('in_progress');
    expect(checkA?.priority).toBe('urgent');

    await serverDb.bulkUpdateTasks([taskA.id, taskB.id], { delete: true });
    expect(await serverDb.getTaskById(taskA.id)).toBeNull();
    expect(await serverDb.getTaskById(taskB.id)).toBeNull();
  });

  it('searches across workspaces, projects, and tasks', async () => {
    const searchRes = await serverDb.search('Acme');
    expect(searchRes.workspaces.length).toBeGreaterThan(0);
    expect(searchRes.workspaces[0].name).toContain('Acme');
  });
});
