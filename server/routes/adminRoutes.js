import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getUsers, updateUserRole, updateUserStatus } from '../controllers/adminController.js';

const router = express.Router();

router.get('/users', protect, authorize('admin'), getUsers);
router.patch('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.patch('/users/:id/status', protect, authorize('admin'), updateUserStatus);

export default router;