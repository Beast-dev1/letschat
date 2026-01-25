'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Search, Filter, Clock } from 'lucide-react';

type CallType = 'all' | 'missed' | 'outgoing' | 'incoming';
type CallStatus = 'missed' | 'outgoing' | 'incoming';

interface CallLog {
  id: string;
  name: string;
  avatar?: string;
  type: 'voice' | 'video';
  status: CallStatus;
  duration: string;
  timestamp: string;
  date: string;
}

// Mock data - replace with actual API call
const mockCalls: CallLog[] = [
  {
    id: '1',
    name: 'John Doe',
    type: 'voice',
    status: 'incoming',
    duration: '5:32',
    timestamp: '2:30 PM',
    date: 'Today',
  },
  {
    id: '2',
    name: 'Jane Smith',
    type: 'video',
    status: 'outgoing',
    duration: '12:45',
    timestamp: 'Yesterday',
    date: 'Yesterday',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    type: 'voice',
    status: 'missed',
    duration: '--',
    timestamp: '10:15 AM',
    date: 'Yesterday',
  },
];

export default function CallsPage() {
  const [activeFilter, setActiveFilter] = useState<CallType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getCallIcon = (type: 'voice' | 'video', status: CallStatus) => {
    if (type === 'video') {
      return <Video size={20} className={status === 'missed' ? 'text-red-500' : 'text-blue-500'} />;
    }
    if (status === 'missed') {
      return <PhoneMissed size={20} className="text-red-500" />;
    }
    if (status === 'incoming') {
      return <PhoneIncoming size={20} className="text-green-500" />;
    }
    return <PhoneOutgoing size={20} className="text-blue-500" />;
  };

  const filteredCalls = mockCalls.filter((call) => {
    const matchesFilter = activeFilter === 'all' || call.status === activeFilter;
    const matchesSearch = call.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const groupedCalls = filteredCalls.reduce((acc, call) => {
    if (!acc[call.date]) {
      acc[call.date] = [];
    }
    acc[call.date].push(call);
    return acc;
  }, {} as Record<string, CallLog[]>);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm"
      >
        <div className="p-4 sm:p-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Calls
          </h1>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search calls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {(['all', 'missed', 'outgoing', 'incoming'] as CallType[]).map((filter) => (
              <motion.button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all
                  ${
                    activeFilter === filter
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Calls List */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6">
        {filteredCalls.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center py-12"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4">
              <Phone className="text-blue-500 dark:text-blue-400" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No calls found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              {searchQuery ? 'Try adjusting your search or filters' : 'Your call history will appear here'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6 pt-4">
            {Object.entries(groupedCalls).map(([date, calls]) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 px-2 mb-3">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {date}
                  </span>
                </div>
                {calls.map((call, index) => (
                  <motion.div
                    key={call.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, x: 4 }}
                    className="group relative overflow-hidden rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-4 hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-purple-500/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                          {call.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-white dark:bg-gray-800 shadow-md">
                          {getCallIcon(call.type, call.status)}
                        </div>
                      </div>

                      {/* Call Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{call.name}</h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{call.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm ${
                              call.status === 'missed'
                                ? 'text-red-500'
                                : call.status === 'incoming'
                                  ? 'text-green-500'
                                  : 'text-blue-500'
                            }`}
                          >
                            {call.status === 'missed'
                              ? 'Missed'
                              : call.status === 'incoming'
                                ? 'Incoming'
                                : 'Outgoing'}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{call.duration}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 15 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all opacity-0 group-hover:opacity-100"
                        title={call.type === 'video' ? 'Video call' : 'Voice call'}
                      >
                        {call.type === 'video' ? <Video size={20} /> : <Phone size={20} />}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}





