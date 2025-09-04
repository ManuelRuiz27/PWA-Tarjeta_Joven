import { describe, expect, it } from 'vitest';
import reducer, { clearAuth, setTokens, setUser } from '../authSlice';
import type { AuthState, AuthTokens } from '../types';

const initial: AuthState = { tokens: null, user: null };

describe('authSlice reducers', () => {
  it('setTokens debe guardar tokens y opcionalmente user', () => {
    const tokens: AuthTokens = {
      accessToken: 'a',
      refreshToken: 'r',
      expiresAt: 123,
    };

    const state1 = reducer(initial, setTokens({ tokens }));
    expect(state1.tokens).toEqual(tokens);
    expect(state1.user).toBeNull();

    const state2 = reducer(initial, setTokens({ tokens, user: { id: '1', name: 'Ana' } }));
    expect(state2.tokens).toEqual(tokens);
    expect(state2.user).toEqual({ id: '1', name: 'Ana' });
  });

  it('setUser debe establecer o limpiar el usuario', () => {
    const s1 = reducer(initial, setUser({ id: '9' }));
    expect(s1.user).toEqual({ id: '9' });

    const s2 = reducer(s1, setUser(null));
    expect(s2.user).toBeNull();
  });

  it('clearAuth debe limpiar tokens y usuario', () => {
    const prev: AuthState = {
      tokens: { accessToken: 'a', refreshToken: 'b', expiresAt: 999 },
      user: { id: '1' },
    };
    const s = reducer(prev, clearAuth());
    expect(s.tokens).toBeNull();
    expect(s.user).toBeNull();
  });
});

