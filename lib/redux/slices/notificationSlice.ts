import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '@/types';

interface NotificationPreferences {
  notifyAssigned: boolean;
  notifyMentioned: boolean;
  notifyDueSoon: boolean;
}

interface NotificationState {
  items: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  isLoading: boolean;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  preferences: {
    notifyAssigned: true,
    notifyMentioned: true,
    notifyDueSoon: true,
  },
  isLoading: false,
};

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.items = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.is_read).length;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload);
      if (!action.payload.is_read) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const item = state.items.find((n) => n.id === action.payload);
      if (item && !item.is_read) {
        item.is_read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach((n) => {
        n.is_read = true;
      });
      state.unreadCount = 0;
    },
    setNotificationPreferences: (state, action: PayloadAction<Partial<NotificationPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  setNotificationPreferences,
} = notificationSlice.actions;

export default notificationSlice.reducer;
