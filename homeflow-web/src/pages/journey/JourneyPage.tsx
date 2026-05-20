import { useNavigate } from 'react-router-dom';
import { UserPlus, ChevronRight, TrendingUp } from 'lucide-react';
import { useJourneyStore } from '@/store/journeyStore';
import PipelineProgress from '@/components/common/PipelineProgress';
import { JOURNEY_STAGES } from '@/constants';

export default function JourneyPage() {
  const navigate = useNavigate();
  const { pipeline, getCompletionPercent } = useJourneyStore();

  if (!pipeline) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Loading your journey…</p>
      </div>
    );
  }

  const completionPct = getCompletionPercent();
  const currentStageInfo = JOURNEY_STAGES.find((s) => s.stage === pipeline.currentStage);
  const currentStageData = pipeline.stages.find((s) => s.stage === pipeline.currentStage);
  const pendingTasks = currentStageData?.tasks.filter((t) => !t.completed) ?? [];

  return (
    <div className="px-4 pt-4 pb-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-900">My Journey</h1>
        <p className="text-sm text-slate-500 mt-1">Track your home buying progress</p>
      </div>

      {/* Overall progress */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700">Overall Progress</span>
          <span className="font-bold text-brand-600">{completionPct}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          <TrendingUp size={13} className="text-brand-500" />
          <p className="text-xs text-slate-600">
            Currently in: <span className="font-semibold text-slate-900">{currentStageInfo?.label}</span>
          </p>
        </div>
      </div>

      {/* Next actions */}
      {pendingTasks.length > 0 && (
        <div>
          <h2 className="font-semibold text-slate-800 mb-3">Next Actions</h2>
          <div className="space-y-2">
            {pendingTasks.slice(0, 3).map((task) => (
              <button
                key={task.id}
                onClick={() => navigate(`/journey/stage/${pipeline.currentStage}`)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-warm-50 border border-warm-200 hover:border-brand-300 transition-all text-left"
              >
                <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                <span className="text-sm text-slate-800 flex-1">{task.title}</span>
                <ChevronRight size={15} className="text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stage pipeline */}
      <div>
        <h2 className="font-semibold text-slate-800 mb-3">All Stages</h2>
        <PipelineProgress pipeline={pipeline} />
      </div>

      {/* Connect agent */}
      {!pipeline.connectedAgentId && (
        <button
          onClick={() => navigate('/journey/connect-agent')}
          className="w-full card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center flex-shrink-0">
            <UserPlus size={22} className="text-brand-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">Connect with an Agent</p>
            <p className="text-xs text-slate-500 mt-0.5">Share your pipeline and collaborate in real-time</p>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </button>
      )}
    </div>
  );
}
