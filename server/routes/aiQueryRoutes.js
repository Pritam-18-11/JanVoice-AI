import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { askAIAssistant } from '../controllers/aiQueryController.js';

const router = express.Router();

router.post('/', protect, authorize('mla', 'admin'), askAIAssistant);

export default router;