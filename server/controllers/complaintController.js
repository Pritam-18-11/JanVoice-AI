import Complaint from '../models/Complaint.js';
import { reverseGeocode } from '../services/geocodeService.js';
import { transcribeAudio } from '../services/whisperService.js';
import { verifyImage } from '../services/visionService.js';
import { analyzeComplaint } from '../services/aiService.js';
import { findDuplicate } from '../services/duplicateService.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js';

// @route POST /api/complaints  (protected) — runs the full AI pipeline synchronously
export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, landmark, lat, lng } = req.body;

    if (!description || !category || !lat || !lng) {
      return res.status(400).json({ message: 'Description, category and location are required' });
    }

    const imageFile = req.files?.image?.[0];
    const voiceFile = req.files?.voice?.[0];

    // 1. Reverse geocode the GPS coordinates — authoritative, always recomputed server-side
    const { areaName, ward, district } = await reverseGeocode(parseFloat(lat), parseFloat(lng));

    // 2. Transcribe voice note (Whisper) and upload it to Cloudinary in parallel
    let voiceText = null;
    let voiceUploadResult = null;
    if (voiceFile) {
      [voiceText, voiceUploadResult] = await Promise.all([
        transcribeAudio(voiceFile.buffer, voiceFile.originalname, voiceFile.mimetype),
        uploadBufferToCloudinary(voiceFile.buffer, 'janvoice-ai/voice', 'video'), // Cloudinary stores audio under 'video' resource type
      ]);
    }

    // 3. Verify uploaded image with Gemini Vision + upload to Cloudinary in parallel
    let imageVerification = { verified: false, classification: 'No image provided', confidence: 0 };
    let imageUploadResult = null;
    if (imageFile) {
      [imageVerification, imageUploadResult] = await Promise.all([
        verifyImage(imageFile.buffer, imageFile.mimetype, category),
        uploadBufferToCloudinary(imageFile.buffer, 'janvoice-ai/complaints', 'image'),
      ]);
    }

    // 4. Gemini text triage — summary, severity, priority, impact, recommendation
    const aiResult = await analyzeComplaint({
      description,
      voiceText,
      category,
      landmark,
      areaName,
      imageVerified: imageVerification.verified,
      imageConfidence: imageVerification.confidence,
    });

    // 5. Duplicate / cluster detection — bump the existing issue's merge count
    const duplicate = await findDuplicate(category, ward);
    if (duplicate) {
      duplicate.mergedCount += 1;
      duplicate.priorityScore = Math.min(100, duplicate.priorityScore + 3);
      await duplicate.save();
    }

    const complaint = await Complaint.create({
      citizen: req.user._id,
      title: title || `${category} Issue`,
      description,
      category,
      severity: aiResult.severity,
      landmark,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      areaName,
      ward,
      district,
      voiceUrl: voiceUploadResult?.secure_url || null,
      voiceText,
      imageUrl: imageUploadResult?.secure_url || null,
      imageClassification: imageVerification.classification,
      imageConfidence: imageVerification.confidence,
      status: 'AI Processing',
      priorityScore: aiResult.priorityScore,
      peopleAffected: aiResult.peopleAffected,
      impact: aiResult.impact,
      summary: aiResult.summary,
      recommendation: aiResult.recommendation,
      aiConfidenceScore: aiResult.confidenceScore,
      duplicateOf: duplicate ? duplicate._id : null,
      mergedCount: 1,
    });

    // Mark the "AI Processing" timeline step complete since we ran the pipeline synchronously
    complaint.timeline = complaint.timeline.map((step) =>
      step.status === 'AI Processing'
        ? { ...step.toObject(), time: new Date(), description: `AI pipeline complete — ${aiResult.confidenceScore}% confidence.`, active: true }
        : step
    );
    await complaint.save();

    res.status(201).json(complaint);
  } catch (error) {
    console.error('createComplaint error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/complaints  (protected) — supports ?category=&status=&ward=&search=
export const getComplaints = async (req, res) => {
  try {
    const { category, status, ward, search } = req.query;
    const filter = {};

    if (category && category !== 'All') filter.category = category;
    if (status && status !== 'All') filter.status = status;
    if (ward && ward !== 'All') filter.ward = ward;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { id: { $regex: search, $options: 'i' } },
      ];
    }

    if (req.user.role === 'citizen') {
      filter.citizen = req.user._id;
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/complaints/:id  (protected) — :id is the human tracking id
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ id: req.params.id });
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PATCH /api/complaints/:id/status  (protected, mla/admin only)
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status, description } = req.body;
    const complaint = await Complaint.findOne({ id: req.params.id });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = status;
    complaint.timeline = complaint.timeline.map((step) => {
      if (step.status === status) {
        return { ...step.toObject(), time: new Date(), description: description || step.description, active: true };
      }
      return step;
    });

    await complaint.save();
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};