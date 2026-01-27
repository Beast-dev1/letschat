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
import { ArrowLeft, Phone, Video, MoreVertical, Info, Users, Circle } from 'lucide-react';

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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="relative mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="inline-block w-16 h-16 border-4 border-blue-200/50 dark:border-blue-800/50 border-t-blue-600 dark:border-t-blue-400 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-400 dark:border-r-purple-500 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20"
            />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-2"
          >
            Loading chat...
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            Connecting to conversation
          </motion.p>
        </motion.div>
      </div>
    );
  }

  const currentChat = chat || selectedChat;

  if (!currentChat) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-100 via-pink-100 to-orange-100 dark:from-red-900/30 dark:via-pink-900/30 dark:to-orange-900/30 flex items-center justify-center mb-6 mx-auto shadow-xl border-2 border-red-200/50 dark:border-red-800/50"
          >
            <Info className="text-red-500 dark:text-red-400" size={48} />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Chat not found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            The chat you're looking for doesn't exist or you don't have permission to access it.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-lg hover:shadow-xl transition-all"
          >
            Go Back
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const isOnline = currentChat.type === ChatType.ONE_ON_ONE &&
    currentChat.members?.find((m) => m.userId !== currentChat.createdBy)?.user?.status === 'online';

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden">
      {/* Chat Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-20 backdrop-blur-2xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/60 dark:border-gray-800/60 shadow-lg shadow-black/5"
      >
        <div className="flex items-center justify-between p-4 sm:p-5 lg:p-6">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            {/* Back button (mobile) */}
            <motion.button
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => window.history.back()}
              className="lg:hidden p-2.5 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 rounded-xl transition-all backdrop-blur-sm"
            >
              <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
            </motion.button>

            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="relative shrink-0 cursor-pointer"
            >
              {getChatAvatar(currentChat) ? (
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden ring-4 ring-blue-200/50 dark:ring-blue-800/50 ring-offset-2 ring-offset-white/50 dark:ring-offset-gray-900/50 shadow-xl">
                  <Image
                    src={getChatAvatar(currentChat)!}
                    alt={getChatName(currentChat)}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              ) : (
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-xl ring-4 ring-blue-200/50 dark:ring-blue-800/50 ring-offset-2 ring-offset-white/50 dark:ring-offset-gray-900/50"
                >
                  {getChatName(currentChat).charAt(0).toUpperCase()}
                </motion.div>
              )}
              {/* Online status for one-on-one */}
              {currentChat.type === ChatType.ONE_ON_ONE && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-white dark:border-gray-900 shadow-lg ${
                    isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                >
                  {isOnline && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-green-500"
                    />
                  )}
                </motion.div>
              )}
              {/* Group chat indicator */}
              {currentChat.type === ChatType.GROUP && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-0.5 -right-0.5 p-1 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-white dark:border-gray-900 shadow-lg"
                >
                  <Users size={12} className="text-white" />
                </motion.div>
              )}
            </motion.div>

            {/* Chat Info */}
            <div className="flex-1 min-w-0">
              <motion.h2
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="font-extrabold text-gray-900 dark:text-white truncate text-lg sm:text-xl mb-1"
              >
                {getChatName(currentChat)}
              </motion.h2>
              <AnimatePresence mode="wait">
                {currentChat.type === ChatType.ONE_ON_ONE ? (
                  <motion.div
                    key={isOnline ? 'online' : 'offline'}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <Circle
                      size={8}
                      className={isOnline ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'}
                    />
                    <span
                      className={`text-sm font-medium truncate ${
                        isOnline
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <Users size={14} className="text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {currentChat.members?.length || 0} {currentChat.members?.length === 1 ? 'member' : 'members'}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-3 sm:p-3.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all group overflow-hidden"
              title="Voice call"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Phone size={20} className="relative z-10" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, rotate: -5, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-3 sm:p-3.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all group overflow-hidden"
              title="Video call"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Video size={20} className="relative z-10" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 sm:p-3.5 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 backdrop-blur-sm transition-all border border-gray-200/50 dark:border-gray-700/50"
              title="More options"
            >
              <MoreVertical size={20} className="text-gray-700 dark:text-gray-300" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Chat Window */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 overflow-hidden"
      >
        <ChatWindow chatId={chatId} />
      </motion.div>
    </div>
  );
}
