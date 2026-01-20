'use client';

import { useState } from 'react';
import ContactList from '@/components/chat/ContactList';
import AddContact from '@/components/chat/AddContact';
import ContactRequest from '@/components/chat/ContactRequest';
import { Users, UserPlus, Bell } from 'lucide-react';

type TabType = 'contacts' | 'add' | 'requests';

export default function ContactsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('contacts');

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contacts</h1>
          
          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'contacts'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Contacts</span>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors relative ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Bell className="w-5 h-5" />
              <span>Requests</span>
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'add'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-5 h-5" />
              <span>Add Contact</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'contacts' && (
          <ContactList />
        )}
        {activeTab === 'add' && (
          <div className="h-full overflow-y-auto">
            <AddContact onContactAdded={() => setActiveTab('contacts')} />
          </div>
        )}
        {activeTab === 'requests' && (
          <div className="h-full overflow-y-auto">
            <ContactRequest onRequestHandled={() => setActiveTab('contacts')} />
          </div>
        )}
      </div>
    </div>
  );
}
