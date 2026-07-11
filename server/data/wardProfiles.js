// Reference "local development plan" / public dataset context per constituency ward.
// In production this would sync from real open-data portals (Census, School UDISE+,
// health infra registries). For the hackathon build, this is a realistic static
// reference dataset the AI grounds its recommendations in — directly answering the
// problem statement's challenge to weigh proposals against real demand (population,
// school enrollment, travel distance, existing infrastructure & development plans).
const wardProfiles = {
  'Ward 4': {
    population: 18500,
    literacyRate: '81%',
    schools: 3,
    schoolEnrollment: 1240,
    avgSchoolTravelDistanceKm: 2.1,
    hospitals: 1,
    avgHospitalTravelDistanceKm: 3.4,
    existingDevelopmentPlans: ['Streetlight LED upgrade (planned, unfunded)', 'Station road widening (in progress)'],
    infrastructureGaps: ['No dedicated drainage for station market', 'Single primary health centre for 18k+ population'],
  },
  'Ward 8': {
    population: 22300,
    literacyRate: '76%',
    schools: 4,
    schoolEnrollment: 2100,
    avgSchoolTravelDistanceKm: 1.6,
    hospitals: 0,
    avgHospitalTravelDistanceKm: 5.8,
    existingDevelopmentPlans: ['Municipal market renovation (approved)', 'Community health sub-centre (proposed, awaiting budget)'],
    infrastructureGaps: ['No hospital within ward boundary', 'Garbage collection frequency below municipal standard'],
  },
  'Ward 10': {
    population: 26800,
    literacyRate: '84%',
    schools: 5,
    schoolEnrollment: 3400,
    avgSchoolTravelDistanceKm: 1.2,
    hospitals: 1,
    avgHospitalTravelDistanceKm: 2.0,
    existingDevelopmentPlans: ['Government school road resurfacing (proposed)', 'Vocational training centre (under evaluation)'],
    infrastructureGaps: ['High school-zone traffic congestion', 'Aging drainage infrastructure near school cluster'],
  },
  'Ward 12': {
    population: 15200,
    literacyRate: '79%',
    schools: 2,
    schoolEnrollment: 980,
    avgSchoolTravelDistanceKm: 3.0,
    hospitals: 1,
    avgHospitalTravelDistanceKm: 1.5,
    existingDevelopmentPlans: ['Kolkata Road drainage desilting (approved)', 'Agricultural cold storage feasibility study (proposed)'],
    infrastructureGaps: ['Limited public transport connectivity', 'Recurring waterlogging near medical centre'],
  },
};

// Graceful fallback for wards outside the reference dataset — the AI still gets
// *some* context instead of none (e.g. wards resolved live via Nominatim).
const DEFAULT_PROFILE = {
  population: 'Unknown', literacyRate: 'Unknown', schools: 'Unknown', schoolEnrollment: 'Unknown',
  avgSchoolTravelDistanceKm: 'Unknown', hospitals: 'Unknown', avgHospitalTravelDistanceKm: 'Unknown',
  existingDevelopmentPlans: [], infrastructureGaps: [],
};

export function getWardProfile(ward) {
  return wardProfiles[ward] || DEFAULT_PROFILE;
}

export function getAllWardProfiles() {
  return wardProfiles;
}