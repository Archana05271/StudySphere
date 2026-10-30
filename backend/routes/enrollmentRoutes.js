import express from 'express';
import { enroll, myEnrollments, updateProgress, unenroll, allEnrollments } from '../controllers/enrollmentController.js';
import { authenticate, requireRoles } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticate);
router.get('/', requireRoles('admin'), allEnrollments);
router.get('/me', requireRoles('student'), myEnrollments);
router.post('/', requireRoles('student'), enroll);
router.patch('/:courseId/progress', requireRoles('student'), updateProgress);
router.delete('/:courseId', requireRoles('student'), unenroll);
export default router;
