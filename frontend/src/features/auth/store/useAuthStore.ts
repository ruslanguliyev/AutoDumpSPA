import { create } from 'zustand';

import type { AuthUser } from '@/features/auth/api/auth.storage';
import { clearAuthSession } from '@/features/auth/api/auth.storage';

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('autobaz-token'),
  isAuthenticated: Boolean(localStorage.getItem('autobaz-token')),

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
