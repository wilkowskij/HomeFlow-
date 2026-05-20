import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useSearchStore } from '@/store/searchStore';
import PropertyCard from '@/components/common/PropertyCard';
import { cn, formatCurrency } from '@/utils/cn';
import type { Property } from '@/types';

type SortKey = 'saved' | 'price-asc' | 'price-desc' | 'match';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'saved', label: 'Date Saved' },
  { key: 'match', label: 'AI Match' },
  { key: 'price-asc', label: 'Price ↑' },
  { key: 'price-desc', label: 'Price ↓' },
];

function sortHomes(homes: Property[], sort: SortKey): Property[] {
  return [...homes].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    if (sort === 'match') return (b.aiInsights?.matchScore ?? 0) - (a.aiInsights?.matchScore ?? 0);
    return 0; // 'saved' — keep original insertion order
  });
}

export default function SavedHomesPage() {
  const navigate = useNavigate();
  const { savedHomes, savedPrices, compareList, toggleCompare } = useSearchStore();

  // Detect price drops
  const priceDrops = savedHomes.filter((p) => {
    const savedAt = savedPrices[p.id];
    return savedAt && p.price < savedAt;
  });
  const [sort, setSort] = useState<SortKey>('saved');
  const [showSort, setShowSort] = useState(false);

  const sorted = sortHomes(savedHomes, sort);

  if (savedHomes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center mb-4">
          <Heart size={28} className="text-pink-400" />
        </div>
        <h2 className="font-display font-bold text-xl text-slate-900 mb-2">No saved homes yet</h2>
        <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
          Tap the heart on any property to save it here for easy comparison and scheduling.
        </p>
        <button onClick={() => navigate('/search')} className="btn-primary mt-6">
          Browse Homes
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Saved Homes</h1>
          <p className="text-sm text-slate-500 mt-0.5">{savedHomes.length} {savedHomes.length === 1 ? 'home' : 'homes'} saved</p>
        </div>
        <button
          onClick={() => setShowSort((v) => !v)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all',
            showSort ? 'bg-brand-50 border-brand-300 text-brand-700' : 'bg-white border-warm-200 text-slate-600',
          )}
        >
          <ArrowUpDown size={13} />
          Sort
        </button>
      </div>

      {/* Sort chips */}
      {showSort && (
        <div className="flex gap-2 mb-4 flex-wrap animate-fade-in">
          {SORT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setSort(key); setShowSort(false); }}
              className={cn(
                'badge py-1.5 transition-all',
                sort === key ? 'bg-brand-500 text-white' : 'bg-warm-100 text-slate-600',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Price drop alerts */}
      {priceDrops.length > 0 && (
        <div className="mb-4 p-4 rounded-2xl bg-green-50 border border-green-200 animate-slide-up">
          <p className="text-sm font-semibold text-green-800 mb-2">
            🎉 {priceDrops.length} price {priceDrops.length === 1 ? 'drop' : 'drops'} on your saved homes
          </p>
          {priceDrops.map((p) => {
            const savedAt = savedPrices[p.id]!;
            const drop = savedAt - p.price;
            return (
              <p key={p.id} className="text-xs text-green-700">
                {p.address.street} dropped {formatCurrency(drop, true)} → now {formatCurrency(p.price, true)}
              </p>
            );
          })}
        </div>
      )}

      {/* Compare CTA */}
      {compareList.length >= 2 && (
        <button
          onClick={() => navigate('/search/compare')}
          className="w-full mb-4 p-3 rounded-xl bg-brand-600 text-white text-sm font-semibold flex items-center justify-center gap-2 animate-slide-up"
        >
          <SlidersHorizontal size={15} />
          Compare {compareList.length} selected homes
        </button>
      )}

      {/* Filter chips */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {['All', 'Under $500K', '$500K–$700K', '$700K+'].map((f) => (
          <button
            key={f}
            className="badge py-1.5 bg-warm-100 text-slate-600 whitespace-nowrap flex-shrink-0"
          >
            {f}
          </button>
        ))}
      </div>

      {/* Homes grid */}
      <div className="space-y-4">
        {sorted.map((property) => (
          <div key={property.id} className="relative">
            <PropertyCard property={property} />
            {/* Compare toggle */}
            <button
              onClick={() => toggleCompare(property.id)}
              className={cn(
                'absolute top-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all',
                compareList.includes(property.id)
                  ? 'bg-brand-600 text-white'
                  : 'bg-black/40 text-white backdrop-blur-sm',
              )}
            >
              {compareList.includes(property.id) ? '✓ Comparing' : '+ Compare'}
            </button>
          </div>
        ))}
      </div>

      {/* Plan tour CTA */}
      {savedHomes.length >= 2 && (
        <button
          onClick={() => navigate('/schedule/itinerary')}
          className="w-full mt-6 btn-primary flex items-center justify-center gap-2"
        >
          <Heart size={16} />
          Plan a viewing tour with these homes
        </button>
      )}
    </div>
  );
}
