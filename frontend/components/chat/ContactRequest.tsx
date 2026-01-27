'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Contact } from '@/types';
import { Check, X, UserPlus } from 'lucide-react';
import Image from 'next/image';
import { getSocket } from '@/lib/socket';

interface ContactRequestProps {
  onRequestHandled?: () => void;
}

export default function ContactRequest({ onRequestHandled }: ContactRequestProps) {
  const queryClient = useQueryClient();
  const socket = getSocket();

  // Fetch pending requests
  const { data, isLoading, error, refetch } = useQuery<{ requests: Contact[] }>({
    queryKey: ['pendingRequests'],
    queryFn: async () => {
      return await api.get<{ requests: Contact[] }>('/api/contacts/pending');
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Accept request mutation
  const acceptMutation = useMutation({
    mutationFn: async (contactId: string) => {
      return await api.put<{ message: string; contact: Contact }>(`/api/contacts/${contactId}`, {
        status: 'accepted',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      if (onRequestHandled) {
        onRequestHandled();
      }
    },
  });

  // Reject request mutation
  const rejectMutation = useMutation({
    mutationFn: async (contactId: string) => {
      return await api.put<{ message: string; contact: Contact }>(`/api/contacts/${contactId}`, {
        status: 'rejected',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      if (onRequestHandled) {
        onRequestHandled();
      }
    },
  });

  // Listen for new contact requests
  useEffect(() => {
    socket.on('contact_request_received', () => {
      refetch();
    });

    return () => {
      socket.off('contact_request_received');
    };
  }, [socket, refetch]);

  const handleAccept = (contactId: string) => {
    acceptMutation.mutate(contactId);
  };

  const handleReject = (contactId: string) => {
    rejectMutation.mutate(contactId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-red-600 text-sm">Failed to load requests</p>
      </div>
    );
  }

  const requests = data?.requests || [];

  if (requests.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No pending requests</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Pending Requests ({requests.length})
      </h3>
      <div className="space-y-2">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {request.user?.avatarUrl ? (
                <Image
                  src={request.user.avatarUrl}
                  alt={request.user.username}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {request.user?.username?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">
                  {request.user?.username || 'Unknown User'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {request.user?.email || ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleAccept(request.id)}
                disabled={acceptMutation.isPending || rejectMutation.isPending}
                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Accept"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleReject(request.id)}
                disabled={acceptMutation.isPending || rejectMutation.isPending}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reject"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}







