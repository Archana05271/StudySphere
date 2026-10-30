import express from 'express';
import { register, login, me, updateMe, changePassword } from '../controllers/authController.js';
import { validateRegistration, validateLogin } from '../middleware/authValidation.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.get('/me', authenticate, me);
router.put('/me', authenticate, updateMe);
router.patch('/me/password', authenticate, changePassword);
export default router;
