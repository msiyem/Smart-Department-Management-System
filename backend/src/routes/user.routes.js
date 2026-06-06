import { Router } from 'express';
import {
  getAllUsers, toggleUserStatus, updateProfileImage,
  updateProfile, deleteUser,
  createUser,
} from '../controllers/user.controller.js';
import { protect, authorize } from '../middlewares/auth.js';
import { uploadProfile } from '../middlewares/upload.js';

const router = Router();

router.use(protect);

// Own profile
router.patch('/profile',       updateProfile);
router.patch('/profile/image', uploadProfile.single('profile_image'), updateProfileImage);

// Admin only
router.post("/", authorize("admin"), createUser);
router.get('/',         authorize('admin'), getAllUsers);
router.patch('/:id/toggle-status', authorize('admin'), toggleUserStatus);
router.delete('/:id',   authorize('admin'), deleteUser);

export default router;
