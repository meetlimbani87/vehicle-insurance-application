export interface Payment {
  id: string;
  policyId: string;
  policyNumber: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: "Paid" | "Pending" | "Overdue";
  receiptNo: string | null;
}

export const mockPayments: Payment[] = [
  { id: "pay1", policyId: "p1", policyNumber: "POL-2024-001", amount: 12500, dueDate: "2024-01-01", paidDate: "2024-01-01", status: "Paid", receiptNo: "REC-001" },
  { id: "pay2", policyId: "p1", policyNumber: "POL-2024-001", amount: 12500, dueDate: "2025-01-01", paidDate: "2025-01-02", status: "Paid", receiptNo: "REC-007" },
  { id: "pay3", policyId: "p2", policyNumber: "POL-2024-002", amount: 8900, dueDate: "2023-06-15", paidDate: "2023-06-15", status: "Paid", receiptNo: "REC-002" },
  { id: "pay4", policyId: "p3", policyNumber: "POL-2024-003", amount: 4500, dueDate: "2024-03-01", paidDate: "2024-03-01", status: "Paid", receiptNo: "REC-003" },
  { id: "pay5", policyId: "p3", policyNumber: "POL-2024-003", amount: 4500, dueDate: "2025-03-01", paidDate: null, status: "Pending", receiptNo: null },
  { id: "pay6", policyId: "p4", policyNumber: "POL-2024-004", amount: 28000, dueDate: "2024-02-01", paidDate: "2024-02-01", status: "Paid", receiptNo: "REC-004" },
  { id: "pay7", policyId: "p4", policyNumber: "POL-2024-004", amount: 28000, dueDate: "2025-02-01", paidDate: null, status: "Pending", receiptNo: null },
  { id: "pay8", policyId: "p5", policyNumber: "POL-2024-005", amount: 15000, dueDate: "2024-01-15", paidDate: "2024-01-16", status: "Paid", receiptNo: "REC-005" },
  { id: "pay9", policyId: "p1", policyNumber: "POL-2024-001", amount: 12500, dueDate: "2025-07-01", paidDate: null, status: "Pending", receiptNo: null },
  { id: "pay10", policyId: "p2", policyNumber: "POL-2024-002", amount: 8900, dueDate: "2024-06-15", paidDate: null, status: "Overdue", receiptNo: null },
];
