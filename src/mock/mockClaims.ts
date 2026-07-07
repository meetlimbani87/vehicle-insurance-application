export interface DamagePoint {
  area: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  description: string;
}

export interface Claim {
  id: string;
  claimNumber: string;
  policyId: string;
  policyNumber: string;
  accidentDate: string;
  location: string;
  description: string;
  status: "Filed" | "Under Review" | "Approved" | "Rejected" | "Closed";
  estimatedAmount: number | null;
  actualAmount: number | null;
  filedDate: string;
  vehicleMake: string;
  vehicleModel: string;
  registrationNo: string;
  damageAssessment?: {
    points: DamagePoint[];
    eligibility: "Eligible" | "Partially Eligible" | "Not Eligible";
    aiConfidence: number;
  };
  notes: string[];
  photos: string[];
}

export const mockClaims: Claim[] = [
  {
    id: "c1",
    claimNumber: "CLM-2024-001",
    policyId: "p1",
    policyNumber: "POL-2024-001",
    accidentDate: "2024-06-15",
    location: "Ahmedabad, Gujarat - SG Highway near Iscon Temple",
    description: "Rear-end collision at traffic signal. The vehicle in front suddenly braked, causing damage to the front bumper and headlights.",
    status: "Approved",
    estimatedAmount: 45000,
    actualAmount: 42000,
    filedDate: "2024-06-16",
    vehicleMake: "Maruti",
    vehicleModel: "Swift",
    registrationNo: "GJ01AB1234",
    damageAssessment: {
      points: [
        { area: "Front Bumper", severity: "High", description: "Cracked and displaced bumper" },
        { area: "Left Headlight", severity: "Medium", description: "Lens cracked, housing intact" },
        { area: "Hood", severity: "Low", description: "Minor dent on leading edge" },
        { area: "Radiator Grille", severity: "High", description: "Completely shattered" },
      ],
      eligibility: "Eligible",
      aiConfidence: 92,
    },
    notes: ["Photos uploaded on 16th June", "Surveyor visit scheduled", "Assessment complete"],
    photos: [],
  },
  {
    id: "c2",
    claimNumber: "CLM-2024-002",
    policyId: "p1",
    policyNumber: "POL-2024-001",
    accidentDate: "2024-08-20",
    location: "Mumbai, Maharashtra - Western Express Highway",
    description: "Side swipe damage while changing lanes on the highway during heavy rain. Right side doors and mirror damaged significantly.",
    status: "Under Review",
    estimatedAmount: 68000,
    actualAmount: null,
    filedDate: "2024-08-21",
    vehicleMake: "Maruti",
    vehicleModel: "Swift",
    registrationNo: "GJ01AB1234",
    damageAssessment: {
      points: [
        { area: "Right Front Door", severity: "High", description: "Deep scratch and dent" },
        { area: "Right Rear Door", severity: "Medium", description: "Surface scratches" },
        { area: "Right Mirror", severity: "Critical", description: "Completely broken off" },
      ],
      eligibility: "Eligible",
      aiConfidence: 88,
    },
    notes: ["Awaiting surveyor report"],
    photos: [],
  },
  {
    id: "c3",
    claimNumber: "CLM-2024-003",
    policyId: "p3",
    policyNumber: "POL-2024-003",
    accidentDate: "2024-07-10",
    location: "Delhi, Connaught Place",
    description: "Bike slipped on wet road and skidded. Damage to handlebar, left side panel, and exhaust pipe.",
    status: "Filed",
    estimatedAmount: null,
    actualAmount: null,
    filedDate: "2024-07-11",
    vehicleMake: "Royal Enfield",
    vehicleModel: "Classic 350",
    registrationNo: "DL03EF9012",
    notes: ["Claim filed, awaiting initial review"],
    photos: [],
  },
  {
    id: "c4",
    claimNumber: "CLM-2024-004",
    policyId: "p4",
    policyNumber: "POL-2024-004",
    accidentDate: "2024-05-22",
    location: "Bangalore, Electronic City",
    description: "Tree fell on the parked vehicle during a storm causing extensive roof and windshield damage.",
    status: "Approved",
    estimatedAmount: 125000,
    actualAmount: 118000,
    filedDate: "2024-05-23",
    vehicleMake: "Toyota",
    vehicleModel: "Fortuner",
    registrationNo: "KA04GH3456",
    damageAssessment: {
      points: [
        { area: "Roof", severity: "Critical", description: "Severely dented and deformed" },
        { area: "Windshield", severity: "Critical", description: "Completely shattered" },
        { area: "Front Pillars", severity: "High", description: "Bent and cracked paint" },
        { area: "Hood", severity: "Medium", description: "Multiple dents from debris" },
      ],
      eligibility: "Eligible",
      aiConfidence: 95,
    },
    notes: ["Surveyor visited", "Assessment uploaded", "Approved by underwriter"],
    photos: [],
  },
  {
    id: "c5",
    claimNumber: "CLM-2024-005",
    policyId: "p2",
    policyNumber: "POL-2024-002",
    accidentDate: "2024-04-10",
    location: "Pune, Hinjewadi",
    description: "Minor fender bender in office parking lot. Low speed impact to rear bumper.",
    status: "Rejected",
    estimatedAmount: 8000,
    actualAmount: null,
    filedDate: "2024-04-11",
    vehicleMake: "Honda",
    vehicleModel: "City",
    registrationNo: "MH02CD5678",
    damageAssessment: {
      points: [
        { area: "Rear Bumper", severity: "Low", description: "Minor scratch" },
      ],
      eligibility: "Not Eligible",
      aiConfidence: 78,
    },
    notes: ["Claim rejected: Policy is third-party only, own damage not covered"],
    photos: [],
  },
  {
    id: "c6",
    claimNumber: "CLM-2024-006",
    policyId: "p4",
    policyNumber: "POL-2024-004",
    accidentDate: "2024-09-01",
    location: "Chennai, Anna Salai",
    description: "Flood water entered the vehicle engine bay during heavy rains. Engine hydrolock suspected.",
    status: "Under Review",
    estimatedAmount: 250000,
    actualAmount: null,
    filedDate: "2024-09-02",
    vehicleMake: "Toyota",
    vehicleModel: "Fortuner",
    registrationNo: "KA04GH3456",
    damageAssessment: {
      points: [
        { area: "Engine", severity: "Critical", description: "Possible hydrolock damage" },
        { area: "ECU", severity: "High", description: "Water ingress detected" },
        { area: "Interior", severity: "Medium", description: "Water stains on seats and carpet" },
      ],
      eligibility: "Partially Eligible",
      aiConfidence: 72,
    },
    notes: ["Awaiting engine inspection report"],
    photos: [],
  },
  {
    id: "c7",
    claimNumber: "CLM-2024-007",
    policyId: "p1",
    policyNumber: "POL-2024-001",
    accidentDate: "2024-03-15",
    location: "Surat, Ring Road",
    description: "Hit a pothole at high speed causing suspension damage and tyre blowout on the left side.",
    status: "Closed",
    estimatedAmount: 22000,
    actualAmount: 19500,
    filedDate: "2024-03-16",
    vehicleMake: "Maruti",
    vehicleModel: "Swift",
    registrationNo: "GJ01AB1234",
    damageAssessment: {
      points: [
        { area: "Left Front Suspension", severity: "High", description: "Strut damaged" },
        { area: "Left Front Tyre", severity: "Critical", description: "Blown out completely" },
        { area: "Wheel Rim", severity: "Medium", description: "Bent rim" },
      ],
      eligibility: "Eligible",
      aiConfidence: 90,
    },
    notes: ["Claim settled", "Payment processed"],
    photos: [],
  },
  {
    id: "c8",
    claimNumber: "CLM-2024-008",
    policyId: "p3",
    policyNumber: "POL-2024-003",
    accidentDate: "2024-10-05",
    location: "Jaipur, MI Road",
    description: "Collision with a stray animal. Front fork bent, headlight broken and tank dented.",
    status: "Filed",
    estimatedAmount: null,
    actualAmount: null,
    filedDate: "2024-10-06",
    vehicleMake: "Royal Enfield",
    vehicleModel: "Classic 350",
    registrationNo: "DL03EF9012",
    notes: ["Claim registered, pending photo upload"],
    photos: [],
  },
];
