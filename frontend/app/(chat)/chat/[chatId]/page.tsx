'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useChatStore } from '@/store/chatStore';
import { useSocket } from '@/hooks/useSocket';
import ChatWindow from '@/components/chat/ChatWindow';
import { Chat, ChatType } from '@/types';
import Image from 'next/image';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';

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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  const currentChat = chat || selectedChat;

  if (!currentChat) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">Chat not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Back button (mobile) */}
          <button
            onClick={() => window.history.back()}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {getChatAvatar(currentChat) ? (
              <Image
                src={getChatAvatar(currentChat)!}
                alt={getChatName(currentChat)}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {getChatName(currentChat).charAt(0).toUpperCase()}
              </div>
            )}
            {/* Online status for one-on-one */}
            {currentChat.type === ChatType.ONE_ON_ONE && (
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
            )}
          </div>

          {/* Chat Info */}
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 dark:text-white truncate">
              {getChatName(currentChat)}
            </h2>
            {currentChat.type === ChatType.ONE_ON_ONE && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentChat.members?.find((m) => m.userId !== currentChat.createdBy)?.user?.status === 'online'
                  ? 'Online'
                  : 'Offline'}
              </p>
            )}
            {currentChat.type === ChatType.GROUP && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentChat.members?.length || 0} members
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Voice call"
          >
            <Phone size={20} />
          </button>
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Video call"
          >
            <Video size={20} />
          </button>
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="More options"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow chatId={chatId} />
      </div>
    </div>
  );
}
