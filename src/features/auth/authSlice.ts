import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthResponse, AuthState, AuthTokens } from './types';

/**
 * Slice de autenticación.
 * Contiene los tokens y la información básica del usuario autenticado.
 */
const initialState: AuthState = {
  tokens: null,
  user: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Establece los tokens y (opcionalmente) actualiza el usuario si se provee.
     */
    setTokens: (
      state,
      action: PayloadAction<{ tokens: AuthTokens; user?: AuthResponse['user'] }>
    ) => {
      state.tokens = action.payload.tokens;
      if (action.payload.user) {
        state.user = action.payload.user;
      }
    },

    /**
     * Limpia cualquier rastro de autenticación del estado.
     */
    clearAuth: (state) => {
      state.tokens = null;
      state.user = null;
    },

    /**
     * Establece/actualiza el usuario autenticado.
     */
    setUser: (state, action: PayloadAction<AuthResponse['user'] | null>) => {
      state.user = action.payload;
    },
  },
});

export const { setTokens, clearAuth, setUser } = authSlice.actions;
export default authSlice.reducer;

