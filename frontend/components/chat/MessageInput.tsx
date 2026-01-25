'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { useChatStore } from '@/store/chatStore';
import { MessageType } from '@/types';
import { Send, Smile } from 'lucide-react';

interface MessageInputProps {
  chatId: string;
  onMessageSent?: () => void;
}

export default function MessageInput({ chatId, onMessageSent }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { emitTypingStart, emitTypingStop } = useSocket();
  const { addMessage } = useChatStore();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Handle typing indicators
    if (!isTyping) {
      setIsTyping(true);
      emitTypingStart(chatId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitTypingStop(chatId);
    }, 3000);
  };

  const handleSend = async () => {
    if (!content.trim() || isSending) {
      return;
    }

    setIsSending(true);
    const messageContent = content.trim();
    setContent('');

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      emitTypingStop(chatId);
    }

    try {
      const message = await api.post<{
        id: string;
        chatId: string;
        senderId: string;
        content: string;
        type: MessageType;
        fileUrl?: string;
        replyToId?: string;
        createdAt: Date;
        updatedAt: Date;
        sender?: any;
      }>(`/api/chats/${chatId}/messages`, {
        content: messageContent,
        type: MessageType.TEXT,
      });

      // Add message to store (will also be received via socket, but add optimistically)
      addMessage(chatId, {
        ...message,
        createdAt: new Date(message.createdAt),
        updatedAt: new Date(message.updatedAt),
      });

      onMessageSent?.();
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore content on error
      setContent(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        emitTypingStop(chatId);
      }
    };
  }, []);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
      <div className="flex items-end gap-2">
        {/* Emoji picker button (optional) */}
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          title="Add emoji"
        >
          <Smile size={20} />
        </button>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
            className="
              w-full px-4 py-2 pr-12 rounded-lg border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              resize-none max-h-32 overflow-y-auto
            "
            disabled={isSending}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!content.trim() || isSending}
          className="
            p-2 rounded-full bg-blue-500 text-white
            hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed
            transition-colors flex-shrink-0
          "
          title="Send message"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}





