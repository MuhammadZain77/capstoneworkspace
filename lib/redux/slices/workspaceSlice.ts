import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Workspace, WorkspaceMember, WorkspaceRole } from '@/types';

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  members: WorkspaceMember[];
  currentRole: WorkspaceRole | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: WorkspaceState = {
  workspaces: [],
  activeWorkspaceId: null,
  members: [],
  currentRole: null,
  isLoading: false,
  error: null,
};

export const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setWorkspaces: (state, action: PayloadAction<Workspace[]>) => {
      state.workspaces = action.payload;
    },
    setActiveWorkspaceId: (state, action: PayloadAction<string | null>) => {
      state.activeWorkspaceId = action.payload;
    },
    setWorkspaceMembers: (state, action: PayloadAction<WorkspaceMember[]>) => {
      state.members = action.payload;
    },
    setCurrentRole: (state, action: PayloadAction<WorkspaceRole | null>) => {
      state.currentRole = action.payload;
    },
    addWorkspace: (state, action: PayloadAction<Workspace>) => {
      state.workspaces.push(action.payload);
      state.activeWorkspaceId = action.payload.id;
    },
    updateWorkspaceInList: (state, action: PayloadAction<Partial<Workspace> & { id: string }>) => {
      const idx = state.workspaces.findIndex((w) => w.id === action.payload.id);
      if (idx !== -1) {
        state.workspaces[idx] = { ...state.workspaces[idx], ...action.payload };
      }
    },
    removeWorkspaceFromList: (state, action: PayloadAction<string>) => {
      state.workspaces = state.workspaces.filter((w) => w.id !== action.payload);
      if (state.activeWorkspaceId === action.payload) {
        state.activeWorkspaceId = state.workspaces[0]?.id || null;
      }
    },
  },
});

export const {
  setWorkspaces,
  setActiveWorkspaceId,
  setWorkspaceMembers,
  setCurrentRole,
  addWorkspace,
  updateWorkspaceInList,
  removeWorkspaceFromList,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
