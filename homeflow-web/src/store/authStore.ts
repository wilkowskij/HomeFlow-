import { create } from 'zustand';
import type { AuthError, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { User, BuyerProfile, BuyingTimeline, PropertyType, PreApprovalStatus } from '../types';
import type { BuyerProfileRow, DbPropertyType } from '../types/database';

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapSupabaseUser(su: SupabaseUser): User {
  return {
    id: su.id,
    email: su.email ?? '',
    displayName:
      (su.user_metadata?.full_name as string | undefined) ??
      (su.user_metadata?.name as string | undefined) ??
      su.email?.split('@')[0] ??
      'User',
    avatarUrl: (su.user_metadata?.avatar_url as string | undefined) ?? undefined,
    createdAt: su.created_at,
    updatedAt: su.updated_at ?? su.created_at,
  };
}

const DB_TO_APP_PROPERTY_TYPE: Record<DbPropertyType, PropertyType> = {
  SINGLE_FAMILY: 'single-family',
  TOWNHOUSE: 'townhouse',
  CONDO: 'condo',
  MULTI_FAMILY: 'multi-family',
  LAND: 'land',
};

const PRE_APPROVAL_MAP: Record<string, PreApprovalStatus> = {
  NONE: 'none',
  IN_PROGRESS: 'in-progress',
  APPROVED: 'approved',
  EXPIRED: 'expired',
};

function mapDbProfileToApp(row: BuyerProfileRow): BuyerProfile {
  return {
    userId: row.user_id,
    locations: row.locations,
    budgetMin: row.budget_min,
    budgetMax: row.budget_max,
    timeline: row.timeline as BuyingTimeline,
    preferences: {
      bedsMin: row.bedrooms_min,
      bedsMax: row.bedrooms_max ?? undefined,
      bathsMin: row.bathrooms_min,
      propertyTypes: row.property_types.map((t) => DB_TO_APP_PROPERTY_TYPE[t]),
      mustHaves: row.must_haves,
      niceToHaves: [],
      requiresYard: row.must_haves.includes('Yard'),
    },
    preApprovalStatus: PRE_APPROVAL_MAP[row.pre_approval_status] ?? 'none',
    preApprovalAmount: row.pre_approval_amount ?? undefined,
    preApprovalDocUrl: row.pre_approval_doc ?? undefined,
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  profile: BuyerProfile | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  isLoading: boolean;

  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<AuthError | null>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<AuthError | null>;
  setProfile: (profile: BuyerProfile) => void;
  setOnboardingComplete: () => void;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;

  _handleSupabaseUser: (su: SupabaseUser | null) => Promise<void>;
}

let authSubscription: { unsubscribe: () => void } | null = null;

async function fetchBuyerProfile(userId: string): Promise<BuyerProfile | null> {
  const { data } = await supabase
    .from('buyer_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  const row = data as BuyerProfileRow | null;
  return row ? mapDbProfileToApp(row) : null;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  isLoading: true,

  _handleSupabaseUser: async (su) => {
    if (!su) {
      set({ user: null, profile: null, isAuthenticated: false, hasCompletedOnboarding: false, isLoading: false });
      return;
    }
    const user = mapSupabaseUser(su);
    const profile = await fetchBuyerProfile(su.id);
    set({
      user,
      profile,
      isAuthenticated: true,
      hasCompletedOnboarding: profile !== null,
      isLoading: false,
    });
  },

  initialize: async () => {
    authSubscription?.unsubscribe();

    const { data: { session } } = await supabase.auth.getSession();
    await get()._handleSupabaseUser(session?.user ?? null);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await get()._handleSupabaseUser(session?.user ?? null);
      },
    );
    authSubscription = subscription;
  },

  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  },

  signInWithApple: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: window.location.origin },
    });
  },

  signInWithEmail: async (email, password) => {
    set({ isLoading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) set({ isLoading: false });
    return error;
  },

  signUpWithEmail: async (email, password, displayName) => {
    set({ isLoading: true });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: displayName } },
    });
    if (error) set({ isLoading: false });
    return error;
  },

  setProfile: (profile) => set({ profile }),
  setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, isAuthenticated: false, hasCompletedOnboarding: false });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
