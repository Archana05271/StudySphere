import express from 'express';
import { listMine, markRead, markAllRead, broadcast } from '../controllers/notificationController.js';
import { authenticate, requireRoles } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticate);
router.get('/', listMine);
router.post('/', requireRoles('admin'), broadcast);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);
export default router;
