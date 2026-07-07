export interface Policy {
  id: string;
  policyNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  registrationNo: string;
  vehicleType: "two-wheeler" | "car" | "suv" | "commercial";
  insuranceCompany: string;
  coverageType: "comprehensive" | "third-party" | "own-damage";
  startDate: string;
  endDate: string;
  status: "Active" | "Expired" | "Renewed" | "Cancelled" | "Pending";
  premiumAmount: number;
  ownerName: string;
  notes?: string;
}

export const mockPolicies: Policy[] = [
  {
    id: "p1",
    policyNumber: "POL-2024-001",
    vehicleMake: "Maruti",
    vehicleModel: "Swift",
    vehicleYear: "2021",
    registrationNo: "GJ01AB1234",
    vehicleType: "car",
    insuranceCompany: "HDFC Ergo",
    coverageType: "comprehensive",
    startDate: "2024-01-01",
    endDate: "2025-06-01",
    status: "Active",
    premiumAmount: 12500,
    ownerName: "Rahul Sharma",
  },
  {
    id: "p2",
    policyNumber: "POL-2024-002",
    vehicleMake: "Honda",
    vehicleModel: "City",
    vehicleYear: "2020",
    registrationNo: "MH02CD5678",
    vehicleType: "car",
    insuranceCompany: "ICICI Lombard",
    coverageType: "third-party",
    startDate: "2023-06-15",
    endDate: "2024-06-15",
    status: "Expired",
    premiumAmount: 8900,
    ownerName: "Rahul Sharma",
  },
  {
    id: "p3",
    policyNumber: "POL-2024-003",
    vehicleMake: "Royal Enfield",
    vehicleModel: "Classic 350",
    vehicleYear: "2022",
    registrationNo: "DL03EF9012",
    vehicleType: "two-wheeler",
    insuranceCompany: "Bajaj Allianz",
    coverageType: "comprehensive",
    startDate: "2024-03-01",
    endDate: "2025-03-01",
    status: "Active",
    premiumAmount: 4500,
    ownerName: "Rahul Sharma",
  },
  {
    id: "p4",
    policyNumber: "POL-2024-004",
    vehicleMake: "Toyota",
    vehicleModel: "Fortuner",
    vehicleYear: "2023",
    registrationNo: "KA04GH3456",
    vehicleType: "suv",
    insuranceCompany: "New India Assurance",
    coverageType: "comprehensive",
    startDate: "2024-02-01",
    endDate: "2025-02-01",
    status: "Renewed",
    premiumAmount: 28000,
    ownerName: "Rahul Sharma",
  },
  {
    id: "p5",
    policyNumber: "POL-2024-005",
    vehicleMake: "Tata",
    vehicleModel: "Ace",
    vehicleYear: "2019",
    registrationNo: "TN05IJ7890",
    vehicleType: "commercial",
    insuranceCompany: "United India",
    coverageType: "own-damage",
    startDate: "2024-01-15",
    endDate: "2024-07-15",
    status: "Cancelled",
    premiumAmount: 15000,
    ownerName: "Rahul Sharma",
  },
];
