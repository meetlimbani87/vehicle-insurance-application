import { z } from "zod";

export const vehicleStepSchema = z.object({
  vehicleMake: z.string().min(1, "Required").max(40, "Too long — 40 characters max"),
  vehicleModel: z.string().min(1, "Required").max(40, "Too long — 40 characters max"),
  vehicleYear: z.string().regex(/^\d{4}$/, "Enter a valid 4-digit year"),
  registrationNo: z
    .string()
    .min(4, "Too short to be a valid registration number")
    .max(11, "Too long — 11 characters max")
    .regex(/^[A-Za-z0-9\- ]+$/, "Only letters, numbers, spaces, and hyphens allowed"),
  vehicleType: z.enum(["two-wheeler", "car", "suv", "commercial"]),
});

const policyStepObjectSchema = z.object({
  policyNumber: z.string().min(1, "Required").max(30, "Too long — 30 characters max"),
  insuranceCompany: z.string().min(1, "Required").max(80, "Too long — 80 characters max"),
  startDate: z.string().min(1, "Required"),
  endDate: z.string().min(1, "Required"),
  coverageType: z.enum(["comprehensive", "third-party", "own-damage"]),
  paymentInterval: z.enum(["one-time", "monthly", "quarterly", "half-yearly", "annually"]),
  firstPaymentDate: z.string().min(1, "Required"),
  maxClaimsPerYear: z.string().optional(),
  maxClaimsPerMonth: z.string().optional(),
});

// .refine() returns a ZodEffects, which doesn't support .merge() — so the
// plain object version above is what gets merged into createPolicySchema,
// and this refined version (with the cross-field date checks) is what
// actually gets used for step-by-step wizard validation.
export const policyStepSchema = policyStepObjectSchema
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      const first = new Date(data.firstPaymentDate);
      return first >= new Date(data.startDate) && first <= new Date(data.endDate);
    },
    { message: "First payment date must fall within the coverage period", path: ["firstPaymentDate"] }
  );

export const createPolicySchema = vehicleStepSchema.merge(policyStepObjectSchema);

export type CreatePolicyInput = z.infer<typeof createPolicySchema>;
export type VehicleStepInput = z.infer<typeof vehicleStepSchema>;
export type PolicyStepInput = z.infer<typeof policyStepSchema>;
