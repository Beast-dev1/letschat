'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';

interface TypingIndicatorProps {
  chatId: string;
  userId?: string;
  username?: string;
}

export default function TypingIndicator({ chatId, userId, username }: TypingIndicatorProps) {
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const socket = getSocket();

    const handleUserTyping = (data: { chatId: string; userId: string; username: string }) => {
      if (data.chatId === chatId && data.userId !== userId) {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          newMap.set(data.userId, data.username);
          return newMap;
        });

        // Auto-hide after 3 seconds
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        const newTimeoutId = setTimeout(() => {
          setTypingUsers((prev) => {
            const newMap = new Map(prev);
            newMap.delete(data.userId);
            return newMap;
          });
        }, 3000);

        setTimeoutId(newTimeoutId);
      }
    };

    const handleUserStoppedTyping = (data: { chatId: string; userId: string }) => {
      if (data.chatId === chatId && data.userId !== userId) {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          newMap.delete(data.userId);
          return newMap;
        });
      }
    };

    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);

    return () => {
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [chatId, userId, timeoutId]);

  if (typingUsers.size === 0) {
    return null;
  }

  const users = Array.from(typingUsers.values());
  const displayText =
    users.length === 1
      ? `${users[0]} is typing...`
      : users.length === 2
      ? `${users[0]} and ${users[1]} are typing...`
      : `${users[0]} and ${users.length - 1} others are typing...`;

  return (
    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 italic animate-pulse">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
        <span>{displayText}</span>
      </div>
    </div>
  );
}





