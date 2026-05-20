import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, Calendar, ArrowRight, MapPin } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useJourneyStore } from '@/store/journeyStore';
import { useSearchStore } from '@/store/searchStore';
import PropertyCard from '@/components/common/PropertyCard';
import PipelineProgress from '@/components/common/PipelineProgress';
import { JOURNEY_STAGES } from '@homeflow/shared';

// Mock recommended properties – replace with real API data
import { MOCK_PROPERTIES } from '@/utils/mockData';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const { pipeline } = useJourneyStore();
  const { savedHomes } = useSearchStore();

  const currentStageInfo = pipeline
    ? JOURNEY_STAGES.find((s) => s.stage === pipeline.currentStage)
    : null;

  const firstName = user?.displayName?.split(' ')[0] ?? 'there';

  return (
    <div className="px-4 pt-4 pb-6 space-y-6">
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

      {/* Market heat card */}
      <div className="relative overflow-hidden rounded-2xl gradient-brand p-5 text-white">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={15} className="text-white/80" />
            <span className="text-white/80 text-xs font-medium uppercase tracking-wide">Market pulse</span>
          </div>
          <p className="font-display font-bold text-3xl">🔥 Hot</p>
          <p className="text-white/80 text-sm mt-1">
            Monmouth County — 23% of homes selling above ask
          </p>
          <button
            onClick={() => navigate('/search')}
            className="mt-3 flex items-center gap-1 text-white text-sm font-semibold hover:gap-2 transition-all"
          >
            Browse homes <ArrowRight size={14} />
          </button>
        </div>
      </div>

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
          { label: 'Saved', value: savedHomes.length, color: 'bg-pink-50 text-pink-600' },
          { label: 'Viewings', value: 0, color: 'bg-purple-50 text-purple-600' },
          { label: 'Searches', value: 3, color: 'bg-amber-50 text-amber-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`card p-4 text-center ${color}`}>
            <p className="font-display font-bold text-2xl">{value}</p>
            <p className="text-xs font-medium opacity-70 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* AI recommendations */}
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
          {MOCK_PROPERTIES.slice(0, 3).map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>

      {/* Schedule CTA */}
      <div
        className="card p-5 flex items-center gap-4 cursor-pointer hover:shadow-card-hover transition-shadow"
        onClick={() => navigate('/schedule/itinerary')}
      >
        <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <Calendar size={22} className="text-indigo-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-900">Plan a viewing day</p>
          <p className="text-xs text-slate-500 mt-0.5">AI-optimized multi-property routes</p>
        </div>
        <ArrowRight size={18} className="text-slate-400" />
      </div>
    </div>
  );
}
