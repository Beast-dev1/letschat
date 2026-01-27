'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Video,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Search,
  Filter,
  Clock,
  TrendingUp,
  X,
  MoreVertical,
} from 'lucide-react';

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
  {
    id: '4',
    name: 'Alice Williams',
    type: 'video',
    status: 'incoming',
    duration: '8:20',
    timestamp: '9:00 AM',
    date: 'Today',
  },
  {
    id: '5',
    name: 'Charlie Brown',
    type: 'voice',
    status: 'outgoing',
    duration: '3:15',
    timestamp: 'Yesterday',
    date: 'Yesterday',
  },
];

const filterConfig = {
  all: { label: 'All', icon: Phone, color: 'from-indigo-500 to-purple-500' },
  missed: { label: 'Missed', icon: PhoneMissed, color: 'from-red-500 to-pink-500' },
  outgoing: { label: 'Outgoing', icon: PhoneOutgoing, color: 'from-blue-500 to-cyan-500' },
  incoming: { label: 'Incoming', icon: PhoneIncoming, color: 'from-green-500 to-emerald-500' },
};

export default function CallsPage() {
  const [activeFilter, setActiveFilter] = useState<CallType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getCallIcon = (type: 'voice' | 'video', status: CallStatus) => {
    if (type === 'video') {
      return <Video size={18} className={status === 'missed' ? 'text-red-500' : 'text-blue-500'} />;
    }
    if (status === 'missed') {
      return <PhoneMissed size={18} className="text-red-500" />;
    }
    if (status === 'incoming') {
      return <PhoneIncoming size={18} className="text-green-500" />;
    }
    return <PhoneOutgoing size={18} className="text-blue-500" />;
  };

  const filteredCalls = useMemo(() => {
    return mockCalls.filter((call) => {
      const matchesFilter = activeFilter === 'all' || call.status === activeFilter;
      const matchesSearch = call.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  const groupedCalls = useMemo(() => {
    return filteredCalls.reduce((acc, call) => {
      if (!acc[call.date]) {
        acc[call.date] = [];
      }
      acc[call.date].push(call);
      return acc;
    }, {} as Record<string, CallLog[]>);
  }, [filteredCalls]);

  const callStats = useMemo(() => {
    const total = mockCalls.length;
    const missed = mockCalls.filter((c) => c.status === 'missed').length;
    const incoming = mockCalls.filter((c) => c.status === 'incoming').length;
    const outgoing = mockCalls.filter((c) => c.status === 'outgoing').length;
    return { total, missed, incoming, outgoing };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-20 backdrop-blur-2xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/60 dark:border-gray-800/60 shadow-lg shadow-black/5"
      >
        <div className="p-4 sm:p-6">
          {/* Title Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                Calls
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your call history and statistics</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Phone size={20} />
            </motion.button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50"
            >
              <div className="flex items-center gap-2 mb-1">
                <Phone size={16} className="text-blue-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Total</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{callStats.total}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 backdrop-blur-sm border border-green-200/50 dark:border-green-800/50"
            >
              <div className="flex items-center gap-2 mb-1">
                <PhoneIncoming size={16} className="text-green-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Incoming</span>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{callStats.incoming}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 dark:from-cyan-500/20 dark:to-cyan-600/20 backdrop-blur-sm border border-cyan-200/50 dark:border-cyan-800/50"
            >
              <div className="flex items-center gap-2 mb-1">
                <PhoneOutgoing size={16} className="text-cyan-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Outgoing</span>
              </div>
              <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{callStats.outgoing}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="p-3 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/10 dark:from-red-500/20 dark:to-red-600/20 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50"
            >
              <div className="flex items-center gap-2 mb-1">
                <PhoneMissed size={16} className="text-red-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Missed</span>
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{callStats.missed}</p>
            </motion.div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search calls by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl border-2 border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100"
            />
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <X size={16} className="text-gray-500 dark:text-gray-400" />
              </motion.button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <AnimatePresence mode="wait">
              {(['all', 'missed', 'outgoing', 'incoming'] as CallType[]).map((filter) => {
                const config = filterConfig[filter];
                const Icon = config.icon;
                const isActive = activeFilter === filter;

                return (
                  <motion.button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={false}
                    className={`
                      relative px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-300
                      flex items-center gap-2 overflow-hidden
                      ${
                        isActive
                          ? `bg-gradient-to-r ${config.color} text-white shadow-lg shadow-${config.color.split(' ')[1]}/30`
                          : 'bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 border border-gray-200/50 dark:border-gray-700/50'
                      }
                    `}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeFilter"
                        className="absolute inset-0 bg-gradient-to-r opacity-100"
                        style={{
                          background: `linear-gradient(to right, var(--tw-gradient-stops))`,
                        }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Icon size={16} className={`relative z-10 ${isActive ? 'text-white' : ''}`} />
                    <span className="relative z-10">{config.label}</span>
                    {isActive && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="relative z-10 ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full"
                      >
                        {filteredCalls.length}
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Calls List */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <AnimatePresence mode="wait">
          {filteredCalls.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center h-full text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
                className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mb-6 shadow-xl"
              >
                <Phone className="text-blue-500 dark:text-blue-400" size={48} />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No calls found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                {searchQuery
                  ? 'Try adjusting your search or filters to find what you\'re looking for'
                  : 'Your call history will appear here once you start making calls'}
              </p>
              {searchQuery && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Clear Search
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="calls"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 pt-6"
            >
              {Object.entries(groupedCalls).map(([date, calls], dateIndex) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: dateIndex * 0.1 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3 px-2 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border border-blue-200/50 dark:border-blue-800/50">
                      <Clock size={18} className="text-blue-500 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      {date}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-300 via-gray-200 to-transparent dark:from-gray-700 dark:via-gray-800" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                      {calls.length} {calls.length === 1 ? 'call' : 'calls'}
                    </span>
                  </div>
                  {calls.map((call, index) => (
                    <motion.div
                      key={call.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: dateIndex * 0.1 + index * 0.05 }}
                      whileHover={{ scale: 1.01, x: 4 }}
                      className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 p-5 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer hover:border-blue-300/60 dark:hover:border-purple-500/60"
                    >
                      {/* Gradient Background Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500" />

                      <div className="relative flex items-center gap-4">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-xl ring-4 ring-white/50 dark:ring-gray-900/50"
                          >
                            {call.name.charAt(0).toUpperCase()}
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-white dark:bg-gray-900 shadow-lg border-2 border-gray-100 dark:border-gray-800"
                          >
                            {getCallIcon(call.type, call.status)}
                          </motion.div>
                          {call.status === 'missed' && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"
                            />
                          )}
                        </div>

                        {/* Call Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate mb-1">
                                {call.name}
                              </h3>
                              <div className="flex items-center gap-2 flex-wrap">
                                <motion.span
                                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                                    call.status === 'missed'
                                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                      : call.status === 'incoming'
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                  }`}
                                >
                                  {call.status === 'missed'
                                    ? 'Missed'
                                    : call.status === 'incoming'
                                      ? 'Incoming'
                                      : 'Outgoing'}
                                </motion.span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                  {call.type === 'video' ? 'Video' : 'Voice'}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 ml-2">
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {call.timestamp}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{call.duration}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 15 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all"
                            title={call.type === 'video' ? 'Video call' : 'Voice call'}
                          >
                            {call.type === 'video' ? <Video size={20} /> : <Phone size={20} />}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                            title="More options"
                          >
                            <MoreVertical size={18} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}





