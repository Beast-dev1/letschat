'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useChatStore } from '@/store/chatStore';
import { useSocket } from '@/hooks/useSocket';
import { Message, ChatType } from '@/types';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

interface ChatWindowProps {
  chatId: string;
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { messages, setMessages, addMessage, selectedChat } = useChatStore();
  const { emitMarkRead, emitJoinChat } = useSocket();

  const chatMessages = messages[chatId] || [];

  // Fetch messages
  const { data, isLoading, error } = useQuery<{
    messages: Message[];
    nextCursor: string | null;
    hasMore: boolean;
  }>({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      const response = await api.get<{
        messages: Message[];
        nextCursor: string | null;
        hasMore: boolean;
      }>(`/api/chats/${chatId}/messages?limit=50`);
      
      // Reverse messages to get chronological order
      const reversedMessages = [...response.messages].reverse();
      setMessages(chatId, reversedMessages);
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
      
      return response;
    },
    enabled: !!chatId,
  });

  // Join chat room
  useEffect(() => {
    if (chatId) {
      emitJoinChat(chatId);
    }
  }, [chatId, emitJoinChat]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (chatMessages.length > 0) {
      const unreadMessages = chatMessages.filter(
        (msg) => !msg.isRead && msg.senderId !== selectedChat?.createdBy
      );

      unreadMessages.forEach((msg) => {
        emitMarkRead(msg.id);
      });
    }
  }, [chatMessages, selectedChat, emitMarkRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMoreMessages = async () => {
    if (!nextCursor || isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const response = await api.get<{
        messages: Message[];
        nextCursor: string | null;
        hasMore: boolean;
      }>(`/api/chats/${chatId}/messages?cursor=${nextCursor}&limit=50`);

      // Prepend older messages
      const reversedMessages = [...response.messages].reverse();
      setMessages(chatId, [...reversedMessages, ...chatMessages]);
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) {
      return;
    }

    const { scrollTop } = messagesContainerRef.current;
    
    // Load more when scrolled to top
    if (scrollTop === 0 && hasMore && !isLoadingMore) {
      loadMoreMessages();
    }
  };

  const handleEditMessage = async (message: Message) => {
    // TODO: Implement edit message functionality
    console.log('Edit message:', message);
  };

  const handleDeleteMessage = async (message: Message) => {
    try {
      await api.delete(`/api/messages/${message.id}`);
      // Message will be removed via socket event
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleReplyMessage = (message: Message) => {
    // TODO: Implement reply functionality
    console.log('Reply to message:', message);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-600">Failed to load messages</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {isLoadingMore && (
          <div className="text-center py-2">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}

        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          chatMessages.map((message) => (
            <div key={message.id} className="group">
              <MessageBubble
                message={message}
                isGroup={selectedChat?.type === ChatType.GROUP}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
                onReply={handleReplyMessage}
              />
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <MessageInput chatId={chatId} onMessageSent={scrollToBottom} />
    </div>
  );
}

