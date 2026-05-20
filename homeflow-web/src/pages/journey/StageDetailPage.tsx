import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Upload, Clock } from 'lucide-react';

const STAGE_TYPICAL: Record<string, { label: string; tips: string[] }> = {
  PROFILE_PREAPPROVAL:      { label: '1–2 weeks', tips: ['Contact 2–3 lenders to compare rates', 'Gather pay stubs and tax returns in advance'] },
  SEARCHING:                { label: '4–6 weeks', tips: ['Tour at least 5–7 homes before deciding', 'Save homes to compare side by side'] },
  OFFER_SUBMITTED:          { label: '3–7 days', tips: ['Respond to counter-offers within 24 hours', 'Have your earnest money ready'] },
  INSPECTION_DUE_DILIGENCE: { label: '1–2 weeks', tips: ['Schedule inspection within 3 days of acceptance', 'Attend the inspection in person if possible'] },
  APPRAISAL_UNDERWRITING:   { label: '2–3 weeks', tips: ['Respond quickly to lender document requests', 'Avoid large purchases or new credit inquiries'] },
  CLOSING:                  { label: '1–2 weeks', tips: ['Do final walkthrough 24 hours before closing', 'Wire closing funds 1–2 days early'] },
};
import { useJourneyStore } from '@/store/journeyStore';
import { useAuthStore } from '@/store/authStore';
import { JOURNEY_STAGES } from '@/constants';
import type { JourneyStage } from '@/types';
import { cn } from '@/utils/cn';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function StageDetailPage() {
  const { stage } = useParams<{ stage: JourneyStage }>();
  const navigate = useNavigate();
  const { pipeline, completeTask, uploadDocument, advanceStage } = useJourneyStore();
  const { user } = useAuthStore();
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  const handleUpload = async (docId: string, file: File) => {
    if (!user) return;
    setUploadingDocId(docId);
    const path = `documents/${user.id}/${stage}/${docId}-${file.name}`;
    const { error } = await supabase.storage.from('homeflow-docs').upload(path, file, { upsert: true });
    setUploadingDocId(null);
    if (error) {
      toast.error('Upload failed. Please try again.');
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('homeflow-docs').getPublicUrl(path);
    await uploadDocument(stage!, docId, publicUrl);
    toast.success('Document uploaded!');
  };

  const stageInfo = JOURNEY_STAGES.find((s) => s.stage === stage);
  const stageData = pipeline?.stages.find((s) => s.stage === stage);

  if (!stageInfo || !stageData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Stage not found.</p>
      </div>
    );
  }

  const allTasksDone = stageData.tasks.every((t) => t.completed);
  const isCurrentStage = pipeline?.currentStage === stage;
  const stageTypical = stage ? STAGE_TYPICAL[stage] : null;
  const completedTasks = stageData.tasks.filter((t) => t.completed).length;

  const handleComplete = (taskId: string) => {
    completeTask(stage!, taskId);
    toast.success('Task marked complete!');
  };

  const handleAdvance = () => {
    advanceStage();
    toast.success('Moving to the next stage! 🎉');
    navigate('/journey');
  };

  return (
    <div className="px-4 pt-4 pb-8 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-warm-100 rounded-xl">
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-xs text-brand-600 font-semibold uppercase tracking-wide">Stage</p>
          <h1 className="font-display font-bold text-xl text-slate-900">{stageInfo.label}</h1>
        </div>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed">{stageInfo.description}</p>

      {/* Time estimate + progress */}
      {stageTypical && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-brand-500" />
              <span className="text-sm font-semibold text-slate-700">Typical timeline</span>
            </div>
            <span className="badge bg-brand-50 text-brand-700 text-xs">{stageTypical.label}</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-brand-500 rounded-full transition-all"
              style={{ width: stageData.tasks.length > 0 ? `${(completedTasks / stageData.tasks.length) * 100}%` : '0%' }}
            />
          </div>
          <p className="text-xs text-slate-500 mb-2">{completedTasks}/{stageData.tasks.length} tasks done</p>
          <div className="space-y-1">
            {stageTypical.tips.map((tip, i) => (
              <p key={i} className="text-xs text-slate-500 flex gap-1.5">
                <span className="text-brand-400 flex-shrink-0">→</span>{tip}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Tasks */}
      <div>
        <h2 className="font-semibold text-slate-800 mb-3">Tasks</h2>
        <div className="space-y-2">
          {stageData.tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                'flex items-start gap-3 p-4 rounded-2xl border transition-all',
                task.completed
                  ? 'bg-green-50 border-green-100'
                  : 'bg-warm-50 border-warm-200',
              )}
            >
              <button
                onClick={() => !task.completed && handleComplete(task.id)}
                disabled={task.completed || !isCurrentStage}
                className="mt-0.5 flex-shrink-0"
              >
                {task.completed ? (
                  <CheckCircle2 size={20} className="text-green-500" />
                ) : (
                  <Circle size={20} className="text-slate-300" />
                )}
              </button>
              <div className="flex-1">
                <p
                  className={cn(
                    'text-sm font-medium',
                    task.completed ? 'text-slate-500 line-through' : 'text-slate-900',
                  )}
                >
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                )}
                {task.assignedTo && (
                  <span className="badge bg-warm-100 text-slate-600 text-[10px] mt-1">
                    {task.assignedTo}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documents */}
      {stageData.documents.length > 0 && (
        <div>
          <h2 className="font-semibold text-slate-800 mb-3">Documents</h2>
          <div className="space-y-2">
            {stageData.documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-4 rounded-2xl bg-warm-50 border border-warm-200">
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                    doc.status === 'uploaded' || doc.status === 'verified'
                      ? 'bg-green-100'
                      : 'bg-warm-100',
                  )}
                >
                  <Upload
                    size={15}
                    className={
                      doc.status === 'uploaded' || doc.status === 'verified'
                        ? 'text-green-600'
                        : 'text-slate-400'
                    }
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{doc.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{doc.status}</p>
                </div>
                {doc.status === 'missing' && (
                  <>
                    <input
                      id={`file-${doc.id}`}
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(doc.id, file);
                        e.target.value = '';
                      }}
                    />
                    <button
                      onClick={() => document.getElementById(`file-${doc.id}`)?.click()}
                      disabled={uploadingDocId === doc.id}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-50"
                    >
                      {uploadingDocId === doc.id ? 'Uploading…' : 'Upload'}
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advance stage */}
      {isCurrentStage && allTasksDone && (
        <button onClick={handleAdvance} className="btn-primary w-full">
          Mark Stage Complete & Continue →
        </button>
      )}
    </div>
  );
}
