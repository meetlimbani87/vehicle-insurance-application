import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "sonner";
import { mockPolicies, type Policy } from "@/mock/mockPolicies";
import type { CreatePolicyInput } from "@/schemas/policySchemas";

export function usePolicies() {
  return useQuery({
    queryKey: [QUERY_KEYS.POLICIES],
    queryFn: async (): Promise<Policy[]> => {
      await new Promise((r) => setTimeout(r, 600));
      return mockPolicies;
    },
  });
}

export function usePolicy(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.POLICY, id],
    queryFn: async (): Promise<Policy> => {
      await new Promise((r) => setTimeout(r, 400));
      const policy = mockPolicies.find((p) => p.id === id);
      if (!policy) throw new Error("Policy not found");
      return policy;
    },
    enabled: !!id,
  });
}

export function useCreatePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePolicyInput): Promise<Policy> => {
      await new Promise((r) => setTimeout(r, 800));
      const newPolicy: Policy = {
        id: "p" + (mockPolicies.length + 1),
        ...data,
        status: "Active",
        premiumAmount: Math.floor(Math.random() * 20000) + 5000,
        ownerName: "Rahul Sharma",
      };
      mockPolicies.push(newPolicy);
      return newPolicy;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.POLICIES] });
      toast.success("Policy created successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
