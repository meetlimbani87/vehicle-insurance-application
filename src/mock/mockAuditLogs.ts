export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  ip: string;
}

export const mockAuditLogs: AuditLog[] = [
  { id: "al1", timestamp: "2024-10-10T10:30:00Z", userId: "u1", userName: "Rahul Sharma", action: "CREATE", entity: "Claim", entityId: "c8", ip: "192.168.1.101" },
  { id: "al2", timestamp: "2024-10-09T14:15:00Z", userId: "u9", userName: "Arjun Verma", action: "APPROVE", entity: "Claim", entityId: "c4", ip: "10.0.0.5" },
  { id: "al3", timestamp: "2024-10-09T12:00:00Z", userId: "u1", userName: "Rahul Sharma", action: "UPDATE", entity: "Policy", entityId: "p1", ip: "192.168.1.101" },
  { id: "al4", timestamp: "2024-10-08T09:45:00Z", userId: "u9", userName: "Arjun Verma", action: "REJECT", entity: "Claim", entityId: "c5", ip: "10.0.0.5" },
  { id: "al5", timestamp: "2024-10-07T16:30:00Z", userId: "u2", userName: "Priya Patel", action: "CREATE", entity: "Policy", entityId: "p6", ip: "192.168.1.102" },
  { id: "al6", timestamp: "2024-10-07T11:20:00Z", userId: "u5", userName: "Vikram Singh", action: "UPLOAD", entity: "Document", entityId: "d12", ip: "192.168.1.105" },
  { id: "al7", timestamp: "2024-10-06T08:10:00Z", userId: "u9", userName: "Arjun Verma", action: "SUSPEND", entity: "User", entityId: "u4", ip: "10.0.0.5" },
  { id: "al8", timestamp: "2024-10-05T15:55:00Z", userId: "u7", userName: "Karan Malhotra", action: "CREATE", entity: "Claim", entityId: "c9", ip: "192.168.1.107" },
  { id: "al9", timestamp: "2024-10-05T13:40:00Z", userId: "u1", userName: "Rahul Sharma", action: "PAYMENT", entity: "Payment", entityId: "pay2", ip: "192.168.1.101" },
  { id: "al10", timestamp: "2024-10-04T10:25:00Z", userId: "u3", userName: "Amit Kumar", action: "LOGIN", entity: "Session", entityId: "s45", ip: "192.168.1.103" },
  { id: "al11", timestamp: "2024-10-04T09:00:00Z", userId: "u9", userName: "Arjun Verma", action: "UPDATE", entity: "Maintenance", entityId: "m1", ip: "10.0.0.5" },
  { id: "al12", timestamp: "2024-10-03T17:30:00Z", userId: "u6", userName: "Meera Nair", action: "CREATE", entity: "Policy", entityId: "p7", ip: "192.168.1.106" },
  { id: "al13", timestamp: "2024-10-03T14:15:00Z", userId: "u2", userName: "Priya Patel", action: "CREATE", entity: "Claim", entityId: "c10", ip: "192.168.1.102" },
  { id: "al14", timestamp: "2024-10-02T11:45:00Z", userId: "u9", userName: "Arjun Verma", action: "CLOSE", entity: "Claim", entityId: "c7", ip: "10.0.0.5" },
  { id: "al15", timestamp: "2024-10-02T08:30:00Z", userId: "u5", userName: "Vikram Singh", action: "UPDATE", entity: "Profile", entityId: "u5", ip: "192.168.1.105" },
  { id: "al16", timestamp: "2024-10-01T16:00:00Z", userId: "u7", userName: "Karan Malhotra", action: "UPLOAD", entity: "Document", entityId: "d15", ip: "192.168.1.107" },
  { id: "al17", timestamp: "2024-10-01T13:20:00Z", userId: "u1", userName: "Rahul Sharma", action: "CREATE", entity: "Claim", entityId: "c3", ip: "192.168.1.101" },
  { id: "al18", timestamp: "2024-09-30T10:10:00Z", userId: "u9", userName: "Arjun Verma", action: "APPROVE", entity: "Claim", entityId: "c1", ip: "10.0.0.5" },
  { id: "al19", timestamp: "2024-09-29T15:45:00Z", userId: "u10", userName: "Nisha Gupta", action: "CREATE", entity: "Policy", entityId: "p8", ip: "192.168.1.110" },
  { id: "al20", timestamp: "2024-09-28T09:30:00Z", userId: "u9", userName: "Arjun Verma", action: "LOGIN", entity: "Session", entityId: "s40", ip: "10.0.0.5" },
];
