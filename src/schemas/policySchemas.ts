import { z } from "zod";

export const vehicleStepSchema = z.object({
  vehicleMake: z.string().min(1, "Required"),
  vehicleModel: z.string().min(1, "Required"),
  vehicleYear: z.string().regex(/^\d{4}$/, "Enter a valid year"),
  registrationNo: z.string().min(1, "Required"),
  vehicleType: z.enum(["two-wheeler", "car", "suv", "commercial"]),
});

export const policyStepSchema = z.object({
  policyNumber: z.string().min(1, "Required"),
  insuranceCompany: z.string().min(1, "Required"),
  startDate: z.string().min(1, "Required"),
  endDate: z.string().min(1, "Required"),
  coverageType: z.enum(["comprehensive", "third-party", "own-damage"]),
});

export const createPolicySchema = vehicleStepSchema.merge(policyStepSchema);

export type CreatePolicyInput = z.infer<typeof createPolicySchema>;
export type VehicleStepInput = z.infer<typeof vehicleStepSchema>;
export type PolicyStepInput = z.infer<typeof policyStepSchema>;
