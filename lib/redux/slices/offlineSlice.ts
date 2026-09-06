import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'success';

interface OfflineState {
  isOnline: boolean;
  syncStatus: SyncStatus;
  pendingMutationCount: number;
  lastSyncedAt: string | null;
  errorMessage: string | null;
}

const initialState: OfflineState = {
  isOnline: true,
  syncStatus: 'idle',
  pendingMutationCount: 0,
  lastSyncedAt: null,
  errorMessage: null,
};

export const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setSyncStatus: (state, action: PayloadAction<SyncStatus>) => {
      state.syncStatus = action.payload;
    },
    setPendingMutationCount: (state, action: PayloadAction<number>) => {
      state.pendingMutationCount = action.payload;
    },
    setLastSyncedAt: (state, action: PayloadAction<string>) => {
      state.lastSyncedAt = action.payload;
      state.syncStatus = 'success';
      state.errorMessage = null;
    },
    setSyncError: (state, action: PayloadAction<string>) => {
      state.syncStatus = 'error';
      state.errorMessage = action.payload;
    },
  },
});

export const {
  setOnlineStatus,
  setSyncStatus,
  setPendingMutationCount,
  setLastSyncedAt,
  setSyncError,
} = offlineSlice.actions;

export default offlineSlice.reducer;
