import express from 'express';
import { protect } from '../middleware/auth.js';
import { reverseGeocode } from '../services/geocodeService.js';

const router = express.Router();

// GET /api/geocode?lat=..&lng=..  — used live by MapPicker while the citizen is filling the form
router.get('/', protect, async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ message: 'lat and lng query params are required' });
  }
  const result = await reverseGeocode(parseFloat(lat), parseFloat(lng));
  res.json(result);
});

export default router;