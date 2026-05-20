import { useNavigate } from 'react-router-dom';
import { Sparkles, Calendar, ArrowRight, MapPin, Heart, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useJourneyStore } from '@/store/journeyStore';
import { useSearchStore } from '@/store/searchStore';
import { useScheduleStore } from '@/store/scheduleStore';
import PropertyCard from '@/components/common/PropertyCard';
import PipelineProgress from '@/components/common/PipelineProgress';
import { JOURNEY_STAGES } from '@/constants';
import { useProperties } from '@/hooks/useProperties';
import { cn } from '@/utils/cn';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const { pipeline } = useJourneyStore();
  const { savedHomes } = useSearchStore();
  const { appointments } = useScheduleStore();
  const { data: recommended = [] } = useProperties({ pageSize: 3, sortBy: 'match-score' }, user?.id);

  const currentStageInfo = pipeline
    ? JOURNEY_STAGES.find((s) => s.stage === pipeline.currentStage)
    : null;

  const firstName = user?.displayName?.split(' ')[0] ?? 'there';
  const preApproval = profile?.preApprovalStatus ?? 'none';
  const upcomingAppts = appointments.filter(
    (a) => a.status !== 'CANCELLED' && a.slot?.startTime && a.slot.startTime > new Date().toISOString(),
  );

  // Determine which hero CTA to show
  const heroVariant = (() => {
    if (preApproval === 'none') return 'preapproval';
    if (savedHomes.length === 0) return 'search';
    if (upcomingAppts.length === 0) return 'schedule';
    return 'viewings';
  })();

  return (
    <div className="px-4 pt-4 pb-6 space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-900">
          Hey, {firstName} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {profile?.locations[0]
            ? `Searching in ${profile.locations[0]}`
            : "Let's find your perfect home"}
        </p>
      </div>

      {/* ── Stage-aware Hero CTA ── */}

      {/* No pre-approval */}
      {heroVariant === 'preapproval' && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Get pre-approved first</p>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                Pre-approved buyers win more offers and close 30% faster. It takes about 5 minutes to start.
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => navigate('/journey')}
              className="btn-primary text-sm py-2.5"
            >
              Start Pre-Approval
            </button>
            <button
              onClick={() => navigate('/search')}
              className="py-2.5 rounded-xl border-2 border-amber-200 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
            >
              Browse Anyway
            </button>
          </div>
        </div>
      )}

      {/* Pre-approved, no saved homes */}
      {heroVariant === 'search' && (
        <div className="relative overflow-hidden rounded-2xl gradient-brand p-5 text-white">
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle2 size={14} className="text-white/80" />
              <span className="text-white/80 text-xs font-medium uppercase tracking-wide">Pre-approved ✓</span>
            </div>
            <p className="font-display font-bold text-2xl leading-tight mb-1">Start your search</p>
            <p className="text-white/80 text-sm">
              AI-matched homes based on your budget and preferences
            </p>
            <button
              onClick={() => navigate('/search')}
              className="mt-4 flex items-center gap-1.5 bg-white text-brand-700 text-sm font-bold px-4 py-2 rounded-xl hover:bg-white/90 transition-colors"
            >
              Browse Homes <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Has saved homes, no viewings scheduled */}
      {heroVariant === 'schedule' && (
        <div className="card p-5 border-brand-200 bg-brand-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-100 flex items-center justify-center flex-shrink-0">
              <Heart size={18} className="text-brand-600 fill-brand-200" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                You've saved {savedHomes.length} {savedHomes.length === 1 ? 'home' : 'homes'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Ready to schedule your viewings?</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => navigate('/schedule/itinerary')}
              className="btn-primary text-sm py-2.5 flex items-center justify-center gap-1.5"
            >
              <Calendar size={14} />
              Plan Tour Day
            </button>
            <button
              onClick={() => navigate('/saved')}
              className="py-2.5 rounded-xl border-2 border-brand-200 text-sm font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
            >
              View Saved
            </button>
          </div>
        </div>
      )}

      {/* Has upcoming viewings */}
      {heroVariant === 'viewings' && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-slate-900">Upcoming Viewings</p>
            <button onClick={() => navigate('/schedule')} className="text-xs text-brand-600 font-semibold">
              View all →
            </button>
          </div>
          <div className="space-y-2">
            {upcomingAppts.slice(0, 2).map((appt) => (
              <button
                key={appt.id}
                onClick={() => navigate(`/schedule/appointment/${appt.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-warm-50 border border-warm-200 hover:border-brand-200 transition-all text-left"
              >
                <Calendar size={15} className="text-brand-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {appt.property?.address.street ?? 'Viewing'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {appt.slot?.startTime
                      ? new Date(appt.slot.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                      : '—'}
                  </p>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Journey progress */}
      {pipeline && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-900">My Journey</h2>
            <button
              onClick={() => navigate('/journey')}
              className="text-xs text-brand-600 font-semibold hover:text-brand-700"
            >
              View all →
            </button>
          </div>

          {currentStageInfo && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 border border-brand-100 mb-3">
              <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                <MapPin size={16} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-brand-600 font-semibold uppercase tracking-wide">Current stage</p>
                <p className="font-semibold text-slate-900 text-sm">{currentStageInfo.label}</p>
              </div>
            </div>
          )}

          <PipelineProgress pipeline={pipeline} compact />
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Saved', value: savedHomes.length, color: 'bg-pink-50 text-pink-600', path: '/saved' },
          { label: 'Viewings', value: upcomingAppts.length, color: 'bg-purple-50 text-purple-600', path: '/schedule' },
          { label: 'Searches', value: recommended.length, color: 'bg-amber-50 text-amber-600', path: '/search' },
        ].map(({ label, value, color, path }) => (
          <button key={label} onClick={() => navigate(path)} className={cn('card p-4 text-center', color)}>
            <p className="font-display font-bold text-2xl">{value}</p>
            <p className="text-xs font-medium opacity-70 mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* AI recommendations */}
      {recommended.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Sparkles size={16} className="text-brand-500" />
              <h2 className="font-semibold text-slate-900">Recommended for you</h2>
            </div>
            <button
              onClick={() => navigate('/search')}
              className="text-xs text-brand-600 font-semibold hover:text-brand-700"
            >
              See all →
            </button>
          </div>

          <div className="space-y-4">
            {recommended.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
