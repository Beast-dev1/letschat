import { Router } from 'express';
import {
  getContacts,
  searchUsers,
  sendContactRequest,
  updateContactRequest,
  removeContact,
  getPendingRequests,
} from '../controllers/contactController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get contacts (accepted only)
router.get('/', getContacts);

// Get pending contact requests
router.get('/pending', getPendingRequests);

// Search users
router.get('/search', searchUsers);

// Send contact request
router.post('/', sendContactRequest);

// Accept/reject/block contact request
router.put('/:id', updateContactRequest);

// Remove or block contact
router.delete('/:id', removeContact);

export default router;





