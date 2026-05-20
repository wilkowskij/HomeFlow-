import { X, Calendar, Route, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useScheduleStore } from '@/store/scheduleStore';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface ScheduleModalProps {
  propertyId: string;
  propertyAddress: string;
  onClose: () => void;
}

// Generate the next 3 realistic time slots
function getSlots() {
  const now = new Date();
  const slots: { label: string; datetime: string }[] = [];
  const d = new Date(now);
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  slots.push({ label: `Tomorrow, ${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at 10:00 AM`, datetime: d.toISOString() });
  const d2 = new Date(now);
  d2.setDate(d2.getDate() + 1);
  d2.setHours(14, 0, 0, 0);
  slots.push({ label: `Tomorrow, ${d2.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at 2:00 PM`, datetime: d2.toISOString() });
  // next Saturday
  const d3 = new Date(now);
  const daysUntilSat = (6 - d3.getDay() + 7) % 7 || 7;
  d3.setDate(d3.getDate() + daysUntilSat);
  d3.setHours(11, 0, 0, 0);
  slots.push({ label: `${d3.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at 11:00 AM`, datetime: d3.toISOString() });
  return slots;
}

export default function ScheduleModal({ propertyId, propertyAddress, onClose }: ScheduleModalProps) {
  const navigate = useNavigate();
  const { addToItineraryBuilder, pendingItineraryPropertyIds } = useScheduleStore();
  const slots = getSlots();
  const inBuilder = pendingItineraryPropertyIds.includes(propertyId);

  const handleSlot = (_datetime: string) => {
    // For MVP: navigate to schedule page with slot pre-selected
    toast.success('Viewing requested! Check your Schedule tab.');
    onClose();
    navigate('/schedule');
  };

  const handleAddToTour = () => {
    addToItineraryBuilder(propertyId);
    toast.success('Added to tour builder!');
    onClose();
    navigate('/schedule/itinerary');
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40 animate-fade-in" onClick={onClose} />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1C1C1C] border-t border-warm-300 rounded-t-3xl shadow-2xl animate-slide-up max-w-lg mx-auto">
        <div className="px-5 pt-5 pb-8">
          {/* Handle */}
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900">Schedule Viewing</h2>
              <p className="text-sm text-slate-500 mt-0.5 truncate max-w-[240px]">{propertyAddress}</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl">
              <X size={18} className="text-slate-500" />
            </button>
          </div>

          {/* Option A: Quick single slots */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Available slots
            </p>
            <div className="space-y-2">
              {slots.map((slot) => (
                <button
                  key={slot.datetime}
                  onClick={() => handleSlot(slot.datetime)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-warm-200 hover:border-brand-300 hover:bg-brand-50 transition-all text-left"
                >
                  <Clock size={15} className="text-brand-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-900">{slot.label}</span>
                  <Calendar size={13} className="text-slate-300 ml-auto" />
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Option B: Add to tour builder */}
          <button
            onClick={handleAddToTour}
            disabled={inBuilder}
            className={cn(
              'w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left',
              inBuilder
                ? 'border-brand-200 bg-brand-50 opacity-70 cursor-not-allowed'
                : 'border-brand-300 hover:bg-brand-50',
            )}
          >
            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
              <Route size={16} className="text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {inBuilder ? '✓ Added to Tour Builder' : 'Add to multi-home tour'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                AI-optimized route for up to 5 homes in one day
              </p>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
