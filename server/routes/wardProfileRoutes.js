import express from 'express';
import { protect } from '../middleware/auth.js';
import { getAllWardProfiles } from '../data/wardProfiles.js';

const router = express.Router();

// GET /api/ward-profiles — powers the "Constituency Development Context" panel
router.get('/', protect, (req, res) => {
  res.json(getAllWardProfiles());
});

export default router;