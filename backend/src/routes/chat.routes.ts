import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getChats,
  createChat,
  getChat,
  updateChat,
  deleteChat,
  addMember,
  removeMember,
} from '../controllers/chatController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/chats - Get user's chats
router.get('/', getChats);

// POST /api/chats - Create new chat
router.post('/', createChat);

// GET /api/chats/:id - Get chat details
router.get('/:id', getChat);

// PUT /api/chats/:id - Update chat
router.put('/:id', updateChat);

// DELETE /api/chats/:id - Delete chat
router.delete('/:id', deleteChat);

// POST /api/chats/:id/members - Add member to group
router.post('/:id/members', addMember);

// DELETE /api/chats/:id/members/:userId - Remove member from group
router.delete('/:id/members/:userId', removeMember);

export default router;
