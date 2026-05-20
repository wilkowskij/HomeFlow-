import { create } from 'zustand';
import type { ChatMessage, ChatContext } from '@homeflow/shared';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  context: ChatContext | null;

  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  setLoading: (loading: boolean) => void;
  setContext: (ctx: ChatContext | null) => void;
  clearMessages: () => void;
  updateLastAssistantMessage: (content: string, quickActions?: ChatMessage['quickActions']) => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  messages: [],
  isLoading: false,
  context: null,

  addMessage: (msg) => {
    const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const message: ChatMessage = {
      ...msg,
      id,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({ messages: [...state.messages, message] }));
    return id;
  },

  setLoading: (isLoading) => set({ isLoading }),

  setContext: (context) => set({ context }),

  clearMessages: () => set({ messages: [] }),

  updateLastAssistantMessage: (content, quickActions) => {
    const { messages } = get();
    const lastAssistantIdx = messages.map((m) => m.role).lastIndexOf('assistant');
    if (lastAssistantIdx === -1) return;
    set({
      messages: messages.map((m, i) =>
        i === lastAssistantIdx ? { ...m, content, quickActions } : m,
      ),
    });
  },
}));
