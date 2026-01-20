import { useEffect, useCallback } from 'react';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { useChatStore } from '@/store/chatStore';
import { Message } from '@/types';

export const useSocket = () => {
  const { addMessage, updateMessage, deleteMessage, updateChat, chats } = useChatStore();

  useEffect(() => {
    const socket = getSocket();

    // Listen for new messages
    socket.on('new_message', (message: Message) => {
      addMessage(message.chatId, message);
      
      // Update chat's lastMessage
      const chat = chats.find((c) => c.id === message.chatId);
      if (chat) {
        updateChat(message.chatId, { lastMessage: message, updatedAt: message.createdAt });
      }
    });

    // Listen for message updates
    socket.on('message_updated', (data: { id: string; chatId: string; content: string; updatedAt: Date }) => {
      updateMessage(data.chatId, data.id, {
        content: data.content,
        updatedAt: data.updatedAt,
      });
    });

    // Listen for message deletions
    socket.on('message_deleted', (data: { messageId: string; chatId: string }) => {
      deleteMessage(data.chatId, data.messageId);
    });

    // Listen for message read receipts
    socket.on('message_read', (data: { messageId: string; userId: string }) => {
      // Update message read status
      const chat = chats.find((c) => c.messages?.some((m) => m.id === data.messageId));
      if (chat) {
        const message = chat.messages?.find((m) => m.id === data.messageId);
        if (message) {
          updateMessage(chat.id, data.messageId, {
            readBy: [...(message.readBy || []), data.userId],
            isRead: true,
          });
        }
      }
    });

    // Listen for user typing
    socket.on('user_typing', (data: { chatId: string; userId: string; username: string }) => {
      // Handle typing indicator (can be stored in a separate state if needed)
      console.log(`${data.username} is typing...`);
    });

    // Listen for user online/offline status
    socket.on('user_online', (data: { userId: string }) => {
      // Update user status in chats
      chats.forEach((chat) => {
        const member = chat.members?.find((m) => m.userId === data.userId);
        if (member && member.user) {
          member.user.status = 'online';
          updateChat(chat.id, { members: chat.members });
        }
      });
    });

    socket.on('user_offline', (data: { userId: string }) => {
      // Update user status in chats
      chats.forEach((chat) => {
        const member = chat.members?.find((m) => m.userId === data.userId);
        if (member && member.user) {
          member.user.status = 'offline';
          updateChat(chat.id, { members: chat.members });
        }
      });
    });

    // Cleanup
    return () => {
      socket.off('new_message');
      socket.off('message_updated');
      socket.off('message_deleted');
      socket.off('message_read');
      socket.off('user_typing');
      socket.off('user_online');
      socket.off('user_offline');
    };
  }, [addMessage, updateMessage, deleteMessage, updateChat, chats]);

  const emitTypingStart = useCallback((chatId: string) => {
    const socket = getSocket();
    socket.emit('typing_start', { chatId });
  }, []);

  const emitTypingStop = useCallback((chatId: string) => {
    const socket = getSocket();
    socket.emit('typing_stop', { chatId });
  }, []);

  const emitMarkRead = useCallback((messageId: string) => {
    const socket = getSocket();
    socket.emit('mark_read', { messageId });
  }, []);

  const emitJoinChat = useCallback((chatId: string) => {
    const socket = getSocket();
    socket.emit('join_chat', { chatId });
  }, []);

  const emitLeaveChat = useCallback((chatId: string) => {
    const socket = getSocket();
    socket.emit('leave_chat', { chatId });
  }, []);

  return {
    emitTypingStart,
    emitTypingStop,
    emitMarkRead,
    emitJoinChat,
    emitLeaveChat,
  };
};
