import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import prisma from '../config/database';
import redis from '../config/redis';
import { MessageType } from '@prisma/client';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

// Store user-socket mapping: userId -> Set of socketIds
const userSockets = new Map<string, Set<string>>();

/**
 * Initialize Socket.io service
 */
export const initializeSocket = (io: Server) => {
  // Socket.io authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication required'));
      }

      // Verify JWT token
      const payload = verifyAccessToken(token);
      socket.userId = payload.userId;

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Handle connection
  io.on('connection', async (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    console.log(`✅ User connected: ${userId} (socket: ${socket.id})`);

    // Add socket to user's socket set
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId)!.add(socket.id);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Store user-socket mapping in Redis
    await redis.set(`socket:${socket.id}`, userId, 'EX', 3600); // 1 hour expiry
    await redis.sadd(`user:sockets:${userId}`, socket.id);

    // Update user status to online
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'online' },
    });

    // Broadcast user online status to contacts
    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          { userId, status: 'accepted' },
          { contactId: userId, status: 'accepted' },
        ],
      },
      select: {
        userId: true,
        contactId: true,
      },
    });

    const contactIds = contacts.map((c) => (c.userId === userId ? c.contactId : c.userId));
    contactIds.forEach((contactId) => {
      io.to(`user:${contactId}`).emit('user_online', { userId });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${userId} (socket: ${socket.id})`);

      // Remove socket from user's socket set
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);

          // Update user status to offline
          await prisma.user.update({
            where: { id: userId },
            data: {
              status: 'offline',
              lastSeen: new Date(),
            },
          });

          // Broadcast user offline status to contacts
          contactIds.forEach((contactId) => {
            io.to(`user:${contactId}`).emit('user_offline', { userId });
          });
        }
      }

      // Clean up Redis
      await redis.del(`socket:${socket.id}`);
      await redis.srem(`user:sockets:${userId}`, socket.id);
    });

    // Handle join_chat event
    socket.on('join_chat', async ({ chatId }: { chatId: string }) => {
      try {
        // Verify user is a member
        const member = await prisma.chatMember.findUnique({
          where: {
            chatId_userId: {
              chatId,
              userId,
            },
          },
        });

        if (member) {
          socket.join(`chat:${chatId}`);
          console.log(`User ${userId} joined chat ${chatId}`);
        }
      } catch (error) {
        console.error('Error joining chat:', error);
      }
    });

    // Handle leave_chat event
    socket.on('leave_chat', ({ chatId }: { chatId: string }) => {
      socket.leave(`chat:${chatId}`);
      console.log(`User ${userId} left chat ${chatId}`);
    });

    // Handle send_message event (already handled in controller, but can be used for direct socket sends)
    socket.on('send_message', async (data: { chatId: string; content: string; type: MessageType; fileUrl?: string }) => {
      try {
        // Verify user is a chat member
        const member = await prisma.chatMember.findUnique({
          where: {
            chatId_userId: {
              chatId: data.chatId,
              userId,
            },
          },
        });

        if (!member) {
          socket.emit('error', { message: 'You are not a member of this chat' });
          return;
        }

        // Create message (this should ideally go through the API, but we'll handle it here for socket-only sends)
        const message = await prisma.$transaction(async (tx) => {
          const newMessage = await tx.message.create({
            data: {
              chatId: data.chatId,
              senderId: userId,
              content: data.content,
              type: data.type,
              fileUrl: data.fileUrl || null,
            },
            include: {
              sender: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          });

          // Update chat's updatedAt
          await tx.chat.update({
            where: { id: data.chatId },
            data: { updatedAt: new Date() },
          });

          return newMessage;
        });

        // Emit to all chat members except sender
        io.to(`chat:${data.chatId}`).except(socket.id).emit('new_message', {
          id: message.id,
          chatId: message.chatId,
          senderId: message.senderId,
          content: message.content,
          type: message.type,
          fileUrl: message.fileUrl,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
          sender: message.sender,
        });

        // Emit delivery confirmation to sender
        socket.emit('message_delivered', {
          messageId: message.id,
          chatId: data.chatId,
        });
      } catch (error) {
        console.error('Error sending message via socket:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing_start event
    socket.on('typing_start', async ({ chatId }: { chatId: string }) => {
      try {
        // Verify user is a chat member
        const member = await prisma.chatMember.findUnique({
          where: {
            chatId_userId: {
              chatId,
              userId,
            },
          },
        });

        if (member) {
          // Get user info
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { username: true },
          });

          // Emit to other chat members
          socket.to(`chat:${chatId}`).emit('user_typing', {
            chatId,
            userId,
            username: user?.username || 'Unknown',
          });
        }
      } catch (error) {
        console.error('Error handling typing_start:', error);
      }
    });

    // Handle typing_stop event
    socket.on('typing_stop', async ({ chatId }: { chatId: string }) => {
      try {
        // Verify user is a chat member
        const member = await prisma.chatMember.findUnique({
          where: {
            chatId_userId: {
              chatId,
              userId,
            },
          },
        });

        if (member) {
          // Get user info
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { username: true },
          });

          // Emit to other chat members
          socket.to(`chat:${chatId}`).emit('user_stopped_typing', {
            chatId,
            userId,
            username: user?.username || 'Unknown',
          });
        }
      } catch (error) {
        console.error('Error handling typing_stop:', error);
      }
    });

    // Handle mark_read event
    socket.on('mark_read', async ({ messageId }: { messageId: string }) => {
      try {
        // Verify message exists and user is a chat member
        const message = await prisma.message.findUnique({
          where: { id: messageId },
          include: {
            chat: {
              include: {
                members: {
                  where: { userId },
                },
              },
            },
          },
        });

        if (!message || message.chat.members.length === 0) {
          return;
        }

        // Create or update MessageRead record
        await prisma.messageRead.upsert({
          where: {
            messageId_userId: {
              messageId,
              userId,
            },
          },
          create: {
            messageId,
            userId,
          },
          update: {
            readAt: new Date(),
          },
        });

        // Update chat member's lastReadAt
        await prisma.chatMember.update({
          where: {
            chatId_userId: {
              chatId: message.chatId,
              userId,
            },
          },
          data: {
            lastReadAt: new Date(),
          },
        });

        // Emit read receipt to sender
        io.to(`user:${message.senderId}`).emit('message_read', {
          messageId,
          userId,
        });
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Handle last_seen update
    socket.on('update_last_seen', async () => {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { lastSeen: new Date() },
        });
      } catch (error) {
        console.error('Error updating last_seen:', error);
      }
    });
  });
};

/**
 * Get all socket IDs for a user
 */
export const getUserSockets = (userId: string): string[] => {
  const sockets = userSockets.get(userId);
  return sockets ? Array.from(sockets) : [];
};

/**
 * Check if user is online
 */
export const isUserOnline = (userId: string): boolean => {
  return userSockets.has(userId) && userSockets.get(userId)!.size > 0;
};
