import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TaskState {
  selectedTaskIds: string[];
  isBulkSelecting: boolean;
  draggingTaskId: string | null;
}

const initialState: TaskState = {
  selectedTaskIds: [],
  isBulkSelecting: false,
  draggingTaskId: null,
};

export const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    toggleTaskSelection: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.selectedTaskIds.includes(id)) {
        state.selectedTaskIds = state.selectedTaskIds.filter((tId) => tId !== id);
      } else {
        state.selectedTaskIds.push(id);
      }
      state.isBulkSelecting = state.selectedTaskIds.length > 0;
    },
    setSelectedTaskIds: (state, action: PayloadAction<string[]>) => {
      state.selectedTaskIds = action.payload;
      state.isBulkSelecting = action.payload.length > 0;
    },
    clearTaskSelection: (state) => {
      state.selectedTaskIds = [];
      state.isBulkSelecting = false;
    },
    setDraggingTaskId: (state, action: PayloadAction<string | null>) => {
      state.draggingTaskId = action.payload;
    },
  },
});

export const {
  toggleTaskSelection,
  setSelectedTaskIds,
  clearTaskSelection,
  setDraggingTaskId,
} = taskSlice.actions;

export default taskSlice.reducer;
