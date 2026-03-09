import { create } from 'zustand';
interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user: User | null) => {
    set({ user });
  },
  logout: async () => {
    try {
      await fetch(`${import.meta.env.VITE_BE_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      set({ user: null });
    }
  },
  initAuth: async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BE_BASE_URL}/api/auth/me`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        set({ user: null });
        return;
      }

      const { user } = await response.json();
      set({ user });
    } catch {
      set({ user: null });
    }
  },
}));
