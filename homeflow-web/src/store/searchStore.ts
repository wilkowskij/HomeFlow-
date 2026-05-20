import { create } from 'zustand';
import type { Property, SearchFilters } from '@homeflow/shared';
import { MAX_SAVED_HOMES_MVP } from '@homeflow/shared';

interface SearchState {
  filters: SearchFilters;
  savedHomes: Property[];
  compareList: string[]; // property IDs (max 3)
  viewedProperties: string[];
  lastQuery: string;

  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  saveHome: (property: Property) => boolean; // returns false if at limit
  unsaveHome: (id: string) => void;
  isSaved: (id: string) => boolean;
  toggleCompare: (id: string) => void;
  isInCompare: (id: string) => boolean;
  clearCompare: () => void;
  markViewed: (id: string) => void;
  setLastQuery: (q: string) => void;
}

const DEFAULT_FILTERS: SearchFilters = {
  sortBy: 'match-score',
  page: 1,
  pageSize: 20,
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

  saveHome: (property) => {
    const { savedHomes } = get();
    if (savedHomes.length >= MAX_SAVED_HOMES_MVP) return false;
    if (savedHomes.some((h) => h.id === property.id)) return true;
    set({ savedHomes: [...savedHomes, property] });
    return true;
  },

  unsaveHome: (id) =>
    set((state) => ({
      savedHomes: state.savedHomes.filter((h) => h.id !== id),
      compareList: state.compareList.filter((cid) => cid !== id),
    })),

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
