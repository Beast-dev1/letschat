'use client';

import { Message } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { formatTime } from '@/lib/dateUtils';
import Image from 'next/image';

interface MessageBubbleProps {
  message: Message;
  isGroup?: boolean;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onReply?: (message: Message) => void;
}

export default function MessageBubble({
  message,
  isGroup = false,
  onEdit,
  onDelete,
  onReply,
}: MessageBubbleProps) {
  const { user } = useAuthStore();
  const isOwn = message.senderId === user?.id;


  const getMessageContent = () => {
    if (message.deletedAt) {
      return (
        <span className="italic text-gray-500 dark:text-gray-400">
          This message was deleted
        </span>
      );
    }

    switch (message.type) {
      case 'image':
        return message.fileUrl ? (
          <Image
            src={message.fileUrl}
            alt="Shared image"
            width={300}
            height={300}
            className="rounded-lg object-cover max-w-full"
          />
        ) : (
          <span>Image</span>
        );
      case 'file':
        return (
          <div className="flex items-center gap-2">
            <span>📎</span>
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              File
            </a>
          </div>
        );
      case 'audio':
        return message.fileUrl ? (
          <audio controls className="w-full max-w-xs">
            <source src={message.fileUrl} />
            Your browser does not support the audio element.
          </audio>
        ) : (
          <span>Audio</span>
        );
      case 'video':
        return message.fileUrl ? (
          <video controls className="w-full max-w-md rounded-lg">
            <source src={message.fileUrl} />
            Your browser does not support the video element.
          </video>
        ) : (
          <span>Video</span>
        );
      default:
        return <span className="whitespace-pre-wrap">{message.content}</span>;
    }
  };

  return (
    <div
      className={`flex gap-2 mb-4 ${
        isOwn ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar (only for groups and received messages) */}
      {!isOwn && isGroup && message.sender && (
        <div className="flex-shrink-0">
          {message.sender.avatarUrl ? (
            <Image
              src={message.sender.avatarUrl}
              alt={message.sender.username}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
              {message.sender.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Message Content */}
      <div
        className={`flex flex-col max-w-[70%] ${
          isOwn ? 'items-end' : 'items-start'
        }`}
      >
        {/* Sender name (for groups) */}
        {!isOwn && isGroup && message.sender && (
          <span className="text-xs text-gray-600 dark:text-gray-400 mb-1 px-2">
            {message.sender.username}
          </span>
        )}

        {/* Reply to message (if exists) */}
        {message.replyTo && (
          <div
            className={`mb-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border-l-4 border-blue-500 text-sm ${
              isOwn ? 'mr-2' : 'ml-2'
            }`}
          >
            <div className="font-semibold text-blue-600 dark:text-blue-400">
              {message.replyTo.sender?.username || 'Unknown'}
            </div>
            <div className="text-gray-600 dark:text-gray-400 truncate">
              {message.replyTo.content}
            </div>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`
            px-4 py-2 rounded-2xl break-words
            ${
              isOwn
                ? 'bg-blue-500 text-white rounded-tr-none'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none'
            }
          `}
        >
          {getMessageContent()}
        </div>

        {/* Timestamp and read receipts */}
        <div
          className={`flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400 ${
            isOwn ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <span>{formatTime(new Date(message.createdAt))}</span>
          {isOwn && (
            <>
              {message.isRead ? (
                <span className="text-blue-500">✓✓</span>
              ) : (
                <span>✓</span>
              )}
            </>
          )}
        </div>

        {/* Message actions (on hover) */}
        {!message.deletedAt && (
          <div
            className={`opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex gap-2 ${
              isOwn ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {onReply && (
              <button
                onClick={() => onReply(message)}
                className="text-xs text-gray-500 hover:text-blue-500"
              >
                Reply
              </button>
            )}
            {isOwn && onEdit && (
              <button
                onClick={() => onEdit(message)}
                className="text-xs text-gray-500 hover:text-blue-500"
              >
                Edit
              </button>
            )}
            {isOwn && onDelete && (
              <button
                onClick={() => onDelete(message)}
                className="text-xs text-gray-500 hover:text-red-500"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

