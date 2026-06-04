import { Router } from 'express';
import {
  register, login, logout, refresh, getMe, changePassword,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { registerSchema, loginSchema, changePasswordSchema } from '../validators/auth.validator.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/register',         authLimiter, validate(registerSchema), register);
router.post('/login',            authLimiter, validate(loginSchema),    login);
router.post('/refresh',          refresh);
router.post('/logout',           protect, logout);
router.get( '/me',               protect, getMe);
router.patch('/change-password', protect, validate(changePasswordSchema), changePassword);

export default router;
