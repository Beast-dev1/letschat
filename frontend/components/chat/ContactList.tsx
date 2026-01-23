'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Contact, User, UserStatus } from '@/types';
import { useSocket } from '@/hooks/useSocket';
import { getSocket } from '@/lib/socket';
import Image from 'next/image';
import UserStatusIndicator from '@/components/common/UserStatus';

interface ContactListProps {
  onContactSelect?: (contact: Contact) => void;
}

export default function ContactList({ onContactSelect }: ContactListProps) {
  const router = useRouter();
  const socket = getSocket();

  // Fetch contacts
  const { data, isLoading, error, refetch } = useQuery<{ contacts: Contact[] }>({
    queryKey: ['contacts'],
    queryFn: async () => {
      return await api.get<{ contacts: Contact[] }>('/api/contacts');
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Listen for contact-related socket events
  useEffect(() => {
    socket.on('contact_request_received', () => {
      refetch();
    });

    socket.on('contact_request_accepted', () => {
      refetch();
    });

    socket.on('contact_request_rejected', () => {
      refetch();
    });

    socket.on('contact_removed', () => {
      refetch();
    });

    socket.on('contact_blocked', () => {
      refetch();
    });

    return () => {
      socket.off('contact_request_received');
      socket.off('contact_request_accepted');
      socket.off('contact_request_rejected');
      socket.off('contact_removed');
      socket.off('contact_blocked');
    };
  }, [socket, refetch]);

  const handleContactClick = (contact: Contact) => {
    if (onContactSelect) {
      onContactSelect(contact);
    } else {
      // Navigate to chat with this contact
      router.push(`/chat/${contact.contactId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading contacts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-600">Failed to load contacts</p>
      </div>
    );
  }

  const contacts = data?.contacts || [];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {contacts.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">No contacts yet</p>
        </div>
      ) : (
        contacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => handleContactClick(contact)}
            className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b border-gray-200 dark:border-gray-700"
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {contact.contact?.avatarUrl ? (
                <Image
                  src={contact.contact.avatarUrl}
                  alt={contact.contact.username}
                  width={50}
                  height={50}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {contact.contact?.username?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              {/* Online status indicator */}
              {contact.contact && (
                <UserStatusIndicator
                  status={contact.contact.status}
                  className="absolute bottom-0 right-0"
                />
              )}
            </div>

            {/* Contact Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {contact.contact?.username || 'Unknown User'}
                </h3>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {contact.contact?.bio || contact.contact?.email || 'No bio'}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}




