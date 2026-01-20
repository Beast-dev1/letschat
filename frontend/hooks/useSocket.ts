import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';

export const useSocket = () => {
  useEffect(() => {
    const socket = getSocket();
    return () => {
      socket.disconnect();
    };
  }, []);
};

