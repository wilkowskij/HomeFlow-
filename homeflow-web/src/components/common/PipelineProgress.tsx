import { CheckCircle2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { JOURNEY_STAGES } from '@/constants';
import type { JourneyPipeline } from '@/types';
import { cn } from '@/utils/cn';

interface PipelineProgressProps {
  pipeline: JourneyPipeline;
  compact?: boolean;
}

export default function PipelineProgress({ pipeline, compact = false }: PipelineProgressProps) {
  const navigate = useNavigate();

  const stageIndex = JOURNEY_STAGES.findIndex((s) => s.stage === pipeline.currentStage);

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {JOURNEY_STAGES.map((s, i) => {
          const status = pipeline.stages.find((ps) => ps.stage === s.stage)?.status ?? 'LOCKED';
          return (
            <div key={s.stage} className="flex items-center gap-1">
              <div
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  status === 'COMPLETED' && 'bg-brand-500',
                  status === 'ACTIVE' && 'bg-brand-400 ring-2 ring-brand-200',
                  status === 'LOCKED' && 'bg-warm-200',
                )}
              />
              {i < JOURNEY_STAGES.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-3',
                    i < stageIndex ? 'bg-brand-300' : 'bg-warm-200',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {JOURNEY_STAGES.map((stageInfo, i) => {
        const stageData = pipeline.stages.find((ps) => ps.stage === stageInfo.stage);
        const status = stageData?.status ?? 'LOCKED';
        const isActive = status === 'ACTIVE';
        const isDone = status === 'COMPLETED';
        const completedTasks = stageData?.tasks.filter((t) => t.completed).length ?? 0;
        const totalTasks = stageData?.tasks.length ?? 0;

        return (
          <button
            key={stageInfo.stage}
            onClick={() =>
              status !== 'LOCKED' && navigate(`/journey/stage/${stageInfo.stage}`)
            }
            disabled={status === 'LOCKED'}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left',
              isActive && 'bg-brand-50 border border-brand-200',
              isDone && 'bg-warm-50 hover:bg-warm-100',
              status === 'LOCKED' && 'opacity-40 cursor-not-allowed',
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
                isDone && 'bg-brand-500',
                isActive && 'bg-brand-100',
                status === 'LOCKED' && 'bg-warm-200',
              )}
            >
              {isDone ? (
                <CheckCircle2 size={18} className="text-white" />
              ) : status === 'LOCKED' ? (
                <Lock size={14} className="text-slate-400" />
              ) : (
                <span className="text-sm font-bold text-brand-600">{i + 1}</span>
              )}
            </div>

            {/* Label & progress */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'text-sm font-semibold truncate',
                  isActive ? 'text-brand-700' : isDone ? 'text-slate-600' : 'text-slate-400',
                )}
              >
                {stageInfo.label}
              </p>
              {isActive && totalTasks > 0 && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {completedTasks}/{totalTasks} tasks complete
                </p>
              )}
            </div>

            {/* Status badge */}
            {isActive && (
              <span className="badge bg-brand-100 text-brand-700 text-[10px]">
                Current
              </span>
            )}
            {isDone && (
              <span className="badge bg-green-100 text-green-700 text-[10px]">
                Done
              </span>
            )}

            {/* Connector line */}
            {i < JOURNEY_STAGES.length - 1 && (
              <div className="absolute left-[26px] mt-10 w-0.5 h-4 bg-warm-200" />
            )}
          </button>
        );
      })}
    </div>
  );
}
