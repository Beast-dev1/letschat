import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  updateToken: (accessToken: string) => void;
  
  // API actions
  register: (data: {
    username: string;
    email: string;
    password: string;
  }) => Promise<{ user: User; accessToken: string; refreshToken: string }>;
  
  login: (data: {
    email?: string;
    username?: string;
    password: string;
  }) => Promise<{ user: User; accessToken: string; refreshToken: string }>;
  
  refreshToken: () => Promise<string>;
  
  updateProfile: (data: {
    avatarUrl?: string | null;
    bio?: string | null;
    status?: 'online' | 'offline' | 'away';
  }) => Promise<User>;
  
  getCurrentUser: () => Promise<User>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        }
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      logout: async () => {
        const { refreshToken } = get();
        
        // Call logout API if refresh token exists
        if (refreshToken) {
          try {
            await api.post('/api/auth/logout', { refreshToken });
          } catch (error) {
            console.error('Logout API error:', error);
            // Continue with local logout even if API call fails
          }
        }

        // Clear local storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),

      updateToken: (accessToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
        }
        set({ accessToken });
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await api.post<{
            user: User;
            accessToken: string;
            refreshToken: string;
          }>('/api/auth/register', data);

          get().setAuth(response.user, response.accessToken, response.refreshToken);
          set({ isLoading: false });
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      login: async (data) => {
        set({ isLoading: true });
        try {
          const response = await api.post<{
            user: User;
            accessToken: string;
            refreshToken: string;
          }>('/api/auth/login', data);

          get().setAuth(response.user, response.accessToken, response.refreshToken);
          set({ isLoading: false });
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      refreshToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await api.post<{ accessToken: string }>(
            '/api/auth/refresh',
            { refreshToken }
          );

          get().updateToken(response.accessToken);
          return response.accessToken;
        } catch (error) {
          // If refresh fails, logout
          await get().logout();
          throw error;
        }
      },

      updateProfile: async (data) => {
        try {
          const response = await api.put<{ user: User }>(
            '/api/auth/profile',
            data
          );

          get().updateUser(response.user);
          return response.user;
        } catch (error) {
          throw error;
        }
      },

      getCurrentUser: async () => {
        try {
          const response = await api.get<{ user: User }>('/api/auth/me');
          get().updateUser(response.user);
          return response.user;
        } catch (error) {
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        refreshToken: state.refreshToken,
        // Don't persist accessToken - it's short-lived
      }),
    }
  )
);
