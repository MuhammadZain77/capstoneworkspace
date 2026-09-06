import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ThemeType } from '@/types';

interface UIState {
  sidebarOpen: boolean;
  mobileDrawerOpen: boolean;
  theme: ThemeType;
  activeModal: string | null;
  activeTaskId: string | null;
  commandPaletteOpen: boolean;
  notificationCenterOpen: boolean;
}

const initialState: UIState = {
  sidebarOpen: true,
  mobileDrawerOpen: false,
  theme: 'system',
  activeModal: null,
  activeTaskId: null,
  commandPaletteOpen: false,
  notificationCenterOpen: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleMobileDrawer: (state) => {
      state.mobileDrawerOpen = !state.mobileDrawerOpen;
    },
    setMobileDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileDrawerOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<ThemeType>) => {
      state.theme = action.payload;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    setActiveTaskId: (state, action: PayloadAction<string | null>) => {
      state.activeTaskId = action.payload;
    },
    setCommandPaletteOpen: (state, action: PayloadAction<boolean>) => {
      state.commandPaletteOpen = action.payload;
    },
    setNotificationCenterOpen: (state, action: PayloadAction<boolean>) => {
      state.notificationCenterOpen = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileDrawer,
  setMobileDrawerOpen,
  setTheme,
  openModal,
  closeModal,
  setActiveTaskId,
  setCommandPaletteOpen,
  setNotificationCenterOpen,
} = uiSlice.actions;

export default uiSlice.reducer;
