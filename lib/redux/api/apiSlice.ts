import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  Workspace,
  Project,
  TaskDetailData,
  WorkspaceMember,
  Notification,
  Activity,
  WorkspaceRole,
  TaskPriority,
  TaskStatus,
} from '@/types';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
  }),
  tagTypes: [
    'Workspace',
    'Project',
    'Task',
    'Comment',
    'Member',
    'Notification',
    'Activity',
  ],
  endpoints: (builder) => ({
    // Workspaces
    getWorkspaces: builder.query<{ workspaces: Workspace[] }, void>({
      query: () => '/workspaces',
      providesTags: ['Workspace'],
    }),
    createWorkspace: builder.mutation<{ workspace: Workspace }, Partial<Workspace>>({
      query: (body) => ({
        url: '/workspaces',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Workspace'],
    }),
    updateWorkspace: builder.mutation<
      { workspace: Workspace },
      { workspaceId: string; updates: Partial<Workspace> }
    >({
      query: ({ workspaceId, updates }) => ({
        url: `/workspaces/${workspaceId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['Workspace'],
    }),
    deleteWorkspace: builder.mutation<{ success: boolean }, string>({
      query: (workspaceId) => ({
        url: `/workspaces/${workspaceId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Workspace', 'Project', 'Task'],
    }),

    // Workspace Members
    getMembers: builder.query<{ members: WorkspaceMember[] }, string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/members`,
      providesTags: ['Member'],
    }),
    addMember: builder.mutation<
      { member: WorkspaceMember },
      { workspaceId: string; email: string; role: WorkspaceRole }
    >({
      query: ({ workspaceId, email, role }) => ({
        url: `/workspaces/${workspaceId}/members`,
        method: 'POST',
        body: { email, role },
      }),
      invalidatesTags: ['Member'],
    }),
    updateMemberRole: builder.mutation<
      { member: WorkspaceMember },
      { workspaceId: string; userId: string; role: WorkspaceRole }
    >({
      query: ({ workspaceId, userId, role }) => ({
        url: `/workspaces/${workspaceId}/members/${userId}`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['Member'],
    }),
    removeMember: builder.mutation<
      { success: boolean },
      { workspaceId: string; userId: string }
    >({
      query: ({ workspaceId, userId }) => ({
        url: `/workspaces/${workspaceId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Member'],
    }),

    // Projects
    getProjects: builder.query<{ projects: Project[] }, string | void>({
      query: (workspaceId) =>
        workspaceId ? `/projects?workspaceId=${workspaceId}` : '/projects',
      providesTags: ['Project'],
    }),
    createProject: builder.mutation<{ project: Project }, Partial<Project>>({
      query: (body) => ({
        url: '/projects',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Project'],
    }),
    updateProject: builder.mutation<
      { project: Project },
      { projectId: string; updates: Partial<Project> }
    >({
      query: ({ projectId, updates }) => ({
        url: `/projects/${projectId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['Project'],
    }),
    deleteProject: builder.mutation<{ success: boolean }, string>({
      query: (projectId) => ({
        url: `/projects/${projectId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project', 'Task'],
    }),

    // Tasks
    getTasks: builder.query<
      { tasks: TaskDetailData[] },
      { projectId?: string; status?: string; priority?: string } | void
    >({
      query: (params) => {
        const sp = new URLSearchParams();
        if (params?.projectId) sp.set('projectId', params.projectId);
        if (params?.status) sp.set('status', params.status);
        if (params?.priority) sp.set('priority', params.priority);
        const q = sp.toString();
        return q ? `/tasks?${q}` : '/tasks';
      },
      providesTags: ['Task'],
    }),
    createTask: builder.mutation<{ task: TaskDetailData }, Partial<TaskDetailData>>({
      query: (body) => ({
        url: '/tasks',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Task', 'Activity'],
    }),
    updateTask: builder.mutation<
      { task: TaskDetailData },
      { taskId: string; updates: Partial<TaskDetailData> }
    >({
      query: ({ taskId, updates }) => ({
        url: `/tasks/${taskId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['Task', 'Activity'],
    }),
    deleteTask: builder.mutation<{ success: boolean }, string>({
      query: (taskId) => ({
        url: `/tasks/${taskId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task', 'Activity'],
    }),
    bulkUpdateTasks: builder.mutation<
      { success: boolean; count: number },
      { taskIds: string[]; action: { status?: TaskStatus; priority?: TaskPriority; delete?: boolean } }
    >({
      query: (body) => ({
        url: '/tasks/bulk',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Task', 'Activity'],
    }),

    // Comments
    addComment: builder.mutation<
      { comment: unknown },
      { taskId: string; content: string; userId?: string; userName?: string }
    >({
      query: ({ taskId, ...body }) => ({
        url: `/tasks/${taskId}/comments`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Task', 'Activity'],
    }),

    // Notifications
    getNotifications: builder.query<{ notifications: Notification[] }, string | void>({
      query: (recipientId) =>
        recipientId ? `/notifications?recipientId=${recipientId}` : '/notifications',
      providesTags: ['Notification'],
    }),
    markNotificationRead: builder.mutation<{ notification: Notification }, string>({
      query: (notificationId) => ({
        url: '/notifications',
        method: 'PATCH',
        body: { notificationId },
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllNotificationsRead: builder.mutation<{ success: boolean }, string>({
      query: (recipientId) => ({
        url: '/notifications',
        method: 'PATCH',
        body: { markAll: true, recipientId },
      }),
      invalidatesTags: ['Notification'],
    }),

    // Activities
    getActivities: builder.query<{ activities: Activity[] }, string | void>({
      query: (workspaceId) =>
        workspaceId ? `/activities?workspaceId=${workspaceId}` : '/activities',
      providesTags: ['Activity'],
    }),

    // Global Search
    search: builder.query<
      { workspaces: Workspace[]; projects: Project[]; tasks: TaskDetailData[] },
      { query: string; workspaceId?: string }
    >({
      query: ({ query, workspaceId }) => {
        const sp = new URLSearchParams({ q: query });
        if (workspaceId) sp.set('workspaceId', workspaceId);
        return `/search?${sp.toString()}`;
      },
    }),
  }),
});

export const {
  useGetWorkspacesQuery,
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useGetMembersQuery,
  useAddMemberMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useBulkUpdateTasksMutation,
  useAddCommentMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useGetActivitiesQuery,
  useSearchQuery,
} = apiSlice;
