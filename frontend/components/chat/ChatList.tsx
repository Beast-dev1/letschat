'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useChatStore } from '@/store/chatStore';
import { useSocket } from '@/hooks/useSocket';
import { api } from '@/lib/api';
import { Chat, ChatType } from '@/types';
import { formatDistanceToNow } from '@/lib/dateUtils';
import Image from 'next/image';

export default function ChatList() {
  const { chats, setChats, setSelectedChat, activeChatId } = useChatStore();
  const { emitJoinChat, emitLeaveChat } = useSocket();

  // Fetch chats
  const { data, isLoading, error } = useQuery<Chat[]>({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await api.get<Chat[]>('/api/chats');
      setChats(response);
      return response;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Join/leave chat rooms when activeChatId changes
  useEffect(() => {
    if (activeChatId) {
      emitJoinChat(activeChatId);
    }

    return () => {
      if (activeChatId) {
        emitLeaveChat(activeChatId);
      }
    };
  }, [activeChatId, emitJoinChat, emitLeaveChat]);

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const getChatName = (chat: Chat) => {
    if (chat.type === ChatType.GROUP) {
      return chat.name || 'Group Chat';
    }
    // For one-on-one, get the other user's name
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

  const formatLastMessage = (chat: Chat) => {
    if (!chat.lastMessage) {
      return 'No messages yet';
    }

    const prefix = chat.type === ChatType.GROUP && chat.lastMessage.sender
      ? `${chat.lastMessage.sender.username}: `
      : '';

    if (chat.lastMessage.type === 'image') {
      return `${prefix}📷 Image`;
    }
    if (chat.lastMessage.type === 'file') {
      return `${prefix}📎 File`;
    }
    if (chat.lastMessage.type === 'audio') {
      return `${prefix}🎤 Audio`;
    }
    if (chat.lastMessage.type === 'video') {
      return `${prefix}🎥 Video`;
    }

    return `${prefix}${chat.lastMessage.content}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading chats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-600">Failed to load chats</p>
      </div>
    );
  }

  const chatList = chats.length > 0 ? chats : (data || []);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {chatList.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">No chats yet</p>
        </div>
      ) : (
        chatList.map((chat) => (
          <div
            key={chat.id}
            onClick={() => handleChatSelect(chat)}
            className={`
              flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800
              transition-colors border-b border-gray-200 dark:border-gray-700
              ${activeChatId === chat.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
            `}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {getChatAvatar(chat) ? (
                <Image
                  src={getChatAvatar(chat)!}
                  alt={getChatName(chat)}
                  width={50}
                  height={50}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {getChatName(chat).charAt(0).toUpperCase()}
                </div>
              )}
              {/* Online status indicator for one-on-one chats */}
              {chat.type === ChatType.ONE_ON_ONE && (
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
              )}
            </div>

            {/* Chat Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {getChatName(chat)}
                </h3>
                {chat.lastMessage && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                    {formatDistanceToNow(new Date(chat.lastMessage.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {formatLastMessage(chat)}
                </p>
                {chat.unreadCount && chat.unreadCount > 0 && (
                  <span className="flex-shrink-0 ml-2 bg-blue-500 text-white text-xs font-semibold rounded-full px-2 py-1 min-w-[20px] text-center">
                    {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

