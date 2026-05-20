import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/journey - Get user's journey pipeline
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id ?? 'guest';
    const pipeline = {
      id: `pipeline_${userId}`,
      userId,
      currentStage: 'SEARCHING',
      stages: [
        {
          id: 'PROFILE_PREAPPROVAL',
          label: 'Profile & Pre-Approval',
          status: 'COMPLETED',
          completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          tasks: [
            { id: 't1', title: 'Complete buyer profile', completed: true },
            { id: 't2', title: 'Upload pre-approval letter', completed: true },
            { id: 't3', title: 'Set budget and criteria', completed: true },
          ],
        },
        {
          id: 'SEARCHING',
          label: 'Searching',
          status: 'IN_PROGRESS',
          tasks: [
            { id: 't4', title: 'Schedule 3 viewings this week', completed: false, dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
            { id: 't5', title: 'Save at least 5 favorites', completed: false },
            { id: 't6', title: 'Review AI recommendations', completed: true },
          ],
        },
        { id: 'OFFER_SUBMITTED', label: 'Offer Submitted', status: 'PENDING', tasks: [] },
        { id: 'INSPECTION_DUE_DILIGENCE', label: 'Inspection & Due Diligence', status: 'PENDING', tasks: [] },
        { id: 'CLOSING', label: 'Closing', status: 'PENDING', tasks: [] },
      ],
      agentConnected: false,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    res.json({ success: true, data: pipeline });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch journey' });
  }
});

// PATCH /api/journey/stage/:stageId/task/:taskId - Toggle task completion
router.patch('/stage/:stageId/task/:taskId', async (req: Request, res: Response) => {
  try {
    const { stageId, taskId } = req.params;
    const { completed } = req.body;
    res.json({
      success: true,
      data: { stageId, taskId, completed, updatedAt: new Date().toISOString() },
      message: completed ? 'Task marked complete' : 'Task marked incomplete',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update task' });
  }
});

// POST /api/journey/advance - Advance to next stage
router.post('/advance', async (req: Request, res: Response) => {
  try {
    const { targetStage } = req.body;
    res.json({
      success: true,
      data: { newStage: targetStage, advancedAt: new Date().toISOString() },
      message: `Advanced to ${targetStage}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to advance stage' });
  }
});

// POST /api/journey/agent/connect - Connect an agent
router.post('/agent/connect', async (req: Request, res: Response) => {
  try {
    const { agentCode, agentEmail } = req.body;
    if (!agentCode && !agentEmail) {
      return res.status(400).json({ success: false, error: 'Provide agentCode or agentEmail' });
    }
    const agent = {
      id: 'agent_mock_001',
      name: 'Sarah Johnson',
      email: agentEmail ?? 'sarah.johnson@realty.com',
      phone: '(732) 555-0198',
      agency: 'Garden State Realty',
      licenseNumber: 'NJ-REA-2019-045321',
      connectedAt: new Date().toISOString(),
    };
    res.json({ success: true, data: agent, message: 'Agent connected successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to connect agent' });
  }
});

// GET /api/journey/documents - Get required documents list
router.get('/documents', async (_req: Request, res: Response) => {
  try {
    const documents = [
      { id: 'doc1', name: 'Pre-Approval Letter', required: true, uploaded: true, uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'doc2', name: 'Proof of Income (last 2 pay stubs)', required: true, uploaded: false },
      { id: 'doc3', name: 'Bank Statements (last 3 months)', required: true, uploaded: false },
      { id: 'doc4', name: 'Tax Returns (last 2 years)', required: false, uploaded: false },
      { id: 'doc5', name: 'Government-issued ID', required: true, uploaded: true, uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
    ];
    res.json({ success: true, data: documents });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch documents' });
  }
});

export default router;
