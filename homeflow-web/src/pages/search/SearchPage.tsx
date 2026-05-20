import { useState, useCallback } from 'react';
import { SlidersHorizontal, Map, List, Search, X, Sparkles } from 'lucide-react';
import PropertyCard from '@/components/common/PropertyCard';
import { useSearchStore } from '@/store/searchStore';
import { cn, debounce } from '@/utils/cn';
import { MOCK_PROPERTIES } from '@/utils/mockData';
import type { PropertyType } from '@homeflow/shared';

type ViewMode = 'list' | 'map';

const PRICE_PRESETS = [
  { label: 'Under $400K', max: 400000 },
  { label: '$400K–$600K', min: 400000, max: 600000 },
  { label: '$600K–$800K', min: 600000, max: 800000 },
  { label: '$800K+', min: 800000 },
];

export default function SearchPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [localQuery, setLocalQuery] = useState('');
  const { filters, setFilters, savedHomes } = useSearchStore();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((q: string) => setFilters({ query: q }), 400),
    [],
  );

  const handleQueryChange = (q: string) => {
    setLocalQuery(q);
    debouncedSearch(q);
  };

  // Filter mock data based on filters
  const results = MOCK_PROPERTIES.filter((p) => {
    if (filters.priceMax && p.price > filters.priceMax) return false;
    if (filters.priceMin && p.price < filters.priceMin) return false;
    if (filters.bedsMin && p.beds < filters.bedsMin) return false;
    if (
      filters.query &&
      !p.address.formattedAddress.toLowerCase().includes(filters.query.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="flex flex-col h-[calc(100dvh-128px)]">
      {/* Search bar */}
      <div className="px-4 pt-4 pb-3 bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-100 mb-3">
          <Search size={17} className="text-slate-400 flex-shrink-0" />
          <input
            className="flex-1 bg-transparent text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none"
            placeholder="3 bed under $550k near train station..."
            value={localQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
          />
          {localQuery && (
            <button onClick={() => { setLocalQuery(''); setFilters({ query: undefined }); }}>
              <X size={15} className="text-slate-400" />
            </button>
          )}
        </div>

        {/* Toolbar row */}
        <div className="flex items-center gap-2">
          {/* Filter button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all',
              showFilters
                ? 'bg-brand-50 border-brand-300 text-brand-700'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300',
            )}
          >
            <SlidersHorizontal size={13} />
            Filters
          </button>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 ml-auto">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500',
              )}
            >
              <List size={13} /> List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500',
              )}
            >
              <Map size={13} /> Map
            </button>
          </div>
        </div>

        {/* Filter chips */}
        {showFilters && (
          <div className="mt-3 space-y-3 animate-slide-up">
            {/* Price presets */}
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Price range</p>
              <div className="flex gap-2 flex-wrap">
                {PRICE_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setFilters({ priceMin: p.min, priceMax: p.max })}
                    className={cn(
                      'badge py-1.5 transition-all',
                      filters.priceMin === p.min && filters.priceMax === p.max
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-100 text-slate-600',
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Beds */}
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Min bedrooms</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setFilters({ bedsMin: filters.bedsMin === n ? undefined : n })}
                    className={cn(
                      'w-9 h-9 rounded-xl text-sm font-semibold transition-all',
                      filters.bedsMin === n
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-100 text-slate-600',
                    )}
                  >
                    {n}+
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Smart Matches banner */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-50 border border-purple-100">
          <Sparkles size={15} className="text-purple-500 flex-shrink-0" />
          <p className="text-xs text-purple-700">
            <span className="font-semibold">AI Match Active</span> — showing homes ranked by your profile
          </p>
        </div>
      </div>

      {/* Results */}
      {viewMode === 'list' ? (
        <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-4 pb-4">
          <p className="text-xs text-slate-400 font-medium">
            {results.length} homes found
          </p>

          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-4xl mb-3">🏠</div>
              <h3 className="font-semibold text-slate-800">No matches found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xs">
                Try expanding your criteria or adjusting your filters.
              </p>
              <button
                onClick={() => setFilters({ priceMin: undefined, priceMax: undefined, bedsMin: undefined })}
                className="mt-4 btn-secondary text-sm py-2 px-4"
              >
                Clear filters
              </button>
            </div>
          ) : (
            results.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))
          )}
        </div>
      ) : (
        <div className="flex-1 bg-slate-200 flex items-center justify-center">
          <div className="text-center text-slate-500">
            <Map size={32} className="mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-medium">Map view</p>
            <p className="text-xs mt-1">Integrate Google Maps API here</p>
          </div>
        </div>
      )}
    </div>
  );
}
