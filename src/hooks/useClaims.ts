import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "sonner";
import { mockClaims, type Claim } from "@/mock/mockClaims";
import type { CreateClaimInput } from "@/schemas/claimSchemas";
import { mockPolicies } from "@/mock/mockPolicies";

export function useClaims() {
  return useQuery({
    queryKey: [QUERY_KEYS.CLAIMS],
    queryFn: async (): Promise<Claim[]> => {
      await new Promise((r) => setTimeout(r, 600));
      return mockClaims;
    },
  });
}

export function useClaim(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.CLAIM, id],
    queryFn: async (): Promise<Claim> => {
      await new Promise((r) => setTimeout(r, 400));
      const claim = mockClaims.find((c) => c.id === id);
      if (!claim) throw new Error("Claim not found");
      return claim;
    },
    enabled: !!id,
  });
}

export function useCreateClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateClaimInput): Promise<Claim> => {
      await new Promise((r) => setTimeout(r, 800));
      const policy = mockPolicies.find((p) => p.id === data.policyId);
      const newClaim: Claim = {
        id: "c" + (mockClaims.length + 1),
        claimNumber: `CLM-2024-${String(mockClaims.length + 1).padStart(3, "0")}`,
        policyId: data.policyId,
        policyNumber: policy?.policyNumber || "N/A",
        accidentDate: data.accidentDate,
        location: data.location,
        description: data.description,
        status: "Filed",
        estimatedAmount: null,
        actualAmount: null,
        filedDate: new Date().toISOString().split("T")[0],
        vehicleMake: policy?.vehicleMake || "N/A",
        vehicleModel: policy?.vehicleModel || "N/A",
        registrationNo: policy?.registrationNo || "N/A",
        notes: ["Claim filed, awaiting initial review"],
        photos: [],
      };
      mockClaims.push(newClaim);
      return newClaim;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CLAIMS] });
      toast.success("Claim filed successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateClaimStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Claim["status"] }): Promise<Claim> => {
      await new Promise((r) => setTimeout(r, 500));
      const claim = mockClaims.find((c) => c.id === id);
      if (!claim) throw new Error("Claim not found");
      claim.status = status;
      return claim;
    },
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CLAIMS] });
      toast.success(`Claim ${status.toLowerCase()}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateActualAmount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, actualAmount }: { id: string; actualAmount: number }): Promise<Claim> => {
      await new Promise((r) => setTimeout(r, 500));
      const claim = mockClaims.find((c) => c.id === id);
      if (!claim) throw new Error("Claim not found");
      claim.actualAmount = actualAmount;
      return claim;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CLAIMS] });
      toast.success("Actual amount updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCloseCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<Claim> => {
      await new Promise((r) => setTimeout(r, 500));
      const claim = mockClaims.find((c) => c.id === id);
      if (!claim) throw new Error("Claim not found");
      claim.status = "Closed";
      return claim;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CLAIMS] });
      toast.success("Case closed successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
