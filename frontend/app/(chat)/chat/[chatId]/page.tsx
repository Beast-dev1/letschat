'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useChatStore } from '@/store/chatStore';
import { useSocket } from '@/hooks/useSocket';
import ChatWindow from '@/components/chat/ChatWindow';
import { Chat, ChatType } from '@/types';
import Image from 'next/image';
import { ArrowLeft, Phone, Video, MoreVertical, Info } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const chatId = params.chatId as string;
  const { selectedChat, setSelectedChat } = useChatStore();
  const { emitJoinChat, emitLeaveChat } = useSocket();

  // Fetch chat details
  const { data: chat, isLoading } = useQuery<Chat>({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      const response = await api.get<Chat>(`/api/chats/${chatId}`);
      setSelectedChat(response);
      return response;
    },
    enabled: !!chatId,
  });

  // Join chat room
  useEffect(() => {
    if (chatId) {
      emitJoinChat(chatId);
    }

    return () => {
      if (chatId) {
        emitLeaveChat(chatId);
      }
    };
  }, [chatId, emitJoinChat, emitLeaveChat]);

  const getChatName = (chat: Chat) => {
    if (chat.type === ChatType.GROUP) {
      return chat.name || 'Group Chat';
    }
    const otherMember = chat.members?.find(
      (m) => m.userId !== chat.createdBy
    );
    return otherMember?.user?.username || 'Unknown User';
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.avatarUrl) {
      return chat.avatarUrl;
    }
    if (chat.type === ChatType.ONE_ON_ONE) {
      const otherMember = chat.members?.find(
        (m) => m.userId !== chat.createdBy
      );
      return otherMember?.user?.avatarUrl;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block w-12 h-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading chat...</p>
        </motion.div>
      </div>
    );
  }

  const currentChat = chat || selectedChat;

  if (!currentChat) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 mx-auto">
            <Info className="text-red-500" size={40} />
          </div>
          <p className="text-red-600 dark:text-red-400 font-semibold text-lg">Chat not found</p>
        </motion.div>
      </div>
    );
  }

  const isOnline = currentChat.type === ChatType.ONE_ON_ONE &&
    currentChat.members?.find((m) => m.userId !== currentChat.createdBy)?.user?.status === 'online';

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Chat Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm"
      >
        <div className="flex items-center justify-between p-4 sm:p-5">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Back button (mobile) */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => window.history.back()}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <ArrowLeft size={20} />
            </motion.button>

            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative flex-shrink-0 cursor-pointer"
            >
              {getChatAvatar(currentChat) ? (
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden ring-2 ring-blue-200 dark:ring-blue-800 ring-offset-2 ring-offset-white dark:ring-offset-gray-800">
                  <Image
                    src={getChatAvatar(currentChat)!}
                    alt={getChatName(currentChat)}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg ring-2 ring-blue-200 dark:ring-blue-800 ring-offset-2 ring-offset-white dark:ring-offset-gray-800">
                  {getChatName(currentChat).charAt(0).toUpperCase()}
                </div>
              )}
              {/* Online status for one-on-one */}
              {currentChat.type === ChatType.ONE_ON_ONE && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                    isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
              )}
            </motion.div>

            {/* Chat Info */}
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-gray-900 dark:text-white truncate text-base sm:text-lg">
                {getChatName(currentChat)}
              </h2>
              <AnimatePresence mode="wait">
                {currentChat.type === ChatType.ONE_ON_ONE ? (
                  <motion.p
                    key={isOnline ? 'online' : 'offline'}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className={`text-sm truncate ${
                      isOnline
                        ? 'text-green-600 dark:text-green-400 font-medium'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {isOnline ? 'Online' : 'Offline'}
                  </motion.p>
                ) : (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-gray-500 dark:text-gray-400"
                  >
                    {currentChat.members?.length || 0} {currentChat.members?.length === 1 ? 'member' : 'members'}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="p-2.5 sm:p-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors group"
              title="Voice call"
            >
              <Phone size={20} className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              className="p-2.5 sm:p-3 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl transition-colors group"
              title="Video call"
            >
              <Video size={20} className="text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2.5 sm:p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              title="More options"
            >
              <MoreVertical size={20} className="text-gray-700 dark:text-gray-300" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Chat Window */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow chatId={chatId} />
      </div>
    </div>
  );
}
