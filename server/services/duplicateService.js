import Complaint from '../models/Complaint.js';

// Simple heuristic duplicate/cluster detection for the hackathon build:
// treats an unresolved complaint in the same category + ward as the same
// underlying civic issue. (Future upgrade: embedding similarity on the
// description text for a more precise match across ward boundaries.)
export async function findDuplicate(category, ward) {
  if (!category || !ward) return null;
  return Complaint.findOne({
    category,
    ward,
    status: { $ne: 'Resolved' },
  }).sort({ createdAt: -1 });
}