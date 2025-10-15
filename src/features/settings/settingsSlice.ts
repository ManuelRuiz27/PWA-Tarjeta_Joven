import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Locale } from '@i18n/messages';
import { loadSettingsState } from './storage';
export type ThemePreference = 'light' | 'dark';

export interface SettingsState {
  locale: Locale;
  theme: ThemePreference;
  notificationsEnabled: boolean;
}

const initialState: SettingsState = loadSettingsState();

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLocale(state, action: PayloadAction<Locale>) {
      state.locale = action.payload;
    },
    setTheme(state, action: PayloadAction<ThemePreference>) {
      state.theme = action.payload;
    },
    setNotificationsEnabled(state, action: PayloadAction<boolean>) {
      state.notificationsEnabled = action.payload;
    },
  },
});

export const { setLocale, setTheme, setNotificationsEnabled } = settingsSlice.actions;
export default settingsSlice.reducer;
