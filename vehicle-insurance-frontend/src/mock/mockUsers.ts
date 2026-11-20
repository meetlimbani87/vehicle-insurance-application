export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  status: "Active" | "Suspended";
  policiesCount: number;
  claimsCount: number;
  joinedDate: string;
}

export const mockUsers: User[] = [
  { id: "u1", name: "Rahul Sharma", email: "rahul@example.com", phone: "9876543210", role: "user", status: "Active", policiesCount: 3, claimsCount: 5, joinedDate: "2023-06-01" },
  { id: "u2", name: "Priya Patel", email: "priya@example.com", phone: "9876543211", role: "user", status: "Active", policiesCount: 2, claimsCount: 1, joinedDate: "2023-08-15" },
  { id: "u3", name: "Amit Kumar", email: "amit@example.com", phone: "9876543212", role: "user", status: "Active", policiesCount: 1, claimsCount: 0, joinedDate: "2024-01-10" },
  { id: "u4", name: "Sneha Reddy", email: "sneha@example.com", phone: "9876543213", role: "user", status: "Suspended", policiesCount: 2, claimsCount: 3, joinedDate: "2023-09-20" },
  { id: "u5", name: "Vikram Singh", email: "vikram@example.com", phone: "9876543214", role: "user", status: "Active", policiesCount: 4, claimsCount: 2, joinedDate: "2023-05-12" },
  { id: "u6", name: "Meera Nair", email: "meera@example.com", phone: "9876543215", role: "user", status: "Active", policiesCount: 1, claimsCount: 1, joinedDate: "2024-02-28" },
  { id: "u7", name: "Karan Malhotra", email: "karan@example.com", phone: "9876543216", role: "user", status: "Active", policiesCount: 3, claimsCount: 4, joinedDate: "2023-11-05" },
  { id: "u8", name: "Deepa Iyer", email: "deepa@example.com", phone: "9876543217", role: "user", status: "Suspended", policiesCount: 1, claimsCount: 2, joinedDate: "2024-03-15" },
  { id: "u9", name: "Arjun Verma", email: "arjun@example.com", phone: "9876543218", role: "admin", status: "Active", policiesCount: 0, claimsCount: 0, joinedDate: "2023-01-01" },
  { id: "u10", name: "Nisha Gupta", email: "nisha@example.com", phone: "9876543219", role: "user", status: "Active", policiesCount: 2, claimsCount: 1, joinedDate: "2024-04-01" },
];
