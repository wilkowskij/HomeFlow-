import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { JourneyPipeline, JourneyStage, JourneyTask } from '@homeflow/shared';
import { JOURNEY_STAGES } from '@homeflow/shared';

interface JourneyState {
  pipeline: JourneyPipeline | null;
  initPipeline: (userId: string) => void;
  advanceStage: () => void;
  completeTask: (stage: JourneyStage, taskId: string) => void;
  uploadDocument: (stage: JourneyStage, docId: string, url: string) => void;
  connectAgent: (agentId: string) => void;
  getCurrentStageData: () => JourneyPipeline['stages'][number] | null;
  getCompletionPercent: () => number;
}

const buildDefaultStages = (): JourneyPipeline['stages'] => [
  {
    stage: 'profile-preapproval',
    status: 'active',
    tasks: [
      { id: 't1', label: 'Complete buyer profile', completed: false, assignedTo: 'buyer' },
      { id: 't2', label: 'Upload pre-approval letter', completed: false, assignedTo: 'buyer' },
      { id: 't3', label: 'Set budget & timeline', completed: false, assignedTo: 'buyer' },
    ],
    documents: [
      { id: 'd1', name: 'Pre-Approval Letter', required: true, status: 'missing' },
      { id: 'd2', name: 'Proof of Funds / Bank Statement', required: false, status: 'missing' },
    ],
  },
  {
    stage: 'searching',
    status: 'locked',
    tasks: [
      { id: 't4', label: 'Save at least 5 properties', completed: false, assignedTo: 'buyer' },
      { id: 't5', label: 'Schedule 3 viewings', completed: false, assignedTo: 'buyer' },
      { id: 't6', label: 'Connect with a buyer\'s agent', completed: false, assignedTo: 'buyer' },
    ],
    documents: [],
  },
  {
    stage: 'offer-submitted',
    status: 'locked',
    tasks: [
      { id: 't7', label: 'Choose target property', completed: false, assignedTo: 'buyer' },
      { id: 't8', label: 'Submit offer with agent', completed: false, assignedTo: 'agent' },
      { id: 't9', label: 'Earnest money deposit sent', completed: false, assignedTo: 'buyer' },
    ],
    documents: [
      { id: 'd3', name: 'Signed Offer Letter', required: true, status: 'missing' },
    ],
  },
  {
    stage: 'inspection-due-diligence',
    status: 'locked',
    tasks: [
      { id: 't10', label: 'Schedule home inspection', completed: false, assignedTo: 'buyer' },
      { id: 't11', label: 'Review inspection report', completed: false, assignedTo: 'buyer' },
      { id: 't12', label: 'Negotiate repairs if needed', completed: false, assignedTo: 'agent' },
    ],
    documents: [
      { id: 'd4', name: 'Inspection Report', required: true, status: 'missing' },
      { id: 'd5', name: 'Seller Disclosures', required: true, status: 'missing' },
    ],
  },
  {
    stage: 'appraisal-underwriting',
    status: 'locked',
    tasks: [
      { id: 't13', label: 'Appraisal ordered by lender', completed: false, assignedTo: 'lender' },
      { id: 't14', label: 'Submit remaining loan documents', completed: false, assignedTo: 'buyer' },
      { id: 't15', label: 'Clear any underwriting conditions', completed: false, assignedTo: 'buyer' },
    ],
    documents: [
      { id: 'd6', name: 'Appraisal Report', required: true, status: 'missing' },
      { id: 'd7', name: 'Clear to Close Letter', required: true, status: 'missing' },
    ],
  },
  {
    stage: 'closing',
    status: 'locked',
    tasks: [
      { id: 't16', label: 'Final walkthrough', completed: false, assignedTo: 'buyer' },
      { id: 't17', label: 'Review closing disclosure', completed: false, assignedTo: 'buyer' },
      { id: 't18', label: 'Wire closing funds', completed: false, assignedTo: 'buyer' },
      { id: 't19', label: 'Sign closing documents', completed: false, assignedTo: 'buyer' },
    ],
    documents: [
      { id: 'd8', name: 'Closing Disclosure', required: true, status: 'missing' },
      { id: 'd9', name: 'Title Insurance Policy', required: true, status: 'missing' },
    ],
  },
];

export const useJourneyStore = create<JourneyState>()(
  persist(
    (set, get) => ({
      pipeline: null,

      initPipeline: (userId) => {
        if (get().pipeline) return;
        set({
          pipeline: {
            id: `pipeline_${userId}_${Date.now()}`,
            userId,
            currentStage: 'profile-preapproval',
            stages: buildDefaultStages(),
            startedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      advanceStage: () => {
        const { pipeline } = get();
        if (!pipeline) return;
        const stageKeys = JOURNEY_STAGES.map((s) => s.stage);
        const currentIdx = stageKeys.indexOf(pipeline.currentStage);
        if (currentIdx === stageKeys.length - 1) return;
        const nextStage = stageKeys[currentIdx + 1];
        set({
          pipeline: {
            ...pipeline,
            currentStage: nextStage,
            stages: pipeline.stages.map((s) => {
              if (s.stage === pipeline.currentStage)
                return { ...s, status: 'completed', completedAt: new Date().toISOString() };
              if (s.stage === nextStage) return { ...s, status: 'active' };
              return s;
            }),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      completeTask: (stage, taskId) => {
        const { pipeline } = get();
        if (!pipeline) return;
        set({
          pipeline: {
            ...pipeline,
            stages: pipeline.stages.map((s) =>
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
            ),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      uploadDocument: (stage, docId, url) => {
        const { pipeline } = get();
        if (!pipeline) return;
        set({
          pipeline: {
            ...pipeline,
            stages: pipeline.stages.map((s) =>
              s.stage === stage
                ? {
                    ...s,
                    documents: s.documents.map((d) =>
                      d.id === docId
                        ? {
                            ...d,
                            status: 'uploaded' as const,
                            fileUrl: url,
                            uploadedAt: new Date().toISOString(),
                          }
                        : d,
                    ),
                  }
                : s,
            ),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      connectAgent: (agentId) => {
        const { pipeline } = get();
        if (!pipeline) return;
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
        const stageKeys = JOURNEY_STAGES.map((s) => s.stage);
        const completedCount = pipeline.stages.filter(
          (s) => s.status === 'completed',
        ).length;
        return Math.round((completedCount / stageKeys.length) * 100);
      },
    }),
    { name: 'homeflow-journey' },
  ),
);
