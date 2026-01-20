// Shared types between frontend and backend

export enum ChatType {
  ONE_ON_ONE = 'one_on_one',
  GROUP = 'group',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  AUDIO = 'audio',
  VIDEO = 'video',
}

export enum ContactStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  BLOCKED = 'blocked',
}

export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away',
}

export enum CallType {
  AUDIO = 'audio',
  VIDEO = 'video',
}

export enum CallStatus {
  INITIATED = 'initiated',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  ENDED = 'ended',
  MISSED = 'missed',
}

export enum ChatMemberRole {
  MEMBER = 'member',
  ADMIN = 'admin',
}

// User types
export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  status: UserStatus;
  lastSeen?: Date;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Chat types
export interface Chat {
  id: string;
  type: ChatType;
  name?: string;
  avatarUrl?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  members?: ChatMember[];
  lastMessage?: Message;
  unreadCount?: number;
}

export interface ChatMember {
  id: string;
  chatId: string;
  userId: string;
  role: ChatMemberRole;
  joinedAt: Date;
  lastReadAt?: Date;
  user?: User;
}

// Message types
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: MessageType;
  fileUrl?: string;
  replyToId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  sender?: User;
  replyTo?: Message;
  readBy?: string[];
  isRead?: boolean;
}

// Contact types
export interface Contact {
  id: string;
  userId: string;
  contactId: string;
  status: ContactStatus;
  createdAt: Date;
  contact?: User;
}

// Call types
export interface CallLog {
  id: string;
  callerId: string;
  receiverId: string;
  chatId: string;
  type: CallType;
  status: CallStatus;
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  caller?: User;
  receiver?: User;
}

// Socket.io event types
export interface SocketEvents {
  // Client → Server
  send_message: { chatId: string; content: string; type: MessageType; fileUrl?: string };
  typing_start: { chatId: string };
  typing_stop: { chatId: string };
  mark_read: { messageId: string };
  join_chat: { chatId: string };
  leave_chat: { chatId: string };
  call_initiate: { receiverId: string; type: CallType; chatId: string };
  call_accept: { callId: string };
  call_reject: { callId: string };
  call_end: { callId: string };
  call_offer: { offer: RTCSessionDescriptionInit; receiverId: string };
  call_answer: { answer: RTCSessionDescriptionInit; callId: string };
  ice_candidate: { candidate: RTCIceCandidateInit; receiverId: string };

  // Server → Client
  new_message: Message;
  message_delivered: { messageId: string; chatId: string; userId: string };
  message_read: { messageId: string; userId: string };
  user_typing: { chatId: string; userId: string; username: string };
  user_stopped_typing: { chatId: string; userId: string };
  user_online: { userId: string };
  user_offline: { userId: string };
  user_last_seen_updated: { userId: string; lastSeen: Date };
  incoming_call: { callId: string; callerId: string; type: CallType; chatId: string };
  call_accepted: { callId: string };
  call_rejected: { callId: string };
  call_ended: { callId: string };
  contact_request_received: { contactId: string; userId: string; username: string };
  contact_request_accepted: { contactId: string; userId: string };
  contact_request_rejected: { contactId: string; userId: string };
  contact_removed: { contactId: string; userId: string };
  contact_blocked: { contactId: string; userId: string };
}

