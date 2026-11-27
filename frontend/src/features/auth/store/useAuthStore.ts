import { create } from 'zustand';

import type { AuthUser } from '@/features/auth/api/auth.storage';
import { clearAuthSession } from '@/features/auth/api/auth.storage';
import { SESSION_EXPIRED_EVENT, isTokenExpired } from '@/lib/authToken';

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
};

/** The stored token, or null when there is none or it has already expired. */
const readValidToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const token = window.localStorage.getItem('autobaz-token');
  if (token && isTokenExpired(token)) {
    clearAuthSession();
    return null;
  }
  return token;
};

const initialToken = readValidToken();

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: initialToken,
  isAuthenticated: Boolean(initialToken),

  setUser: (user) => set(() => ({ user })),

  setAccessToken: (token) =>
    set(() => ({
      accessToken: token,
      isAuthenticated: Boolean(token),
    })),

  logout: () => {
    clearAuthSession();
    set(() => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    }));
  },
}));

// The server rejected the stored token: drop it, so protected pages send the user to log in.
if (typeof window !== 'undefined') {
  window.addEventListener(SESSION_EXPIRED_EVENT, () => {
    if (useAuthStore.getState().isAuthenticated) useAuthStore.getState().logout();
  });
}
