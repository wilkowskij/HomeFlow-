import { create } from 'zustand';
import type { JourneyPipeline, JourneyStage, StageProgress } from '../types';
import { JOURNEY_STAGES } from '../constants';
import { supabase } from '../lib/supabase';

interface JourneyState {
  pipeline: JourneyPipeline | null;
  isLoading: boolean;

  fetchPipeline: (userId: string) => Promise<void>;
  initPipeline: (userId: string) => Promise<void>;
  advanceStage: () => Promise<void>;
  completeTask: (stage: JourneyStage, taskId: string) => Promise<void>;
  uploadDocument: (stage: JourneyStage, docId: string, url: string) => Promise<void>;
  connectAgent: (agentId: string) => Promise<void>;
  getCurrentStageData: () => JourneyPipeline['stages'][number] | null;
  getCompletionPercent: () => number;
}

const buildDefaultStages = (): StageProgress[] => [
  {
    stage: 'PROFILE_PREAPPROVAL',
    status: 'ACTIVE',
    tasks: [
      { id: 't1', title: 'Complete buyer profile', completed: false, assignedTo: 'buyer' },
      { id: 't2', title: 'Upload pre-approval letter', completed: false, assignedTo: 'buyer' },
      { id: 't3', title: 'Set budget & timeline', completed: false, assignedTo: 'buyer' },
    ],
    documents: [
      { id: 'd1', name: 'Pre-Approval Letter', required: true, status: 'missing' },
      { id: 'd2', name: 'Proof of Funds / Bank Statement', required: false, status: 'missing' },
    ],
  },
  {
    stage: 'SEARCHING',
    status: 'LOCKED',
    tasks: [
      { id: 't4', title: 'Save at least 5 properties', completed: false, assignedTo: 'buyer' },
      { id: 't5', title: 'Schedule 3 viewings', completed: false, assignedTo: 'buyer' },
      { id: 't6', title: "Connect with a buyer's agent", completed: false, assignedTo: 'buyer' },
    ],
    documents: [],
  },
  {
    stage: 'OFFER_SUBMITTED',
    status: 'LOCKED',
    tasks: [
      { id: 't7', title: 'Choose target property', completed: false, assignedTo: 'buyer' },
      { id: 't8', title: 'Submit offer with agent', completed: false, assignedTo: 'agent' },
      { id: 't9', title: 'Earnest money deposit sent', completed: false, assignedTo: 'buyer' },
    ],
    documents: [
      { id: 'd3', name: 'Signed Offer Letter', required: true, status: 'missing' },
    ],
  },
  {
    stage: 'INSPECTION_DUE_DILIGENCE',
    status: 'LOCKED',
    tasks: [
      { id: 't10', title: 'Schedule home inspection', completed: false, assignedTo: 'buyer' },
      { id: 't11', title: 'Review inspection report', completed: false, assignedTo: 'buyer' },
      { id: 't12', title: 'Negotiate repairs if needed', completed: false, assignedTo: 'agent' },
    ],
    documents: [
      { id: 'd4', name: 'Inspection Report', required: true, status: 'missing' },
      { id: 'd5', name: 'Seller Disclosures', required: true, status: 'missing' },
    ],
  },
  {
    stage: 'APPRAISAL_UNDERWRITING',
    status: 'LOCKED',
    tasks: [
      { id: 't13', title: 'Appraisal ordered by lender', completed: false, assignedTo: 'lender' },
      { id: 't14', title: 'Submit remaining loan documents', completed: false, assignedTo: 'buyer' },
      { id: 't15', title: 'Clear any underwriting conditions', completed: false, assignedTo: 'buyer' },
    ],
    documents: [
      { id: 'd6', name: 'Appraisal Report', required: true, status: 'missing' },
      { id: 'd7', name: 'Clear to Close Letter', required: true, status: 'missing' },
    ],
  },
  {
    stage: 'CLOSING',
    status: 'LOCKED',
    tasks: [
      { id: 't16', title: 'Final walkthrough', completed: false, assignedTo: 'buyer' },
      { id: 't17', title: 'Review closing disclosure', completed: false, assignedTo: 'buyer' },
      { id: 't18', title: 'Wire closing funds', completed: false, assignedTo: 'buyer' },
      { id: 't19', title: 'Sign closing documents', completed: false, assignedTo: 'buyer' },
    ],
    documents: [
      { id: 'd8', name: 'Closing Disclosure', required: true, status: 'missing' },
      { id: 'd9', name: 'Title Insurance Policy', required: true, status: 'missing' },
    ],
  },
];

async function persistStages(pipelineId: string, stages: StageProgress[], currentStage: JourneyStage) {
  await supabase
    .from('journey_pipelines')
    .update({ stage_data: stages as unknown as Record<string, unknown>[], current_stage: currentStage, updated_at: new Date().toISOString() })
    .eq('id', pipelineId);
}

export const useJourneyStore = create<JourneyState>()((set, get) => ({
  pipeline: null,
  isLoading: false,

  fetchPipeline: async (userId) => {
    set({ isLoading: true });
    const { data } = await supabase
      .from('journey_pipelines')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      set({
        pipeline: {
          id: data.id,
          userId: data.user_id,
          currentStage: data.current_stage as JourneyStage,
          stages: (data.stage_data as StageProgress[] | null) ?? buildDefaultStages(),
          connectedAgentId: data.agent_id ?? undefined,
          startedAt: data.created_at,
          updatedAt: data.updated_at,
        },
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
  },

  initPipeline: async (userId) => {
    if (get().pipeline) return;
    const stages = buildDefaultStages();
    const { data, error } = await supabase
      .from('journey_pipelines')
      .insert({
        user_id: userId,
        current_stage: 'PROFILE_PREAPPROVAL',
        stage_data: stages as unknown as Record<string, unknown>[],
      })
      .select()
      .single();

    if (!error && data) {
      set({
        pipeline: {
          id: data.id,
          userId: data.user_id,
          currentStage: 'PROFILE_PREAPPROVAL',
          stages,
          startedAt: data.created_at,
          updatedAt: data.updated_at,
        },
      });
    }
  },

  advanceStage: async () => {
    const { pipeline } = get();
    if (!pipeline) return;
    const stageKeys = JOURNEY_STAGES.map((s) => s.stage);
    const currentIdx = stageKeys.indexOf(pipeline.currentStage);
    if (currentIdx === stageKeys.length - 1) return;
    const nextStage = stageKeys[currentIdx + 1];

    const newStages = pipeline.stages.map((s) => {
      if (s.stage === pipeline.currentStage)
        return { ...s, status: 'COMPLETED' as const, completedAt: new Date().toISOString() };
      if (s.stage === nextStage) return { ...s, status: 'ACTIVE' as const };
      return s;
    });

    const updated: JourneyPipeline = {
      ...pipeline,
      currentStage: nextStage,
      stages: newStages,
      updatedAt: new Date().toISOString(),
    };
    set({ pipeline: updated });
    await persistStages(pipeline.id, newStages, nextStage);
  },

  completeTask: async (stage, taskId) => {
    const { pipeline } = get();
    if (!pipeline) return;

    const newStages = pipeline.stages.map((s) =>
      s.stage === stage
        ? {
            ...s,
            tasks: s.tasks.map((t) =>
              t.id === taskId
                ? { ...t, completed: true, completedAt: new Date().toISOString() }
                : t,
            ),
          }
        : s,
    );

    const updated = { ...pipeline, stages: newStages, updatedAt: new Date().toISOString() };
    set({ pipeline: updated });
    await persistStages(pipeline.id, newStages, pipeline.currentStage);
  },

  uploadDocument: async (stage, docId, url) => {
    const { pipeline } = get();
    if (!pipeline) return;

    const newStages = pipeline.stages.map((s) =>
      s.stage === stage
        ? {
            ...s,
            documents: s.documents.map((d) =>
              d.id === docId
                ? { ...d, status: 'uploaded' as const, fileUrl: url, uploadedAt: new Date().toISOString() }
                : d,
            ),
          }
        : s,
    );

    const updated = { ...pipeline, stages: newStages, updatedAt: new Date().toISOString() };
    set({ pipeline: updated });
    await persistStages(pipeline.id, newStages, pipeline.currentStage);
  },

  connectAgent: async (agentId) => {
    const { pipeline } = get();
    if (!pipeline) return;
    await supabase
      .from('journey_pipelines')
      .update({ agent_id: agentId })
      .eq('id', pipeline.id);
    set({ pipeline: { ...pipeline, connectedAgentId: agentId } });
  },

  getCurrentStageData: () => {
    const { pipeline } = get();
    if (!pipeline) return null;
    return pipeline.stages.find((s) => s.stage === pipeline.currentStage) ?? null;
  },

  getCompletionPercent: () => {
    const { pipeline } = get();
    if (!pipeline) return 0;
    const completedCount = pipeline.stages.filter((s) => s.status === 'COMPLETED').length;
    return Math.round((completedCount / JOURNEY_STAGES.length) * 100);
  },
}));
