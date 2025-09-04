import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@features/auth/authSlice';

/**
 * Configura el store global de Redux Toolkit.
 * Añade aquí más reducers cuando crezcan las features.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Tipos inferidos para el estado y el dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

