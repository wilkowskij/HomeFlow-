import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Plus, Clock, ChevronRight, Route } from 'lucide-react';
import { useScheduleStore } from '@/store/scheduleStore';
import { format } from 'date-fns';
import { cn } from '@/utils/cn';

export default function SchedulePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const { appointments } = useScheduleStore();

  const upcoming = appointments.filter(
    (a) => a.status !== 'cancelled' && a.slot?.startTime && a.slot.startTime > new Date().toISOString(),
  );

  return (
    <div className="px-4 pt-4 pb-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Schedule</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your home viewings</p>
        </div>
        <button
          onClick={() => navigate('/schedule/itinerary')}
          className="flex items-center gap-1.5 btn-primary text-sm py-2"
        >
          <Plus size={15} />
          Plan Day
        </button>
      </div>

      {/* Quick action if coming from property */}
      {propertyId && (
        <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 animate-slide-up">
          <p className="font-semibold text-slate-900 mb-3">Schedule viewing for this property</p>
          <div className="space-y-2">
            {['Today 2:00 PM', 'Tomorrow 10:00 AM', 'Saturday 1:00 PM'].map((slot) => (
              <button
                key={slot}
                className="w-full flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-brand-50 transition-colors border border-slate-100"
              >
                <Clock size={15} className="text-brand-500" />
                <span className="text-sm font-medium text-slate-900">{slot}</span>
                <ChevronRight size={15} className="text-slate-400 ml-auto" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Itinerary builder promo */}
      <button
        onClick={() => navigate('/schedule/itinerary')}
        className="w-full card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow text-left"
      >
        <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <Route size={22} className="text-indigo-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-900">Multi-property Tour Builder</p>
          <p className="text-xs text-slate-500 mt-0.5">AI-optimized route for up to 5 homes</p>
        </div>
        <ChevronRight size={18} className="text-slate-400" />
      </button>

      {/* Upcoming appointments */}
      <div>
        <h2 className="font-semibold text-slate-800 mb-3">Upcoming Viewings</h2>
        {upcoming.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="font-medium text-slate-600">No viewings scheduled yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Browse homes and tap "Schedule Viewing" to get started.
            </p>
            <button
              onClick={() => navigate('/search')}
              className="btn-secondary mt-4 text-sm"
            >
              Browse Homes
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((appt) => (
              <button
                key={appt.id}
                onClick={() => navigate(`/schedule/appointment/${appt.id}`)}
                className="card card-hover p-4 w-full text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <Calendar size={20} className="text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">
                      {appt.property?.address.street ?? 'Property'}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock size={11} />
                        {appt.slot?.startTime
                          ? format(new Date(appt.slot.startTime), 'MMM d, h:mm a')
                          : '—'}
                      </span>
                      <span
                        className={cn(
                          'badge text-[10px]',
                          appt.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700',
                        )}
                      >
                        {appt.status}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
