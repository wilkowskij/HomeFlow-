import { create } from 'zustand';
import type { Property, SearchFilters } from '../types';
import { MAX_SAVED_HOMES_MVP } from '../constants';
import { supabase } from '../lib/supabase';
import { mapDbPropertyToApp } from '../lib/mappers';

interface SearchState {
  filters: SearchFilters;
  savedHomes: Property[];
  compareList: string[];
  viewedProperties: string[];
  lastQuery: string;

  // filters
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;

  // saved homes (Supabase-backed)
  fetchSavedHomes: (userId: string) => Promise<void>;
  saveHome: (property: Property, userId: string) => Promise<boolean>;
  unsaveHome: (id: string, userId: string) => Promise<void>;
  isSaved: (id: string) => boolean;

  // compare (local session only)
  toggleCompare: (id: string) => void;
  isInCompare: (id: string) => boolean;
  clearCompare: () => void;

  markViewed: (id: string) => void;
  setLastQuery: (q: string) => void;
}

const DEFAULT_FILTERS: SearchFilters = {
  sortBy: 'match-score',
  page: 1,
  pageSize: 40,
};

export const useSearchStore = create<SearchState>()((set, get) => ({
  filters: DEFAULT_FILTERS,
  savedHomes: [],
  compareList: [],
  viewedProperties: [],
  lastQuery: '',

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: 1 },
    })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  fetchSavedHomes: async (userId) => {
    const { data: rawData } = await supabase
      .from('saved_homes')
      .select('*, properties(*)')
      .eq('user_id', userId);

    if (!rawData) return;
    const homes = rawData
      .map((row) => {
        const prop = (row as { properties: unknown }).properties;
        if (!prop || typeof prop !== 'object') return null;
        return mapDbPropertyToApp(prop as Parameters<typeof mapDbPropertyToApp>[0]);
      })
      .filter((p): p is Property => p !== null);

    set({ savedHomes: homes });
  },

  saveHome: async (property, userId) => {
    const { savedHomes } = get();
    if (savedHomes.length >= MAX_SAVED_HOMES_MVP) return false;
    if (savedHomes.some((h) => h.id === property.id)) return true;

    const { error } = await supabase
      .from('saved_homes')
      .insert({ user_id: userId, property_id: property.id });

    if (!error) {
      set({ savedHomes: [...savedHomes, property] });
    }
    return !error;
  },

  unsaveHome: async (id, userId) => {
    await supabase
      .from('saved_homes')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', id);

    set((state) => ({
      savedHomes: state.savedHomes.filter((h) => h.id !== id),
      compareList: state.compareList.filter((cid) => cid !== id),
    }));
  },

  isSaved: (id) => get().savedHomes.some((h) => h.id === id),

  toggleCompare: (id) => {
    const { compareList } = get();
    if (compareList.includes(id)) {
      set({ compareList: compareList.filter((cid) => cid !== id) });
    } else if (compareList.length < 3) {
      set({ compareList: [...compareList, id] });
    }
  },

  isInCompare: (id) => get().compareList.includes(id),
  clearCompare: () => set({ compareList: [] }),

  markViewed: (id) =>
    set((state) => ({
      viewedProperties: state.viewedProperties.includes(id)
        ? state.viewedProperties
        : [...state.viewedProperties, id],
    })),

  setLastQuery: (lastQuery) => set({ lastQuery }),
}));
