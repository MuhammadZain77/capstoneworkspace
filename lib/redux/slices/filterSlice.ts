import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FilterCriteria, TaskPriority } from '@/types';

interface FilterState extends FilterCriteria {
  activeSavedFilterId: string | null;
}

const initialState: FilterState = {
  searchQuery: '',
  assigneeId: null,
  priorities: [],
  statuses: [],
  labelIds: [],
  dueDateRange: {
    from: null,
    to: null,
  },
  sortBy: 'created_at',
  sortOrder: 'desc',
  activeSavedFilterId: null,
};

export const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setAssigneeFilter: (state, action: PayloadAction<string | null>) => {
      state.assigneeId = action.payload;
    },
    togglePriorityFilter: (state, action: PayloadAction<TaskPriority>) => {
      const p = action.payload;
      if (!state.priorities) state.priorities = [];
      if (state.priorities.includes(p)) {
        state.priorities = state.priorities.filter((item) => item !== p);
      } else {
        state.priorities.push(p);
      }
    },
    toggleStatusFilter: (state, action: PayloadAction<string>) => {
      const s = action.payload;
      if (!state.statuses) state.statuses = [];
      if (state.statuses.includes(s)) {
        state.statuses = state.statuses.filter((item) => item !== s);
      } else {
        state.statuses.push(s);
      }
    },
    toggleLabelFilter: (state, action: PayloadAction<string>) => {
      const l = action.payload;
      if (!state.labelIds) state.labelIds = [];
      if (state.labelIds.includes(l)) {
        state.labelIds = state.labelIds.filter((item) => item !== l);
      } else {
        state.labelIds.push(l);
      }
    },
    setSortCriteria: (
      state,
      action: PayloadAction<{ sortBy: 'due_date' | 'priority' | 'created_at' | 'alphabetical'; sortOrder: 'asc' | 'desc' }>
    ) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    applySavedFilter: (state, action: PayloadAction<{ id: string; criteria: FilterCriteria }>) => {
      state.activeSavedFilterId = action.payload.id;
      Object.assign(state, action.payload.criteria);
    },
    resetFilters: (state) => {
      return {
        ...initialState,
        searchQuery: state.searchQuery, // keep search query if typed
      };
    },
    clearAllFilters: () => {
      return initialState;
    },
  },
});

export const {
  setSearchQuery,
  setAssigneeFilter,
  togglePriorityFilter,
  toggleStatusFilter,
  toggleLabelFilter,
  setSortCriteria,
  applySavedFilter,
  resetFilters,
  clearAllFilters,
} = filterSlice.actions;

export default filterSlice.reducer;
