import mongoose from 'mongoose';

const timelineStepSchema = new mongoose.Schema(
  {
    status: String,
    time: { type: Date, default: null },
    description: String,
    active: { type: Boolean, default: false },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    landmark: { type: String, default: '' },

    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    areaName: String,
    ward: String,
    district: String,

    voiceUrl: { type: String, default: null },
    voiceText: { type: String, default: null },
    voiceLanguage: { type: String, default: null }, // detected by Whisper — proof of multilingual support

    imageUrl: { type: String, default: null },
    imageClassification: { type: String, default: 'Not yet processed by AI pipeline' },
    imageConfidence: { type: Number, default: null },

    status: {
      type: String,
      enum: ['Submitted', 'AI Processing', 'MLA Reviewed', 'Resolved'],
      default: 'Submitted',
    },

    priorityScore: { type: Number, default: 50 },
    peopleAffected: { type: String, default: 'Pending AI Calculation' },
    impact: { type: String, default: 'Awaiting AI Analysis' },
    summary: { type: String, default: 'AI processing in progress...' },
    recommendation: { type: String, default: 'Suggested solution pending AI pipeline.' },
    aiConfidenceScore: { type: Number, default: null },

    duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', default: null },
    mergedCount: { type: Number, default: 1 },

    timeline: [timelineStepSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// BUG FIX (Phase 3): the frontend has always read `complaint.timestamp`, but the
// schema never defined that field — only Mongoose's auto `createdAt` existed.
// This virtual makes `.timestamp` return `createdAt` in every API response,
// with zero frontend changes required.
complaintSchema.virtual('timestamp').get(function () {
  return this.createdAt;
});

complaintSchema.pre('save', function (next) {
  if (this.isNew) {
    if (!this.id) {
      const year = new Date().getFullYear();
      const random = Math.floor(1000 + Math.random() * 9000);
      this.id = `JV-${year}-${random}`;
    }
    if (!this.timeline || this.timeline.length === 0) {
      this.timeline = [
        { status: 'Submitted', time: new Date(), description: 'Complaint successfully lodged by citizen.', active: true },
        { status: 'AI Processing', time: null, description: 'Voice translation and image verification queued.', active: false },
        { status: 'MLA Reviewed', time: null, description: 'Awaiting review by public representative.', active: false },
        { status: 'Resolved', time: null, description: 'Grievance resolved.', active: false },
      ];
    }
  }
  next();
});

export default mongoose.model('Complaint', complaintSchema);