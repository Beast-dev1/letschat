import { useChatStore } from '@/store/chatStore';

export const useChat = () => {
  const {
    chats,
    activeChatId,
    messages,
    setChats,
    addChat,
    updateChat,
    setActiveChat,
    setMessages,
    addMessage,
    updateMessage,
    deleteMessage,
  } = useChatStore();

  return {
    chats,
    activeChatId,
    messages,
    setChats,
    addChat,
    updateChat,
    setActiveChat,
    setMessages,
    addMessage,
    updateMessage,
    deleteMessage,
  };
};




