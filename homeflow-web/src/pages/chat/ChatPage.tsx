import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RotateCcw } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useJourneyStore } from '@/store/journeyStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';
import { JOURNEY_STAGES } from '@homeflow/shared';
import { format } from 'date-fns';

const QUICK_SUGGESTIONS = [
  "What should I ask at a showing?",
  "Am I ready to make an offer?",
  "What docs do I need next?",
  "How competitive is the Freehold market?",
  "Explain the closing process",
];

export default function ChatPage() {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, isLoading, addMessage, setLoading, clearMessages } = useChatStore();
  const { pipeline } = useJourneyStore();
  const { user, profile } = useAuthStore();

  const currentStageInfo = pipeline
    ? JOURNEY_STAGES.find((s) => s.stage === pipeline.currentStage)
    : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting if no messages
  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        role: 'assistant',
        content: `Hi${user?.displayName ? ` ${user.displayName.split(' ')[0]}` : ''}! 👋 I'm your HomeFlow AI coach. I can help you navigate every step of buying your home.\n\n${currentStageInfo ? `You're currently in **${currentStageInfo.label}**. What do you need help with?` : "What questions do you have about buying a home?"}`,
        quickActions: QUICK_SUGGESTIONS.slice(0, 3).map((s) => ({
          id: s,
          label: s,
          action: 'send_message',
          payload: { message: s },
        })),
      });
    }
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg = text.trim();
    setInput('');

    addMessage({ role: 'user', content: userMsg });
    setLoading(true);

    // Build context for AI
    const systemContext = [
      'You are HomeFlow, an AI home-buying coach. Be concise, helpful, and encouraging.',
      profile ? `Buyer profile: budget $${profile.budgetMin}–$${profile.budgetMax}, looking in ${profile.locations.join(', ')}.` : '',
      currentStageInfo ? `Current journey stage: ${currentStageInfo.label}.` : '',
      'Keep responses under 150 words. Use bullet points for lists. End with a relevant follow-up question.',
    ].filter(Boolean).join(' ');

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemContext,
          messages: [
            ...messages
              .filter((m) => m.role !== 'system')
              .slice(-10)
              .map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMsg },
          ],
        }),
      });

      const data = await response.json();
      const reply = data.content?.find((c: { type: string }) => c.type === 'text')?.text ?? 'I couldn\'t process that. Please try again.';

      addMessage({
        role: 'assistant',
        content: reply,
        quickActions: [
          { id: 'more', label: 'Tell me more', action: 'send_message', payload: { message: 'Can you explain more?' } },
          { id: 'next', label: 'What\'s next?', action: 'send_message', payload: { message: 'What should I do next in my home buying journey?' } },
        ],
      });
    } catch {
      addMessage({
        role: 'assistant',
        content: 'I\'m having trouble connecting right now. Please try again in a moment.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: NonNullable<ReturnType<typeof useChatStore.getState>['messages'][number]['quickActions']>[number]) => {
    if (action.action === 'send_message' && action.payload?.message) {
      sendMessage(action.payload.message as string);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-128px)]">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center">
            <Sparkles size={15} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">AI Home Coach</p>
            <p className="text-xs text-green-600 font-medium">● Online</p>
          </div>
        </div>
        <button
          onClick={clearMessages}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          title="Clear chat"
        >
          <RotateCcw size={15} className="text-slate-400" />
        </button>
      </div>

      {/* Context banner */}
      {currentStageInfo && (
        <div className="px-4 py-2 bg-brand-50 border-b border-brand-100">
          <p className="text-xs text-brand-700">
            📍 Current stage: <span className="font-semibold">{currentStageInfo.label}</span>
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex animate-fade-in',
              msg.role === 'user' ? 'justify-end' : 'justify-start',
            )}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-3',
                msg.role === 'user'
                  ? 'bg-brand-600 text-white rounded-br-sm'
                  : 'bg-white border border-slate-200 text-slate-900 rounded-bl-sm shadow-sm',
              )}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <p
                className={cn(
                  'text-[10px] mt-1',
                  msg.role === 'user' ? 'text-brand-200' : 'text-slate-400',
                )}
              >
                {format(new Date(msg.timestamp), 'h:mm a')}
              </p>

              {/* Quick actions */}
              {msg.role === 'assistant' && msg.quickActions && msg.quickActions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
                  {msg.quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action)}
                      disabled={isLoading}
                      className="text-[11px] font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-full transition-colors disabled:opacity-50"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick suggestion chips (if no messages or first message) */}
        {messages.length <= 1 && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400 font-medium">Suggested questions:</p>
            {QUICK_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="block w-full text-left p-3 rounded-xl border border-slate-200 text-sm text-slate-700 hover:border-brand-300 hover:bg-brand-50 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-4 pb-4 pt-3 border-t border-slate-100 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Ask anything about buying a home…"
            rows={1}
            className="flex-1 input-base resize-none py-3 text-sm max-h-32 overflow-y-auto"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0"
          >
            <Send size={17} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
