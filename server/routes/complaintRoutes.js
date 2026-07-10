import express from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
} from '../controllers/complaintController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { complaintLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post(
  '/',
  protect,
  complaintLimiter,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'voice', maxCount: 1 },
  ]),
  createComplaint
);
router.get('/', protect, getComplaints);
router.get('/:id', protect, getComplaintById);
router.patch('/:id/status', protect, authorize('mla', 'admin'), updateComplaintStatus);

export default router;