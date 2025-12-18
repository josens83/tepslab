import { create } from 'zustand';
import { authAPI } from '../lib/api';

interface User {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  birthDate?: string;
  role: 'student' | 'admin';
  targetScore?: number;
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    birthDate?: string;
    targetScore?: number;
  }) => Promise<void>;
  logout: () => void;
  loadUserFromStorage: () => void;
  fetchCurrentUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data.data;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      const errorMessage =
        error.response?.data?.error || 'Login failed. Please try again.';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(data);
      const { token, user } = response.data.data;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      const errorMessage =
        error.response?.data?.error || 'Registration failed. Please try again.';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  loadUserFromStorage: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({
          user,
          token,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },

  fetchCurrentUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    set({ isLoading: true });
    try {
      const response = await authAPI.getCurrentUser();
      const user = response.data.data.user;

      localStorage.setItem('user', JSON.stringify(user));
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      get().logout();
      set({ isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
