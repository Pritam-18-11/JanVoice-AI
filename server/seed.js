import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import User from './models/User.js';
import Complaint from './models/Complaint.js';

// Phase 4 — seeds the database with a richer, realistic dataset so charts,
// the heatmap, and the AI Assistant all have enough data to look impressive
// live during judging. Safe to re-run: it wipes only the seeded demo records.

const WARDS = [
  { ward: 'Ward 4', areaName: 'Station Area, Ward 4', district: 'North 24 Parganas', lat: 22.6934, lng: 88.4410 },
  { ward: 'Ward 8', areaName: 'Municipal Market, Ward 8', district: 'North 24 Parganas', lat: 22.7002, lng: 88.4470 },
  { ward: 'Ward 10', areaName: 'Madhyamgram, Ward 10', district: 'North 24 Parganas', lat: 22.6985, lng: 88.4532 },
  { ward: 'Ward 12', areaName: 'Kolkata Road, Ward 12', district: 'North 24 Parganas', lat: 22.7012, lng: 88.4590 },
];

const CATEGORIES = [
  'Road Infrastructure', 'Drainage & Sewerage', 'Electricity & Lighting',
  'Water Supply', 'Solid Waste & Garbage', 'Public Transport',
  'Healthcare/Hospitals', 'School Infrastructure', 'Agriculture Development',
];

const TITLES = {
  'Road Infrastructure': ['Severe Road Damage Near Market', 'Pothole Cluster on Main Road', 'Broken Speed Breaker Causing Accidents'],
  'Drainage & Sewerage': ['Clogged Drainage and Flooding', 'Open Sewer Overflow', 'Waterlogging After Rainfall'],
  'Electricity & Lighting': ['Streetlight Malfunction', 'Frequent Power Outages', 'Exposed Live Wire Hazard'],
  'Water Supply': ['Irregular Water Supply', 'Contaminated Drinking Water', 'Water Pipeline Leakage'],
  'Solid Waste & Garbage': ['Uncollected Garbage Pile-up', 'Overflowing Community Bin', 'Illegal Dumping Near School'],
  'Public Transport': ['Bus Stop Shelter Damaged', 'Irregular Bus Frequency', 'Unsafe Auto Stand Congestion'],
  'Healthcare/Hospitals': ['Understaffed Primary Health Centre', 'Medicine Shortage at Clinic', 'Ambulance Response Delay'],
  'School Infrastructure': ['Damaged School Boundary Wall', 'No Clean Drinking Water at School', 'Classroom Roof Leakage'],
  'Agriculture Development': ['Irrigation Canal Blockage', 'Crop Damage from Flooding', 'Lack of Cold Storage Access'],
};

const SEVERITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Submitted', 'AI Processing', 'MLA Reviewed', 'Resolved'];

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(min + Math.random() * (max - min + 1));

const seed = async () => {
  await connectDB();

  console.log('🌱 Seeding demo data...');

  // 1. Demo users (safe to re-run — upserts by email)
  const demoUsers = [
    { name: 'Pritam Saha', email: 'mla.demo@janvoice.in', password: 'password123', role: 'mla', ward: 'Ward 10', phone: '+919000000001' },
    { name: 'Admin Console', email: 'admin.demo@janvoice.in', password: 'password123', role: 'admin', ward: 'Ward 10', phone: '+919000000002' },
    { name: 'Ritika Sen', email: 'citizen.demo@janvoice.in', password: 'password123', role: 'citizen', ward: 'Ward 4', phone: '+919000000003' },
  ];

  const citizenIds = [];
  for (const u of demoUsers) {
    let existing = await User.findOne({ email: u.email });
    if (!existing) {
      existing = await User.create(u); // pre-save hook hashes the password
      console.log(`  ✓ Created ${u.role} user: ${u.email}`);
    } else {
      console.log(`  → ${u.role} user already exists: ${u.email}`);
    }
    if (existing.role === 'citizen') citizenIds.push(existing._id);
  }
  if (citizenIds.length === 0) citizenIds.push((await User.findOne({ role: 'citizen' }))._id);

  // 2. Clear only previously-seeded demo complaints (marked with a recognizable prefix in description)
  await Complaint.deleteMany({ description: { $regex: '^\\[SEEDED DEMO DATA\\]' } });

  // 3. Generate ~28 realistic complaints spread across the last 21 days
  const complaintsToCreate = [];
  for (let i = 0; i < 28; i++) {
    const category = randomFrom(CATEGORIES);
    const wardInfo = randomFrom(WARDS);
    const title = randomFrom(TITLES[category]);
    const severity = randomFrom(SEVERITIES);
    const status = randomFrom(STATUSES);
    const priorityScore = severity === 'High' ? randomInt(75, 98) : severity === 'Medium' ? randomInt(45, 74) : randomInt(15, 44);
    const daysAgo = randomInt(0, 21);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    const timeline = [
      { status: 'Submitted', time: createdAt, description: 'Complaint successfully lodged by citizen.', active: true },
      { status: 'AI Processing', time: new Date(createdAt.getTime() + 2 * 60000), description: 'AI pipeline complete.', active: true },
      { status: 'MLA Reviewed', time: status !== 'Submitted' && status !== 'AI Processing' ? new Date(createdAt.getTime() + 86400000) : null, description: 'Reviewed by MLA office.', active: status !== 'Submitted' && status !== 'AI Processing' },
      { status: 'Resolved', time: status === 'Resolved' ? new Date(createdAt.getTime() + 3 * 86400000) : null, description: 'Grievance resolved.', active: status === 'Resolved' },
    ];

    complaintsToCreate.push({
      citizen: randomFrom(citizenIds),
      title,
      description: `[SEEDED DEMO DATA] ${title} reported near ${wardInfo.areaName}. Citizens describe significant daily disruption requiring administrative attention.`,
      category,
      severity,
      landmark: 'Near Local Government School',
      location: { lat: wardInfo.lat + (Math.random() - 0.5) * 0.01, lng: wardInfo.lng + (Math.random() - 0.5) * 0.01 },
      areaName: wardInfo.areaName,
      ward: wardInfo.ward,
      district: wardInfo.district,
      imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80',
      imageClassification: `Verified: ${category} issue (${randomInt(72, 97)}% confidence)`,
      imageConfidence: randomInt(72, 97),
      status,
      priorityScore,
      peopleAffected: `${randomInt(2, 30) * 100}+`,
      impact: 'Significant disruption to daily civic life and safety.',
      summary: `${title} causing ongoing issues for residents near ${wardInfo.areaName}.`,
      recommendation: 'Dispatch a municipal inspection team and allocate corrective maintenance budget.',
      aiConfidenceScore: randomInt(80, 98),
      mergedCount: randomInt(1, 4),
      createdAt,
      timeline,
    });
  }

  // Insert one by one so the pre-save hook can generate tracking IDs
  for (const c of complaintsToCreate) {
    const doc = new Complaint(c);
    doc.createdAt = c.createdAt; // preserve the backdated timestamp after the pre-save hook runs
    await doc.save();
  }

  console.log(`  ✓ Seeded ${complaintsToCreate.length} demo complaints across ${WARDS.length} wards`);
  console.log('✅ Seeding complete.');
  console.log('\nDemo login credentials:');
  demoUsers.forEach((u) => console.log(`  ${u.role.toUpperCase()}: ${u.email} / password123`));

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});