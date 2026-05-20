import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Route, X } from 'lucide-react';
import { useSearchStore } from '@/store/searchStore';
import { useScheduleStore } from '@/store/scheduleStore';
import PropertyCard from '@/components/common/PropertyCard';
import { formatCurrency } from '@/utils/cn';
import toast from 'react-hot-toast';

export default function ItineraryBuilderPage() {
  const navigate = useNavigate();
  const { savedHomes } = useSearchStore();
  const {
    pendingItineraryPropertyIds,
    addToItineraryBuilder,
    removeFromItineraryBuilder,
    clearItineraryBuilder,
  } = useScheduleStore();

  const selectedProperties = savedHomes.filter((p) =>
    pendingItineraryPropertyIds.includes(p.id),
  );
  const availableToAdd = savedHomes.filter(
    (p) => !pendingItineraryPropertyIds.includes(p.id),
  );

  const handleOptimize = () => {
    if (selectedProperties.length < 2) {
      toast.error('Select at least 2 properties to optimize your route.');
      return;
    }
    toast.success('Route optimized! Booking all slots…');
    clearItineraryBuilder();
    navigate('/schedule');
  };

  return (
    <div className="px-4 pt-4 pb-32">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-warm-100 rounded-xl">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display font-bold text-xl">Tour Builder</h1>
          <p className="text-xs text-slate-500">Select up to 5 homes for an optimized route</p>
        </div>
      </div>

      {/* Selected properties */}
      {selectedProperties.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">
            Selected ({selectedProperties.length}/5)
          </h2>
          <div className="space-y-2">
            {selectedProperties.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 border border-brand-100">
                <div className="w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{p.address.street}</p>
                  <p className="text-xs text-slate-500">{formatCurrency(p.price, true)}</p>
                </div>
                <button onClick={() => removeFromItineraryBuilder(p.id)}>
                  <X size={15} className="text-slate-400 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>

          {/* Route preview */}
          <div className="mt-3 p-3 rounded-xl bg-warm-50 flex items-center gap-2">
            <Route size={14} className="text-brand-500" />
            <p className="text-xs text-slate-600">
              <span className="font-semibold">Estimated tour:</span> ~2h 15min · 18 miles
            </p>
          </div>
        </div>
      )}

      {/* Available homes */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">
          {savedHomes.length > 0 ? 'Your saved homes' : 'Recommended homes'}
        </h2>
        <div className="space-y-3">
          {availableToAdd.map((p) => (
            <div key={p.id} className="relative">
              <PropertyCard property={p} variant="compact" />
              <button
                onClick={() => {
                  if (pendingItineraryPropertyIds.length >= 5) {
                    toast.error('Maximum 5 properties per tour.');
                    return;
                  }
                  addToItineraryBuilder(p.id);
                }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-sm"
              >
                <Plus size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed CTA */}
      {selectedProperties.length >= 2 && (
        <div className="fixed bottom-[64px] left-0 right-0 px-4 pb-4 glass border-t border-warm-200 pt-3">
          <div className="max-w-lg mx-auto">
            <button onClick={handleOptimize} className="btn-primary w-full flex items-center justify-center gap-2">
              <Route size={17} />
              Optimize Route & Book All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
