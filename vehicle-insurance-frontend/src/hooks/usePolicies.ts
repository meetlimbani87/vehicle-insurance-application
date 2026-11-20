import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "sonner";
import { type Policy } from "@/mock/mockPolicies";
import type { CreatePolicyInput } from "@/schemas/policySchemas";
import { apiFetch, apiUpload } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useAuth";

export function usePolicies() {
  const user = useCurrentUser();

  return useQuery({
    queryKey: [QUERY_KEYS.POLICIES, user?.id, user?.email],
    queryFn: async () => {
      // Real backend data only. A genuinely empty result (new user, no
      // policies yet) is returned as-is instead of being masked by demo data.
      const data = (await apiFetch("/policies")) as Policy[];

      if (!Array.isArray(data)) return [];
      if (!user) return data;
      if (user.role === "admin") return data;

      const userEmail = user.email?.toLowerCase();
      const userName = user.name?.toLowerCase();
      const userFirstName = userName?.split(" ")[0];

      return data.filter((p: any) => {
        if (!p) return false;

        const emailMatch =
          p.userEmail?.toLowerCase() === userEmail ||
          p.policyHolderEmail?.toLowerCase() === userEmail;
        const idMatch = p.userId === user.id || p.createdBy === user.id;
        const nameMatch =
          (p.ownerName || p.insuredName)?.toLowerCase().includes(userName) ||
          (userFirstName && (p.ownerName || p.insuredName)?.toLowerCase().includes(userFirstName));

        return emailMatch || idMatch || nameMatch || (!p.userId && !p.userEmail && !p.ownerName && !p.policyHolderEmail);
      });
    },
  });
}

export function usePolicy(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.POLICY, id],
    queryFn: async () => (await apiFetch(`/policies/${id}`)) as Policy,
    enabled: !!id,
  });
}

export function useCreatePolicy() {
  const qc = useQueryClient();
  const user = useCurrentUser();

  return useMutation({
    mutationFn: async (data: CreatePolicyInput): Promise<Policy> => {
      const payload = {
        ...data,
        userId: user?.id,
        userEmail: user?.email,
        ownerName: user?.name,
        insuredName: user?.name,
      };
      // No offline fallback: if this fails, the user needs to know it
      // wasn't actually saved, not see a fake "success".
      return (await apiFetch("/policies", { method: "POST", body: JSON.stringify(payload) })) as Policy;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.POLICIES] });
      toast.success("Policy created successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// Real file upload — sends actual File objects as multipart/form-data
export function useUploadPolicyDocuments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }): Promise<Policy> =>
      apiUpload(`/policies/${id}/documents`, files) as Promise<Policy>,
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.POLICIES] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.POLICY, id] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}