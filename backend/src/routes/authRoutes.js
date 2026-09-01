import { Router } from 'express';
import { login, me, register, getUsers } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.get('/me', authenticate, me);
router.get('/users', authenticate, getUsers);
router.post('/users', authenticate, register);

export default router;
