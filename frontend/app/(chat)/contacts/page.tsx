'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContactList from '@/components/chat/ContactList';
import AddContact from '@/components/chat/AddContact';
import ContactRequest from '@/components/chat/ContactRequest';
import { Users, UserPlus, Bell } from 'lucide-react';

type TabType = 'contacts' | 'add' | 'requests';

const tabs = [
  { id: 'contacts' as TabType, label: 'Contacts', icon: Users },
  { id: 'requests' as TabType, label: 'Requests', icon: Bell },
  { id: 'add' as TabType, label: 'Add Contact', icon: UserPlus },
];

export default function ContactsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('contacts');

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-shrink-0 sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm"
      >
        <div className="p-4 sm:p-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Contacts
          </h1>
          
          {/* Tabs */}
          <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    relative flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-medium text-sm sm:text-base
                    transition-all whitespace-nowrap
                    ${
                      isActive
                        ? 'text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700/50'
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'contacts' && (
            <motion.div
              key="contacts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <ContactList />
            </motion.div>
          )}
          {activeTab === 'add' && (
            <motion.div
              key="add"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-y-auto"
            >
              <AddContact onContactAdded={() => setActiveTab('contacts')} />
            </motion.div>
          )}
          {activeTab === 'requests' && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-y-auto"
            >
              <ContactRequest onRequestHandled={() => setActiveTab('contacts')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
