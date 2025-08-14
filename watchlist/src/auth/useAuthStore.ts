import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (token: string) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setUser: (token: string) => {
    localStorage.setItem('auth_token', token);
    const decoded = jwtDecode<User>(token);
    set({ user: decoded, token });
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, token: null });
  },
  initAuth: () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const decoded = jwtDecode<User>(token);
        set({ user: decoded, token });
      } catch (error) {
        localStorage.removeItem('auth_token');
        set({ user: null, token: null });
      }
    }
  },
}));
