import express from 'express';
import { contacts, history, send } from '../controllers/messageController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticate);
router.get('/contacts', contacts);
router.get('/:userId', history);
router.post('/', send);
export default router;
