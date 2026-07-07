import { z } from "zod";

export const createClaimSchema = z.object({
  policyId: z.string().min(1, "Select a policy"),
  accidentDate: z.string().min(1, "Date is required"),
  location: z.string().min(3, "Location is required"),
  description: z.string().min(20, "Describe the incident in at least 20 characters"),
});

export type CreateClaimInput = z.infer<typeof createClaimSchema>;

export const updateClaimAmountSchema = z.object({
  actualAmount: z.coerce.number().positive("Enter a valid amount"),
});

export type UpdateClaimAmountInput = z.infer<typeof updateClaimAmountSchema>;
