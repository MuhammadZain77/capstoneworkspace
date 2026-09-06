import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UndoableAction {
  id: string;
  description: string;
  type: 'TASK_EDIT' | 'TASK_MOVE' | 'TASK_DELETE' | 'TASK_BULK';
  entityId: string;
  previousState: unknown;
  nextState: unknown;
  timestamp: number;
}

interface UndoRedoState {
  past: UndoableAction[];
  future: UndoableAction[];
  lastAction: UndoableAction | null;
}

const initialState: UndoRedoState = {
  past: [],
  future: [],
  lastAction: null,
};

export const undoRedoSlice = createSlice({
  name: 'undoRedo',
  initialState,
  reducers: {
    pushAction: (state, action: PayloadAction<Omit<UndoableAction, 'id' | 'timestamp'>>) => {
      const newAction: UndoableAction = {
        ...action.payload,
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
      };
      state.past.push(newAction);
      state.future = []; // Clear redo stack on new user mutation
      state.lastAction = newAction;
      // Cap stack to 50 operations to bound memory
      if (state.past.length > 50) {
        state.past.shift();
      }
    },
    popUndo: (state) => {
      const action = state.past.pop();
      if (action) {
        state.future.push(action);
        state.lastAction = action;
      }
    },
    popRedo: (state) => {
      const action = state.future.pop();
      if (action) {
        state.past.push(action);
        state.lastAction = action;
      }
    },
    clearHistory: (state) => {
      state.past = [];
      state.future = [];
      state.lastAction = null;
    },
  },
});

export const { pushAction, popUndo, popRedo, clearHistory } = undoRedoSlice.actions;

export default undoRedoSlice.reducer;
