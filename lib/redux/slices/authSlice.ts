import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile, WorkspaceRole } from '@/types';
import { DEMO_USERS } from '@/lib/auth';

interface AuthState {
  user: UserProfile | null;
  currentRole: WorkspaceRole;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: DEMO_USERS[0], // Default to Alex Chen (Owner)
  currentRole: 'owner',
  isAuthenticated: true,
  isLoading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserProfile | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setCurrentRole: (state, action: PayloadAction<WorkspaceRole>) => {
      state.currentRole = action.payload;
    },
    setAuthUser: (
      state,
      action: PayloadAction<{ user: UserProfile; role?: WorkspaceRole }>
    ) => {
      state.user = action.payload.user;
      if (action.payload.role) {
        state.currentRole = action.payload.role;
      }
      state.isAuthenticated = true;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
    },
    switchDemoUser: (state, action: PayloadAction<string>) => {
      const demoUser = DEMO_USERS.find((u) => u.id === action.payload);
      if (demoUser) {
        state.user = demoUser;
        state.currentRole = demoUser.role;
        state.isAuthenticated = true;
      }
    },
    logoutUser: (state) => {
      state.user = null;
      state.currentRole = 'viewer';
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.currentRole = 'viewer';
      state.isAuthenticated = false;
    },
  },
});

export const {
  setUser,
  setCurrentRole,
  setAuthUser,
  updateProfile,
  switchDemoUser,
  logoutUser,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
