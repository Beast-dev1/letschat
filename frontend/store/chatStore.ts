import { create } from 'zustand';
import { Chat, Message } from '@/types';

interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  messages: Record<string, Message[]>;
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  setActiveChat: (chatId: string | null) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  activeChatId: null,
  messages: {},
  setChats: (chats) => set({ chats }),
  addChat: (chat) => set((state) => ({ chats: [...state.chats, chat] })),
  updateChat: (chatId, updates) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, ...updates } : chat
      ),
    })),
  setActiveChat: (chatId) => set({ activeChatId: chatId }),
  setMessages: (chatId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [chatId]: messages },
    })),
  addMessage: (chatId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), message],
      },
    })),
  updateMessage: (chatId, messageId, updates) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      },
    })),
  deleteMessage: (chatId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).filter((msg) => msg.id !== messageId),
      },
    })),
}));

