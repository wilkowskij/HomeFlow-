import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const HOMEFLOW_SYSTEM_PROMPT = `You are HomeFlow AI Coach, a knowledgeable and empathetic home buying assistant focused on the New Jersey market. You help first-time and experienced buyers navigate the home buying journey.

Your expertise includes:
- NJ real estate market trends and neighborhoods (Freehold, Marlboro, Howell, Manalapan, etc.)
- Home buying process: pre-approval, offers, inspections, closing
- Mortgage concepts, rates, and calculations
- Property evaluation and comparison
- Negotiation strategies
- Legal requirements and timelines in NJ
- School districts, commute times, and community insights

Guidelines:
- Be concise, warm, and actionable
- Always tailor advice to the user's profile and stage when provided
- Suggest specific next steps when relevant
- Flag urgent items (deadlines, market changes) clearly
- Never provide legal or financial advice as a professional; always recommend consulting licensed professionals for final decisions
- Keep responses under 300 words unless a detailed explanation is explicitly requested`;

// POST /api/chat - Send a message to AI coach
router.post('/', async (req: Request, res: Response) => {
  try {
    const { messages, userContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'messages array is required' });
    }

    const systemWithContext = userContext
      ? `${HOMEFLOW_SYSTEM_PROMPT}\n\nUser Context:\n${JSON.stringify(userContext, null, 2)}`
      : HOMEFLOW_SYSTEM_PROMPT;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemWithContext,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const textContent = (response.content as any).find((c: any) => c.type === 'text');
    res.json({
      success: true,
      data: {
        content: textContent?.text ?? '',
        role: 'assistant',
        id: response.id,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ success: false, error: 'AI service unavailable' });
  }
});

// POST /api/chat/stream - Streaming endpoint
router.post('/stream', async (req: Request, res: Response) => {
  try {
    const { messages, userContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, error: 'messages array is required' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const systemWithContext = userContext
      ? `${HOMEFLOW_SYSTEM_PROMPT}\n\nUser Context:\n${JSON.stringify(userContext, null, 2)}`
      : HOMEFLOW_SYSTEM_PROMPT;

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemWithContext,
      messages,
    });

    stream.on('text', (text: string) => {
      res.write(`data: ${JSON.stringify({ type: 'text', text })}\n\n`);
    });

    stream.on('message', () => {
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    });

    stream.on('error', (err: any) => {
      res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
      res.end();
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Stream failed' });
  }
});

// GET /api/chat/suggestions - Context-aware quick suggestions
router.get('/suggestions', async (req: Request, res: Response) => {
  const { stage, screen } = req.query;

  const suggestionMap: Record<string, string[]> = {
    property_detail: [
      'What should I ask at a showing?',
      'How do I evaluate this neighborhood?',
      'Is this price fair for the area?',
      'What are red flags to look for?',
    ],
    SEARCHING: [
      'How many homes should I tour before making an offer?',
      'Should I expand my search area?',
      "What's the NJ market like right now?",
      'Help me compare my saved homes',
    ],
    OFFER_SUBMITTED: [
      'What happens after my offer is accepted?',
      'Should I waive contingencies?',
      'How long does the NJ closing process take?',
      "What's earnest money and how much do I need?",
    ],
    default: [
      'Where am I in the home buying process?',
      'What should I do next?',
      'Explain mortgage pre-approval',
      'What closing costs should I expect in NJ?',
    ],
  };

  const key = (screen as string) ?? (stage as string) ?? 'default';
  const suggestions = suggestionMap[key] ?? suggestionMap.default;

  res.json({ success: true, data: suggestions });
});

export default router;
