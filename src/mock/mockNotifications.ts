export interface Notification {
  id: string;
  type: "payment" | "claim" | "policy" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon: string;
}

export const mockNotifications: Notification[] = [
  { id: "n1", type: "payment", title: "Payment Due", message: "Your premium of ₹12,500 for POL-2024-001 is due on July 1st.", timestamp: "2025-06-25T10:00:00Z", read: false, icon: "CreditCard" },
  { id: "n2", type: "claim", title: "Claim Under Review", message: "Your claim CLM-2024-002 is now being reviewed by our team.", timestamp: "2025-06-24T14:30:00Z", read: false, icon: "FileText" },
  { id: "n3", type: "policy", title: "Policy Renewed", message: "POL-2024-004 has been successfully renewed for another year.", timestamp: "2025-06-23T09:15:00Z", read: true, icon: "Shield" },
  { id: "n4", type: "claim", title: "Claim Approved", message: "Your claim CLM-2024-001 has been approved. Amount: ₹42,000.", timestamp: "2025-06-22T16:45:00Z", read: true, icon: "CheckCircle" },
  { id: "n5", type: "system", title: "System Update", message: "We've updated our terms of service. Please review the changes.", timestamp: "2025-06-21T08:00:00Z", read: false, icon: "Bell" },
  { id: "n6", type: "payment", title: "Payment Received", message: "Payment of ₹28,000 received for POL-2024-004.", timestamp: "2025-06-20T12:30:00Z", read: true, icon: "CreditCard" },
  { id: "n7", type: "claim", title: "Claim Rejected", message: "Claim CLM-2024-005 has been rejected. Reason: Third-party policy.", timestamp: "2025-06-19T11:00:00Z", read: true, icon: "XCircle" },
  { id: "n8", type: "policy", title: "Policy Expiring Soon", message: "POL-2024-003 expires in 30 days. Renew now to avoid lapse.", timestamp: "2025-06-18T15:20:00Z", read: false, icon: "AlertTriangle" },
  { id: "n9", type: "system", title: "Welcome!", message: "Welcome to the Vehicle Insurance Application. Complete your profile.", timestamp: "2025-06-01T10:00:00Z", read: true, icon: "UserPlus" },
  { id: "n10", type: "claim", title: "New Document Required", message: "Please upload your FIR copy for claim CLM-2024-008.", timestamp: "2025-06-17T09:45:00Z", read: false, icon: "Upload" },
];
