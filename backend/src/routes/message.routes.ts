import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markAsRead,
  searchMessages,
} from '../controllers/messageController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/chats/:chatId/messages - Get messages
router.get('/chats/:chatId/messages', getMessages);

// POST /api/chats/:chatId/messages - Send message
router.post('/chats/:chatId/messages', sendMessage);

// PUT /api/messages/:id - Edit message
router.put('/:id', editMessage);

// DELETE /api/messages/:id - Delete message
router.delete('/:id', deleteMessage);

// POST /api/messages/:id/read - Mark message as read
router.post('/:id/read', markAsRead);

// GET /api/messages/search?q=query - Search messages
router.get('/search', searchMessages);

export default router;
