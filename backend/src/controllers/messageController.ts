import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { MessageType } from '@prisma/client';

/**
 * Get messages for a chat with pagination
 * GET /api/chats/:chatId/messages
 */
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { chatId } = req.params;
    const { cursor, limit = 50 } = req.query;

    // Verify user is a chat member
    const member = await prisma.chatMember.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    if (!member) {
      return res.status(403).json({ error: 'You are not a member of this chat' });
    }

    // Build query for cursor-based pagination
    const where: any = {
      chatId,
      deletedAt: null,
    };

    if (cursor) {
      where.id = { lt: cursor };
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        reads: {
          select: {
            userId: true,
            readAt: true,
          },
        },
      },
    });

    // Reverse to get chronological order
    messages.reverse();

    // Format messages with read receipts
    const formattedMessages = messages.map((message) => ({
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      type: message.type,
      fileUrl: message.fileUrl,
      replyToId: message.replyToId,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      deletedAt: message.deletedAt,
      sender: message.sender,
      replyTo: message.replyTo
        ? {
            id: message.replyTo.id,
            chatId: message.replyTo.chatId,
            senderId: message.replyTo.senderId,
            content: message.replyTo.content,
            type: message.replyTo.type,
            fileUrl: message.replyTo.fileUrl,
            createdAt: message.replyTo.createdAt,
            sender: message.replyTo.sender,
          }
        : null,
      readBy: message.reads.map((read) => read.userId),
      isRead: message.reads.some((read) => read.userId === userId),
    }));

    // Get next cursor (ID of the oldest message)
    const nextCursor = messages.length > 0 ? messages[0].id : null;

    res.json({
      messages: formattedMessages,
      nextCursor,
      hasMore: messages.length === Number(limit),
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

/**
 * Send a message
 * POST /api/chats/:chatId/messages
 */
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { chatId } = req.params;
    const { content, type = MessageType.text, fileUrl, replyToId } = req.body;

    // Validate input
    if (!content && !fileUrl) {
      return res.status(400).json({ error: 'Content or fileUrl is required' });
    }

    if (!Object.values(MessageType).includes(type)) {
      return res.status(400).json({ error: 'Invalid message type' });
    }

    // Verify user is a chat member
    const member = await prisma.chatMember.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    if (!member) {
      return res.status(403).json({ error: 'You are not a member of this chat' });
    }

    // If replyToId is provided, verify it exists and belongs to the same chat
    if (replyToId) {
      const replyTo = await prisma.message.findUnique({
        where: { id: replyToId },
      });

      if (!replyTo || replyTo.chatId !== chatId) {
        return res.status(400).json({ error: 'Invalid reply message' });
      }
    }

    // Create message
    const message = await prisma.$transaction(async (tx) => {
      const newMessage = await tx.message.create({
        data: {
          chatId,
          senderId: userId,
          content: content || '',
          type,
          fileUrl: fileUrl || null,
          replyToId: replyToId || null,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          replyTo: {
            include: {
              sender: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      // Update chat's updatedAt
      await tx.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
      });

      return newMessage;
    });

    // Emit Socket.io event (will be handled by socketService)
    const io = req.app.get('io');
    if (io) {
      // Get all chat members
      const chatMembers = await prisma.chatMember.findMany({
        where: { chatId },
        select: { userId: true },
      });

      // Emit to all members except sender
      chatMembers.forEach((member) => {
        if (member.userId !== userId) {
          io.to(`user:${member.userId}`).emit('new_message', {
            id: message.id,
            chatId: message.chatId,
            senderId: message.senderId,
            content: message.content,
            type: message.type,
            fileUrl: message.fileUrl,
            replyToId: message.replyToId,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt,
            sender: message.sender,
            replyTo: message.replyTo
              ? {
                  id: message.replyTo.id,
                  chatId: message.replyTo.chatId,
                  senderId: message.replyTo.senderId,
                  content: message.replyTo.content,
                  type: message.replyTo.type,
                  fileUrl: message.replyTo.fileUrl,
                  createdAt: message.replyTo.createdAt,
                  sender: message.replyTo.sender,
                }
              : null,
          });
        }
      });

      // Emit message_delivered to sender for each recipient
      chatMembers.forEach((member) => {
        if (member.userId !== userId) {
          io.to(`user:${userId}`).emit('message_delivered', {
            messageId: message.id,
            chatId: message.chatId,
            userId: member.userId,
          });
        }
      });
    }

    res.status(201).json({
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      type: message.type,
      fileUrl: message.fileUrl,
      replyToId: message.replyToId,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      sender: message.sender,
      replyTo: message.replyTo
        ? {
            id: message.replyTo.id,
            chatId: message.replyTo.chatId,
            senderId: message.replyTo.senderId,
            content: message.replyTo.content,
            type: message.replyTo.type,
            fileUrl: message.replyTo.fileUrl,
            createdAt: message.replyTo.createdAt,
            sender: message.replyTo.sender,
          }
        : null,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

/**
 * Edit a message
 * PUT /api/messages/:id
 */
export const editMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Verify user is the sender
    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        chat: {
          include: {
            members: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({ error: 'You can only edit your own messages' });
    }

    // Update message
    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { content },
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

    // Emit Socket.io event
    const io = req.app.get('io');
    if (io) {
      message.chat.members.forEach((member) => {
        io.to(`user:${member.userId}`).emit('message_updated', {
          id: updatedMessage.id,
          chatId: updatedMessage.chatId,
          content: updatedMessage.content,
          updatedAt: updatedMessage.updatedAt,
        });
      });
    }

    res.json({
      id: updatedMessage.id,
      chatId: updatedMessage.chatId,
      senderId: updatedMessage.senderId,
      content: updatedMessage.content,
      type: updatedMessage.type,
      fileUrl: updatedMessage.fileUrl,
      replyToId: updatedMessage.replyToId,
      createdAt: updatedMessage.createdAt,
      updatedAt: updatedMessage.updatedAt,
      sender: updatedMessage.sender,
    });
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ error: 'Failed to edit message' });
  }
};

/**
 * Delete a message (soft delete)
 * DELETE /api/messages/:id
 */
export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Verify user is the sender
    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        chat: {
          include: {
            members: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({ error: 'You can only delete your own messages' });
    }

    // Soft delete
    await prisma.message.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Emit Socket.io event
    const io = req.app.get('io');
    if (io) {
      message.chat.members.forEach((member) => {
        io.to(`user:${member.userId}`).emit('message_deleted', {
          messageId: id,
          chatId: message.chatId,
        });
      });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

/**
 * Mark message as read
 * POST /api/messages/:id/read
 */
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Verify message exists and user is a chat member
    const message = await prisma.message.findUnique({
      where: { id },
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

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.chat.members.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this chat' });
    }

    // Create or update MessageRead record
    await prisma.messageRead.upsert({
      where: {
        messageId_userId: {
          messageId: id,
          userId,
        },
      },
      create: {
        messageId: id,
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

    // Emit Socket.io event
    const io = req.app.get('io');
    if (io) {
      // Emit to sender
      io.to(`user:${message.senderId}`).emit('message_read', {
        messageId: id,
        userId,
      });
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};

/**
 * Search messages
 * GET /api/messages/search?q=query
 */
export const searchMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { q, chatId, limit = 20 } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Build where clause
    const where: any = {
      content: {
        contains: q,
        mode: 'insensitive',
      },
      deletedAt: null,
    };

    // If chatId is provided, verify user is a member
    if (chatId) {
      const member = await prisma.chatMember.findUnique({
        where: {
          chatId_userId: {
            chatId: chatId as string,
            userId,
          },
        },
      });

      if (!member) {
        return res.status(403).json({ error: 'You are not a member of this chat' });
      }

      where.chatId = chatId;
    } else {
      // Search in all chats where user is a member
      const userChats = await prisma.chatMember.findMany({
        where: { userId },
        select: { chatId: true },
      });

      where.chatId = {
        in: userChats.map((c) => c.chatId),
      };
    }

    // Search messages
    const messages = await prisma.message.findMany({
      where,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        chat: {
          select: {
            id: true,
            type: true,
            name: true,
          },
        },
      },
    });

    res.json(
      messages.map((message) => ({
        id: message.id,
        chatId: message.chatId,
        senderId: message.senderId,
        content: message.content,
        type: message.type,
        fileUrl: message.fileUrl,
        replyToId: message.replyToId,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        sender: message.sender,
        chat: message.chat,
      }))
    );
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({ error: 'Failed to search messages' });
  }
};
