export interface Payment {
  id: string;
  policyId: string;
  policyNumber: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: "Paid" | "Pending" | "Overdue";
  receiptNo: string | null;
  interval?: "one-time" | "monthly" | "quarterly" | "half-yearly" | "annually";
}

export const mockPayments: Payment[] = [
  { id: "pay1", policyId: "a776c771-04f6-44ce-8556-f7762136b986", policyNumber: "POL-2024-001", amount: 12500, dueDate: "2024-01-01", paidDate: "2024-01-01", status: "Paid", receiptNo: "REC-001" },
  { id: "pay2", policyId: "a776c771-04f6-44ce-8556-f7762136b986", policyNumber: "POL-2024-001", amount: 12500, dueDate: "2025-01-01", paidDate: "2025-01-02", status: "Paid", receiptNo: "REC-007" },
  { id: "pay3", policyId: "981bc882-15f7-41ab-a23d-e8821471b012", policyNumber: "POL-2024-002", amount: 8900, dueDate: "2023-06-15", paidDate: "2023-06-15", status: "Paid", receiptNo: "REC-002" },
  { id: "pay4", policyId: "4481ca09-32e1-4c12-b918-a1193395c801", policyNumber: "POL-2024-003", amount: 4500, dueDate: "2024-03-01", paidDate: "2024-03-01", status: "Paid", receiptNo: "REC-003" },
  { id: "pay5", policyId: "4481ca09-32e1-4c12-b918-a1193395c801", policyNumber: "POL-2024-003", amount: 4500, dueDate: "2025-03-01", paidDate: null, status: "Pending", receiptNo: null },
  { id: "pay6", policyId: "7762136b-9861-4fa3-8012-c22198129034", policyNumber: "POL-2024-004", amount: 28000, dueDate: "2024-02-01", paidDate: "2024-02-01", status: "Paid", receiptNo: "REC-004" },
  { id: "pay7", policyId: "7762136b-9861-4fa3-8012-c22198129034", policyNumber: "POL-2024-004", amount: 28000, dueDate: "2025-02-01", paidDate: null, status: "Pending", receiptNo: null },
  { id: "pay8", policyId: "5512b901-771c-4299-9011-d11234918230", policyNumber: "POL-2024-005", amount: 15000, dueDate: "2024-01-15", paidDate: "2024-01-16", status: "Paid", receiptNo: "REC-005" },
  { id: "pay9", policyId: "a776c771-04f6-44ce-8556-f7762136b986", policyNumber: "POL-2024-001", amount: 12500, dueDate: "2025-07-01", paidDate: null, status: "Pending", receiptNo: null },
  { id: "pay10", policyId: "981bc882-15f7-41ab-a23d-e8821471b012", policyNumber: "POL-2024-002", amount: 8900, dueDate: "2024-06-15", paidDate: null, status: "Overdue", receiptNo: null },
];
