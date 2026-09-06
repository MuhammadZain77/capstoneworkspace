
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { serverDb } from '@/lib/server/db';

const importSchema = z.object({
  version: z.string().optional(),
  exported_at: z.string().optional(),
  workspace: z
    .object({
      name: z.string().min(1, 'Workspace name is required'),
      color: z.string().optional(),
      default_view: z.string().optional(),
    })
    .optional(),
  projects: z
    .array(
      z.object({
        name: z.string().min(1, 'Project name is required'),
        description: z.string().nullable().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
      })
    )
    .optional(),
  tasks: z
    .array(
      z.object({
        title: z.string().min(1, 'Task title is required'),
        description: z.string().optional(),
        priority: z.enum(['urgent', 'high', 'medium', 'low', 'none']).optional(),
        status: z.string().optional(),
      })
    )
    .optional(),
});

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const parseResult = importSchema.safeParse(raw);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Failed',
          issues: parseResult.error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { workspace, projects, tasks } = parseResult.data;

    let createdWs = null;
    if (workspace) {
      createdWs = await serverDb.createWorkspace({
        name: workspace.name,
        color: workspace.color || '#3b82f6',
      });
    }

    let createdProjectsCount = 0;
    if (projects && projects.length > 0) {
      for (const p of projects) {
        await serverDb.createProject({
          ...p,
          workspace_id: createdWs?.id || 'ws-1',
        });
        createdProjectsCount++;
      }
    }

    let createdTasksCount = 0;
    if (tasks && tasks.length > 0) {
      for (const t of tasks) {
        await serverDb.createTask({
          title: t.title,
          description: t.description,
          priority: t.priority,
          status: t.status || 'todo',
        });
        createdTasksCount++;
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        workspaceCreated: !!createdWs,
        projectsImported: createdProjectsCount,
        tasksImported: createdTasksCount,
      },
    });
  } catch (error) {
    console.error('Error importing workspace data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
