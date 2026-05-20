import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Phone, CheckSquare, Star, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { useScheduleStore } from '@/store/scheduleStore';
import { format, isPast } from 'date-fns';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

const CHECKLIST = [
  'Check curb appeal and exterior condition',
  'Inspect roof visible from outside',
  'Test all light switches',
  'Run water in sinks, check pressure',
  'Check HVAC system age and condition',
  'Open/close all windows and doors',
  'Look for signs of water damage or mold',
  'Take photos of key areas',
];

type Verdict = 'yes' | 'maybe' | 'no' | null;

const VERDICT_OPTIONS: { key: Verdict; icon: typeof ThumbsUp; label: string; desc: string; color: string }[] = [
  { key: 'yes', icon: ThumbsUp, label: "It's the one!", desc: 'Start offer preparation', color: 'border-green-400 bg-green-50 text-green-700' },
  { key: 'maybe', icon: Minus, label: 'Could be…', desc: 'Compare with other saves', color: 'border-amber-400 bg-amber-50 text-amber-700' },
  { key: 'no', icon: ThumbsDown, label: 'Not for me', desc: 'Remove and find better matches', color: 'border-red-300 bg-red-50 text-red-600' },
];

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { appointments, updateAppointment, cancelAppointment } = useScheduleStore();
  const appt = appointments.find((a) => a.id === id);

  const [verdict, setVerdict] = useState<Verdict>(null);

  if (!appt) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Appointment not found.</p>
      </div>
    );
  }

  const isViewed = appt.slot?.startTime ? isPast(new Date(appt.slot.startTime)) : false;

  const handleCancel = () => {
    cancelAppointment(appt.id);
    toast.success('Appointment cancelled.');
    navigate(-1);
  };

  const handleVerdict = (v: Verdict) => {
    setVerdict(v);
    if (v === 'yes') {
      toast.success("Let's start your offer prep!");
      navigate('/journey');
    } else if (v === 'maybe') {
      navigate('/search/compare');
    } else if (v === 'no') {
      toast('Home removed from saved.', { icon: '👋' });
      navigate('/saved');
    }
  };

  return (
    <div className="px-4 pt-4 pb-8">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-display font-bold text-xl">Viewing Details</h1>
      </div>

      {/* Status */}
      <div
        className={cn(
          'badge text-sm py-2 px-4 mb-5',
          isViewed
            ? 'bg-slate-100 text-slate-600'
            : appt.status === 'CONFIRMED'
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700',
        )}
      >
        {isViewed ? '✓ Viewed' : appt.status === 'CONFIRMED' ? '✓ Confirmed' : '⏳ Pending Confirmation'}
      </div>

      {/* Details card */}
      <div className="card p-5 space-y-4 mb-5">
        <div className="flex items-start gap-3">
          <MapPin size={18} className="text-brand-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-slate-900">
              {appt.property?.address.street ?? 'Property Address'}
            </p>
            <p className="text-sm text-slate-500">
              {appt.property?.address.city}, {appt.property?.address.state}
            </p>
          </div>
        </div>

        {appt.slot?.startTime && (
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-brand-500 flex-shrink-0" />
            <p className="text-slate-900">
              {format(new Date(appt.slot.startTime), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
        )}

        {appt.slot?.startTime && (
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-brand-500 flex-shrink-0" />
            <p className="text-slate-900">
              {format(new Date(appt.slot.startTime), 'h:mm a')}
              {appt.slot.endTime && ` – ${format(new Date(appt.slot.endTime), 'h:mm a')}`}
            </p>
          </div>
        )}

        {appt.agentContact && (
          <div className="flex items-center gap-3">
            <Phone size={18} className="text-brand-500 flex-shrink-0" />
            <div>
              <p className="text-slate-900 font-medium">{appt.agentContact.name}</p>
              <p className="text-sm text-slate-500">{appt.agentContact.phone}</p>
            </div>
          </div>
        )}
      </div>

      {/* POST-VIEWING: verdict + rating */}
      {isViewed ? (
        <>
          {/* Star rating */}
          <div className="card p-5 mb-5">
            <h2 className="font-semibold text-slate-900 mb-3">Rate this home</h2>
            <div className="flex gap-2 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => updateAppointment(appt.id, { rating: star })}
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                    (appt.rating ?? 0) >= star
                      ? 'bg-amber-100 text-amber-500'
                      : 'bg-slate-100 text-slate-300',
                  )}
                >
                  <Star size={18} fill={(appt.rating ?? 0) >= star ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          {/* Decision card */}
          <div className="card p-5 mb-5">
            <h2 className="font-semibold text-slate-900 mb-1">Your verdict?</h2>
            <p className="text-xs text-slate-500 mb-4">Be honest — this helps us refine your matches.</p>
            <div className="space-y-2">
              {VERDICT_OPTIONS.map(({ key, icon: Icon, label, desc, color }) => (
                <button
                  key={key}
                  onClick={() => handleVerdict(key)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all',
                    verdict === key ? color : 'border-warm-200 hover:border-slate-300',
                  )}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs opacity-70">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* PRE-VIEWING: prep checklist */}
          <div className="card p-5 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckSquare size={16} className="text-brand-500" />
              <h2 className="font-semibold text-slate-900">Prep Checklist</h2>
            </div>
            <div className="space-y-2">
              {CHECKLIST.map((item, i) => (
                <label key={i} className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 accent-brand-500" />
                  <span className="text-sm text-slate-700">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cancel */}
          <button
            onClick={handleCancel}
            className="w-full py-3 rounded-xl border-2 border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            Cancel Appointment
          </button>
        </>
      )}
    </div>
  );
}
