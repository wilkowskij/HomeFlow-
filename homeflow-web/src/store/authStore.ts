import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, BuyerProfile } from '@homeflow/shared';

interface AuthState {
  user: User | null;
  profile: BuyerProfile | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User) => void;
  setProfile: (profile: BuyerProfile) => void;
  setOnboardingComplete: () => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: true }),
      setProfile: (profile) => set({ profile }),
      setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
      logout: () =>
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          hasCompletedOnboarding: false,
        }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'homeflow-auth',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    },
  ),
);
