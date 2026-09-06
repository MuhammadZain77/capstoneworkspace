import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project, ViewType, GroupByType } from '@/types';

interface ProjectState {
  projects: Project[];
  activeProjectId: string | null;
  activeView: ViewType;
  groupBy: GroupByType;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  activeProjectId: null,
  activeView: 'kanban',
  groupBy: 'none',
  isLoading: false,
  error: null,
};

export const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
    setActiveProjectId: (state, action: PayloadAction<string | null>) => {
      state.activeProjectId = action.payload;
    },
    setActiveView: (state, action: PayloadAction<ViewType>) => {
      state.activeView = action.payload;
    },
    setGroupBy: (state, action: PayloadAction<GroupByType>) => {
      state.groupBy = action.payload;
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload);
      state.activeProjectId = action.payload.id;
    },
    updateProjectInList: (state, action: PayloadAction<Partial<Project> & { id: string }>) => {
      const idx = state.projects.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) {
        state.projects[idx] = { ...state.projects[idx], ...action.payload };
      }
    },
    removeProjectFromList: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
      if (state.activeProjectId === action.payload) {
        state.activeProjectId = state.projects[0]?.id || null;
      }
    },
  },
});

export const {
  setProjects,
  setActiveProjectId,
  setActiveView,
  setGroupBy,
  addProject,
  updateProjectInList,
  removeProjectFromList,
} = projectSlice.actions;

export default projectSlice.reducer;
