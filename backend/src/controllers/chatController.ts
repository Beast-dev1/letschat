import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { ChatType, ChatMemberRole } from '@prisma/client';

/**
 * Get user's chats with last message preview
 * GET /api/chats
 */
export const getChats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Get all chats where user is a member
    const chatMembers = await prisma.chatMember.findMany({
      where: { userId },
      include: {
        chat: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                    status: true,
                    lastSeen: true,
                  },
                },
              },
            },
            messages: {
              where: { deletedAt: null },
              orderBy: { createdAt: 'desc' },
              take: 1,
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
        },
      },
      orderBy: {
        chat: {
          updatedAt: 'desc',
        },
      },
    });

    // Format chats with unread count
    const chats = await Promise.all(
      chatMembers.map(async (member) => {
        const chat = member.chat;
        const lastMessage = chat.messages[0] || null;

        // Get unread count (messages after lastReadAt)
        const unreadCount = await prisma.message.count({
          where: {
            chatId: chat.id,
            senderId: { not: userId },
            deletedAt: null,
            createdAt: {
              gt: member.lastReadAt || new Date(0),
            },
          },
        });

        // For one-on-one chats, get the other user's info
        let chatName = chat.name;
        let chatAvatar: string | null = chat.avatarUrl;
        if (chat.type === ChatType.one_on_one) {
          const otherMember = chat.members.find((m) => m.userId !== userId);
          if (otherMember?.user) {
            chatName = otherMember.user.username;
            chatAvatar = otherMember.user.avatarUrl || null;
          }
        }

        return {
          id: chat.id,
          type: chat.type,
          name: chatName,
          avatarUrl: chatAvatar,
          createdBy: chat.createdBy,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          members: chat.members.map((m) => ({
            id: m.id,
            chatId: m.chatId,
            userId: m.userId,
            role: m.role,
            joinedAt: m.joinedAt,
            lastReadAt: m.lastReadAt,
            user: m.user,
          })),
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                chatId: lastMessage.chatId,
                senderId: lastMessage.senderId,
                content: lastMessage.content,
                type: lastMessage.type,
                fileUrl: lastMessage.fileUrl,
                replyToId: lastMessage.replyToId,
                createdAt: lastMessage.createdAt,
                updatedAt: lastMessage.updatedAt,
                sender: lastMessage.sender,
              }
            : null,
          unreadCount,
        };
      })
    );

    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

/**
 * Create new chat
 * POST /api/chats
 */
export const createChat = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { type, memberIds, name, avatarUrl } = req.body;

    // Validate input
    if (!type || !memberIds || !Array.isArray(memberIds)) {
      return res.status(400).json({ error: 'Type and memberIds are required' });
    }

    if (![ChatType.one_on_one, ChatType.group].includes(type)) {
      return res.status(400).json({ error: 'Invalid chat type' });
    }

    // Validate memberIds
    const uniqueMemberIds = [...new Set(memberIds)];
    if (uniqueMemberIds.length === 0) {
      return res.status(400).json({ error: 'At least one member is required' });
    }

    // For one-on-one chats, ensure exactly one other member
    if (type === ChatType.one_on_one && uniqueMemberIds.length !== 1) {
      return res.status(400).json({ error: 'One-on-one chats require exactly one other member' });
    }

    // For group chats, name is required
    if (type === ChatType.group && !name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    // Check if one-on-one chat already exists
    if (type === ChatType.one_on_one) {
      const existingChat = await prisma.chat.findFirst({
        where: {
          type: ChatType.one_on_one,
          members: {
            every: {
              userId: {
                in: [userId, uniqueMemberIds[0]],
              },
            },
          },
        },
        include: {
          members: true,
        },
      });

      if (existingChat) {
        // Check if both users are members
        const userIds = existingChat.members.map((m) => m.userId);
        if (userIds.includes(userId) && userIds.includes(uniqueMemberIds[0])) {
          // Return existing chat
          const chat = await prisma.chat.findUnique({
            where: { id: existingChat.id },
            include: {
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      username: true,
                      avatarUrl: true,
                      status: true,
                      lastSeen: true,
                    },
                  },
                },
              },
            },
          });

          return res.json({
            id: chat!.id,
            type: chat!.type,
            name: chat!.name,
            avatarUrl: chat!.avatarUrl,
            createdBy: chat!.createdBy,
            createdAt: chat!.createdAt,
            updatedAt: chat!.updatedAt,
            members: chat!.members.map((m) => ({
              id: m.id,
              chatId: m.chatId,
              userId: m.userId,
              role: m.role,
              joinedAt: m.joinedAt,
              lastReadAt: m.lastReadAt,
              user: m.user,
            })),
          });
        }
      }
    }

    // Verify all member IDs exist
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: uniqueMemberIds,
        },
      },
    });

    if (users.length !== uniqueMemberIds.length) {
      return res.status(400).json({ error: 'One or more member IDs are invalid' });
    }

    // Create chat and members in a transaction
    const chat = await prisma.$transaction(async (tx) => {
      const newChat = await tx.chat.create({
        data: {
          type,
          name: type === ChatType.group ? name : null,
          avatarUrl: avatarUrl || null,
          createdBy: userId,
        },
      });

      // Create chat members (creator is admin for groups, member for one-on-one)
      const membersToCreate = [
        {
          chatId: newChat.id,
          userId,
          role: type === ChatType.group ? ChatMemberRole.admin : ChatMemberRole.member,
        },
        ...uniqueMemberIds.map((memberId) => ({
          chatId: newChat.id,
          userId: memberId,
          role: ChatMemberRole.member,
        })),
      ];

      await tx.chatMember.createMany({
        data: membersToCreate,
      });

      // Fetch chat with members
      return await tx.chat.findUnique({
        where: { id: newChat.id },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                  status: true,
                  lastSeen: true,
                },
              },
            },
          },
        },
      });
    });

    res.status(201).json({
      id: chat!.id,
      type: chat!.type,
      name: chat!.name,
      avatarUrl: chat!.avatarUrl,
      createdBy: chat!.createdBy,
      createdAt: chat!.createdAt,
      updatedAt: chat!.updatedAt,
      members: chat!.members.map((m) => ({
        id: m.id,
        chatId: m.chatId,
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
        lastReadAt: m.lastReadAt,
        user: m.user,
      })),
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
};

/**
 * Get chat details
 * GET /api/chats/:id
 */
export const getChat = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;

    // Verify user is a member
    const member = await prisma.chatMember.findUnique({
      where: {
        chatId_userId: {
          chatId: id,
          userId,
        },
      },
    });

    if (!member) {
      return res.status(403).json({ error: 'You are not a member of this chat' });
    }

    // Fetch chat with members and last message
    const chat = await prisma.chat.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
                status: true,
                lastSeen: true,
              },
            },
          },
        },
        messages: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 1,
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

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const lastMessage = (chat as any).messages?.[0] || null;

    res.json({
      id: chat.id,
      type: chat.type,
      name: chat.name,
      avatarUrl: chat.avatarUrl,
      createdBy: chat.createdBy,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      members: (chat as any).members.map((m: any) => ({
        id: m.id,
        chatId: m.chatId,
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
        lastReadAt: m.lastReadAt,
        user: m.user,
      })),
      lastMessage: lastMessage
        ? {
            id: lastMessage.id,
            chatId: lastMessage.chatId,
            senderId: lastMessage.senderId,
            content: lastMessage.content,
            type: lastMessage.type,
            fileUrl: lastMessage.fileUrl,
            replyToId: lastMessage.replyToId,
            createdAt: lastMessage.createdAt,
            updatedAt: lastMessage.updatedAt,
            sender: lastMessage.sender,
          }
        : null,
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
};

/**
 * Update chat (name, avatar)
 * PUT /api/chats/:id
 */
export const updateChat = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const { name, avatarUrl } = req.body;

    // Verify user is a member and admin (for groups)
    const member = await prisma.chatMember.findUnique({
      where: {
        chatId_userId: {
          chatId: id,
          userId,
        },
      },
      include: {
        chat: true,
      },
    });

    if (!member) {
      return res.status(403).json({ error: 'You are not a member of this chat' });
    }

    // For group chats, only admins can update
    if ((member as any).chat.type === ChatType.group && member.role !== ChatMemberRole.admin) {
      return res.status(403).json({ error: 'Only admins can update group chats' });
    }

    // Update chat
    const updatedChat = await prisma.chat.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
                status: true,
                lastSeen: true,
              },
            },
          },
        },
      },
    });

    res.json({
      id: updatedChat.id,
      type: updatedChat.type,
      name: updatedChat.name,
      avatarUrl: updatedChat.avatarUrl,
      createdBy: updatedChat.createdBy,
      createdAt: updatedChat.createdAt,
      updatedAt: updatedChat.updatedAt,
      members: (updatedChat as any).members.map((m: any) => ({
        id: m.id,
        chatId: m.chatId,
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
        lastReadAt: m.lastReadAt,
        user: m.user,
      })),
    });
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({ error: 'Failed to update chat' });
  }
};

/**
 * Delete chat
 * DELETE /api/chats/:id
 */
export const deleteChat = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;

    // Verify user is a member
    const member = await prisma.chatMember.findUnique({
      where: {
        chatId_userId: {
          chatId: id,
          userId,
        },
      },
      include: {
        chat: true,
      },
    });

    if (!member) {
      return res.status(403).json({ error: 'You are not a member of this chat' });
    }

    // For one-on-one chats, just remove the user from the chat
    // For group chats, only admins can delete (or remove themselves)
    if ((member as any).chat.type === ChatType.group && member.role !== ChatMemberRole.admin) {
      // Non-admin can only remove themselves
      await prisma.chatMember.delete({
        where: {
          chatId_userId: {
            chatId: id,
            userId,
          },
        },
      });
      return res.json({ message: 'Left chat successfully' });
    }

    // Admin deleting group or one-on-one chat - remove all members
    // The cascade delete will handle messages and other relations
    await prisma.chatMember.deleteMany({
      where: { chatId: id },
    });

    // Delete the chat itself
    await prisma.chat.delete({
      where: { id },
    });

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
};

/**
 * Add member to group chat
 * POST /api/chats/:id/members
 */
export const addMember = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({ error: 'memberId is required' });
    }

    // Verify user is admin
    const member = await prisma.chatMember.findUnique({
      where: {
        chatId_userId: {
          chatId: id,
          userId,
        },
      },
      include: {
        chat: true,
      },
    });

    if (!member) {
      return res.status(403).json({ error: 'You are not a member of this chat' });
    }

    if ((member as any).chat.type !== ChatType.group) {
      return res.status(400).json({ error: 'Can only add members to group chats' });
    }

    if (member.role !== ChatMemberRole.admin) {
      return res.status(403).json({ error: 'Only admins can add members' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: memberId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already a member
    const existingMember = await prisma.chatMember.findUnique({
      where: {
        chatId_userId: {
          chatId: id,
          userId: memberId,
        },
      },
    });

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    // Add member
    const newMember = await prisma.chatMember.create({
      data: {
        chatId: id,
        userId: memberId,
        role: ChatMemberRole.member,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            status: true,
            lastSeen: true,
          },
        },
      },
    });

    res.status(201).json({
      id: newMember.id,
      chatId: newMember.chatId,
      userId: newMember.userId,
      role: newMember.role,
      joinedAt: newMember.joinedAt,
      lastReadAt: newMember.lastReadAt,
      user: (newMember as any).user,
    });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
};

/**
 * Remove member from group chat
 * DELETE /api/chats/:id/members/:userId
 */
export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const targetUserId = req.params.userId as string;

    // Verify user is admin or removing themselves
    const member = await prisma.chatMember.findUnique({
      where: {
        chatId_userId: {
          chatId: id,
          userId,
        },
      },
      include: {
        chat: true,
      },
    });

    if (!member) {
      return res.status(403).json({ error: 'You are not a member of this chat' });
    }

    if ((member as any).chat.type !== ChatType.group) {
      return res.status(400).json({ error: 'Can only remove members from group chats' });
    }

    // Check if removing themselves or if admin
    if (targetUserId !== userId && member.role !== ChatMemberRole.admin) {
      return res.status(403).json({ error: 'Only admins can remove other members' });
    }

    // Remove member
    await prisma.chatMember.delete({
      where: {
        chatId_userId: {
          chatId: id,
          userId: targetUserId,
        },
      },
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
};
