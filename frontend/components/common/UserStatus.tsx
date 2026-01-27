'use client';

import { UserStatus as UserStatusType } from '@/types';
import { formatDistanceToNow } from '@/lib/dateUtils';

interface UserStatusIndicatorProps {
  status: UserStatusType;
  lastSeen?: Date;
  className?: string;
  showText?: boolean;
}

export default function UserStatusIndicator({
  status,
  lastSeen,
  className = '',
  showText = false,
}: UserStatusIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'offline':
        return lastSeen
          ? `Last seen ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}`
          : 'Offline';
      default:
        return 'Offline';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor()}`}
        title={getStatusText()}
      />
      {showText && (
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {getStatusText()}
        </span>
      )}
    </div>
  );
}







