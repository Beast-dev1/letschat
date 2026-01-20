'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { User } from '@/types';
import { Search, UserPlus, Check, X } from 'lucide-react';
import Image from 'next/image';

interface AddContactProps {
  onContactAdded?: () => void;
}

export default function AddContact({ onContactAdded }: AddContactProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);

  // Search users
  const { data: searchData, isLoading: isSearching, refetch: searchUsers } = useQuery<{ users: (User & { contactStatus: string | null; contactId: string | null })[] }>({
    queryKey: ['searchUsers', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) {
        return { users: [] };
      }
      return await api.get<{ users: (User & { contactStatus: string | null; contactId: string | null })[] }>(`/api/contacts/search?q=${encodeURIComponent(searchQuery)}`);
    },
    enabled: false, // Don't auto-fetch, only on button click
  });

  // Send contact request mutation
  const sendRequestMutation = useMutation({
    mutationFn: async (contactId: string) => {
      return await api.post<{ message: string; contact: any }>('/api/contacts', { contactId });
    },
    onSuccess: () => {
      if (onContactAdded) {
        onContactAdded();
      }
      // Refetch search results to update status
      searchUsers();
    },
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchUsers();
    }
  };

  const handleSendRequest = (userId: string) => {
    sendRequestMutation.mutate(userId);
  };

  const users = searchData?.users || [];

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add Contact</h2>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Search Results */}
      {users.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Search Results</h3>
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.username}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {user.username}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 ml-2">
                {user.contactStatus === 'accepted' ? (
                  <div className="flex items-center gap-2 text-green-500">
                    <Check className="w-5 h-5" />
                    <span className="text-sm">Contact</span>
                  </div>
                ) : user.contactStatus === 'pending' ? (
                  <div className="flex items-center gap-2 text-yellow-500">
                    <span className="text-sm">Pending</span>
                  </div>
                ) : user.contactStatus === 'blocked' ? (
                  <div className="flex items-center gap-2 text-red-500">
                    <X className="w-5 h-5" />
                    <span className="text-sm">Blocked</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSendRequest(user.id)}
                    disabled={sendRequestMutation.isPending}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    {sendRequestMutation.isPending ? 'Sending...' : 'Add'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {searchQuery && users.length === 0 && !isSearching && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No users found
        </div>
      )}
    </div>
  );
}

