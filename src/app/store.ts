import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from '@features/auth/authSlice';
import { catalogApi } from '@features/catalog/catalogSlice';
import settingsReducer from '@features/settings/settingsSlice';
import { saveSettingsState } from '@features/settings/storage';

/**
 * Configura el store global de Redux Toolkit.
 * Añade aquí más reducers cuando crezcan las features.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
    [catalogApi.reducerPath]: catalogApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(catalogApi.middleware),
});

if (typeof window !== 'undefined') {
  let lastSettings = store.getState().settings;
  store.subscribe(() => {
    const nextSettings = store.getState().settings;
    if (nextSettings !== lastSettings) {
      lastSettings = nextSettings;
      saveSettingsState(nextSettings);
    }
  });
}

// Tipos inferidos para el estado y el dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);

