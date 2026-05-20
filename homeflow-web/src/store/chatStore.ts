import { create } from 'zustand';
import type { ChatMessage, ChatContext } from '../types';
import { supabase } from '../lib/supabase';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  hasFetched: boolean;
  context: ChatContext | null;

  fetchMessages: (userId: string) => Promise<void>;
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>, userId?: string) => string;
  setLoading: (loading: boolean) => void;
  setContext: (ctx: ChatContext | null) => void;
  clearMessages: (userId?: string) => void;
  updateLastAssistantMessage: (content: string, quickActions?: ChatMessage['quickActions']) => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  messages: [],
  isLoading: false,
  hasFetched: false,
  context: null,

  fetchMessages: async (userId) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(100);

    set({
      hasFetched: true,
      messages: data && data.length > 0
        ? data.map((row) => ({
            id: row.id,
            role: row.role as ChatMessage['role'],
            content: row.content,
            timestamp: row.created_at,
          }))
        : [],
    });
  },

  addMessage: (msg, userId) => {
    const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const message: ChatMessage = {
      ...msg,
      id,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({ messages: [...state.messages, message] }));

    // Persist to Supabase (fire-and-forget; only user and assistant roles)
    if (userId && (msg.role === 'user' || msg.role === 'assistant')) {
      supabase.from('chat_messages').insert({
        id,
        user_id: userId,
        role: msg.role,
        content: msg.content,
      }).then(() => {/* ignore */});
    }

    return id;
  },

  setLoading: (isLoading) => set({ isLoading }),
  setContext: (context) => set({ context }),

  clearMessages: (userId) => {
    set({ messages: [] });
    if (userId) {
      supabase.from('chat_messages').delete().eq('user_id', userId).then(() => {/* ignore */});
    }
  },

  updateLastAssistantMessage: (content, quickActions) => {
    const { messages } = get();
    const lastIdx = messages.map((m) => m.role).lastIndexOf('assistant');
    if (lastIdx === -1) return;
    set({
      messages: messages.map((m, i) =>
        i === lastIdx ? { ...m, content, quickActions } : m,
      ),
    });
  },
}));
