import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { ContactStatus } from '@prisma/client';
import { Server } from 'socket.io';

// Validation schemas
const sendRequestSchema = z.object({
  contactId: z.string().uuid(),
});

const updateRequestSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'blocked']),
});

/**
 * Get all contacts (accepted only)
 * GET /api/contacts
 */
export const getContacts = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          { userId: req.userId, status: 'accepted' },
          { contactId: req.userId, status: 'accepted' },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            status: true,
            lastSeen: true,
            bio: true,
          },
        },
        contact: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            status: true,
            lastSeen: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to return the other user (not the current user)
    const transformedContacts = contacts.map((contact) => {
      const otherUser = contact.userId === req.userId ? contact.contact : contact.user;
      return {
        id: contact.id,
        userId: contact.userId,
        contactId: contact.contactId,
        status: contact.status,
        createdAt: contact.createdAt,
        contact: otherUser,
      };
    });

    res.json({ contacts: transformedContacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Search users by username or email
 * GET /api/contacts/search?q=query
 */
export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const query = req.query.q as string;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = query.trim().toLowerCase();

    // Find users matching the search term (excluding current user)
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: req.userId } },
          {
            OR: [
              { username: { contains: searchTerm, mode: 'insensitive' } },
              { email: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        status: true,
        lastSeen: true,
        bio: true,
      },
      take: 20, // Limit results
    });

    // Get existing contact relationships
    const existingContacts = await prisma.contact.findMany({
      where: {
        OR: [
          { userId: req.userId },
          { contactId: req.userId },
        ],
      },
    });

    // Map contact status for each user
    const usersWithStatus = users.map((user) => {
      const contact = existingContacts.find(
        (c) => c.userId === user.id || c.contactId === user.id
      );
      return {
        ...user,
        contactStatus: contact
          ? contact.status
          : null,
        contactId: contact?.id || null,
      };
    });

    res.json({ users: usersWithStatus });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Send contact request
 * POST /api/contacts
 */
export const sendContactRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate input
    const validatedData = sendRequestSchema.parse(req.body);
    const { contactId } = validatedData;

    // Check if trying to add self
    if (req.userId === contactId) {
      return res.status(400).json({ error: 'Cannot add yourself as a contact' });
    }

    // Check if contact exists
    const contactUser = await prisma.user.findUnique({
      where: { id: contactId },
    });

    if (!contactUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if contact relationship already exists
    const existingContact = await prisma.contact.findFirst({
      where: {
        OR: [
          { userId: req.userId, contactId },
          { userId: contactId, contactId: req.userId },
        ],
      },
    });

    if (existingContact) {
      if (existingContact.status === 'accepted') {
        return res.status(400).json({ error: 'Contact already exists' });
      }
      if (existingContact.status === 'blocked') {
        return res.status(400).json({ error: 'Cannot send request to blocked user' });
      }
      if (existingContact.status === 'pending') {
        if (existingContact.userId === req.userId) {
          return res.status(400).json({ error: 'Request already sent' });
        } else {
          // If the other user sent a request, accept it
          const updatedContact = await prisma.contact.update({
            where: { id: existingContact.id },
            data: { status: 'accepted' },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  avatarUrl: true,
                  status: true,
                  lastSeen: true,
                  bio: true,
                },
              },
              contact: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  avatarUrl: true,
                  status: true,
                  lastSeen: true,
                  bio: true,
                },
              },
            },
          });

          // Emit socket event to notify the other user
          const io: Server = req.app.get('io');
          io.to(`user:${contactId}`).emit('contact_request_accepted', {
            contactId: updatedContact.id,
            userId: req.userId,
          });

          return res.json({
            message: 'Contact request accepted',
            contact: {
              id: updatedContact.id,
              userId: updatedContact.userId,
              contactId: updatedContact.contactId,
              status: updatedContact.status,
              createdAt: updatedContact.createdAt,
              contact: updatedContact.userId === req.userId ? updatedContact.contact : updatedContact.user,
            },
          });
        }
      }
    }

    // Create new contact request
    const contact = await prisma.contact.create({
      data: {
        userId: req.userId,
        contactId,
        status: 'pending',
      },
      include: {
        contact: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            status: true,
            lastSeen: true,
            bio: true,
          },
        },
      },
    });

    // Emit socket event to notify the other user
    const io: Server = req.app.get('io');
    io.to(`user:${contactId}`).emit('contact_request_received', {
      contactId: contact.id,
      userId: req.userId,
      username: req.user?.username,
    });

    res.status(201).json({
      message: 'Contact request sent',
      contact: {
        id: contact.id,
        userId: contact.userId,
        contactId: contact.contactId,
        status: contact.status,
        createdAt: contact.createdAt,
        contact: contact.contact,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    console.error('Error sending contact request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Accept/reject/block contact request
 * PUT /api/contacts/:id
 */
export const updateContactRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate input
    const validatedData = updateRequestSchema.parse(req.body);
    const { status } = validatedData;
    const contactId = req.params.id;

    // Find contact
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            status: true,
            lastSeen: true,
            bio: true,
          },
        },
        contact: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            status: true,
            lastSeen: true,
            bio: true,
          },
        },
      },
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Check if user has permission to update (must be the receiver of the request)
    if (contact.contactId !== req.userId) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Update contact status
    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: { status: status as ContactStatus },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            status: true,
            lastSeen: true,
            bio: true,
          },
        },
        contact: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            status: true,
            lastSeen: true,
            bio: true,
          },
        },
      },
    });

    // Emit socket event to notify the other user
    const io: Server = req.app.get('io');
    if (status === 'accepted') {
      io.to(`user:${contact.userId}`).emit('contact_request_accepted', {
        contactId: updatedContact.id,
        userId: req.userId,
      });
    } else if (status === 'rejected') {
      io.to(`user:${contact.userId}`).emit('contact_request_rejected', {
        contactId: updatedContact.id,
        userId: req.userId,
      });
    } else if (status === 'blocked') {
      io.to(`user:${contact.userId}`).emit('contact_blocked', {
        contactId: updatedContact.id,
        userId: req.userId,
      });
    }

    res.json({
      message: `Contact request ${status}`,
      contact: {
        id: updatedContact.id,
        userId: updatedContact.userId,
        contactId: updatedContact.contactId,
        status: updatedContact.status,
        createdAt: updatedContact.createdAt,
        contact: updatedContact.user,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    console.error('Error updating contact request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Remove or block contact
 * DELETE /api/contacts/:id
 */
export const removeContact = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const contactId = req.params.id;
    const { block } = req.query; // Optional query param to block instead of remove

    // Find contact
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Check if user has permission (must be part of the contact relationship)
    if (contact.userId !== req.userId && contact.contactId !== req.userId) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    if (block === 'true') {
      // Block the contact
      const updatedContact = await prisma.contact.update({
        where: { id: contactId },
        data: { status: 'blocked' },
      });

      // Emit socket event
      const io: Server = req.app.get('io');
      const otherUserId = contact.userId === req.userId ? contact.contactId : contact.userId;
      io.to(`user:${otherUserId}`).emit('contact_blocked', {
        contactId: updatedContact.id,
        userId: req.userId,
      });

      res.json({
        message: 'Contact blocked',
        contact: updatedContact,
      });
    } else {
      // Delete the contact
      await prisma.contact.delete({
        where: { id: contactId },
      });

      // Emit socket event
      const io: Server = req.app.get('io');
      const otherUserId = contact.userId === req.userId ? contact.contactId : contact.userId;
      io.to(`user:${otherUserId}`).emit('contact_removed', {
        contactId,
        userId: req.userId,
      });

      res.json({ message: 'Contact removed' });
    }
  } catch (error) {
    console.error('Error removing contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get pending contact requests
 * GET /api/contacts/pending
 */
export const getPendingRequests = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get pending requests where current user is the receiver
    const pendingRequests = await prisma.contact.findMany({
      where: {
        contactId: req.userId,
        status: 'pending',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            status: true,
            lastSeen: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ requests: pendingRequests });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

