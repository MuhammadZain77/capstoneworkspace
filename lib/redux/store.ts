import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import workspaceReducer from './slices/workspaceSlice';
import projectReducer from './slices/projectSlice';
import taskReducer from './slices/taskSlice';
import filterReducer from './slices/filterSlice';
import undoRedoReducer from './slices/undoRedoSlice';
import offlineReducer from './slices/offlineSlice';
import notificationReducer from './slices/notificationSlice';
import authReducer from './slices/authSlice';
import { apiSlice } from './api/apiSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      workspace: workspaceReducer,
      project: projectReducer,
      task: taskReducer,
      filter: filterReducer,
      undoRedo: undoRedoReducer,
      offline: offlineReducer,
      notification: notificationReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // For offline mutations & dates
      }).concat(apiSlice.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
