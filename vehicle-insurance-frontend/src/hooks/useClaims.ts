import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "sonner";
import { type Claim } from "@/mock/mockClaims";
import type { CreateClaimInput } from "@/schemas/claimSchemas";
import { apiFetch, apiUpload } from "@/lib/api";

import { useCurrentUser } from "@/hooks/useAuth";

export interface ClaimTimelineEntry {
  status: string;
  note: string | null;
  timestamp: string;
}

export function useClaims() {
  const user = useCurrentUser();

  return useQuery({
    queryKey: [QUERY_KEYS.CLAIMS, user?.id, user?.email],
    queryFn: async () => {
      // Real backend data only. A genuinely empty result (new user, no
      // claims yet) is returned as-is instead of being masked by demo data.
      const data = (await apiFetch("/claims")) as Claim[];
      if (!Array.isArray(data)) return [];
      if (!user) return data;
      if (user.role === "admin") return data;

      return data.filter((c: any) => {
        if (!c) return false;
        const userEmail = user.email?.toLowerCase();
        const userName = user.name?.toLowerCase();
        const userFirstName = userName?.split(" ")[0];

        const emailMatch =
          c.userEmail?.toLowerCase() === userEmail ||
          c.policyHolderEmail?.toLowerCase() === userEmail;
        const idMatch = c.userId === user.id || c.createdBy === user.id;
        const nameMatch =
          (c.ownerName || c.insuredName)?.toLowerCase().includes(userName) ||
          (userFirstName && (c.ownerName || c.insuredName)?.toLowerCase().includes(userFirstName));

        return emailMatch || idMatch || nameMatch || (!c.userId && !c.userEmail && !c.ownerName && !c.policyHolderEmail);
      });
    },
  });
}

export function useClaim(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.CLAIM, id],
    queryFn: async () => (await apiFetch(`/claims/${id}`)) as Claim,
    enabled: !!id,
  });
}

// Real claim history — recorded server-side every time the claim's status changes
export function useClaimTimeline(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.CLAIM, id, "timeline"],
    queryFn: async () => {
      try {
        return (await apiFetch(`/claims/${id}/timeline`)) as ClaimTimelineEntry[];
      } catch {
        return [];
      }
    },
    enabled: !!id,
  });
}

export function useCreateClaim() {
  const qc = useQueryClient();
  const user = useCurrentUser();

  return useMutation({
    mutationFn: (data: CreateClaimInput): Promise<Claim> => {
      const payload = {
        ...data,
        userId: user?.id,
        userEmail: user?.email,
        ownerName: user?.name,
      };
      return apiFetch("/claims", { method: "POST", body: JSON.stringify(payload) }) as Promise<Claim>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CLAIMS] });
      toast.success("Claim filed successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// Real file upload — sends actual File objects as multipart/form-data,
// appends the returned URLs to the claim's photos
export function useUploadClaimPhotos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }): Promise<Claim> =>
      apiUpload(`/claims/${id}/photos`, files) as Promise<Claim>,
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CLAIMS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CLAIM, id] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUploadClaimDocuments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }): Promise<Claim> =>
      apiUpload(`/claims/${id}/documents`, files) as Promise<Claim>,
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CLAIMS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CLAIM, id] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useAddClaimNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }): Promise<Claim> =>
      apiFetch(`/claims/${id}/notes`, { method: "POST", body: JSON.stringify({ note }) }) as Promise<Claim>,
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CLAIM, id] });
      toast.success("Note added");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateClaimStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Claim["status"] }): Promise<Claim> =>
      (await apiFetch(`/claims/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })) as Claim,
    onSuccess: (updatedClaim, { id, status }) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CLAIMS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CLAIM, id] });

      qc.setQueryData([QUERY_KEYS.CLAIM, id], (old: Claim | undefined) => {
        return old ? { ...old, status } : updatedClaim;
      });

      qc.setQueryData([QUERY_KEYS.CLAIMS], (old: Claim[] | undefined) => {
        if (!old) return old;
        return old.map((c) => (c.id === id || c.claimNumber === id ? { ...c, status } : c));
      });

      toast.success(`Claim ${status.toLowerCase()}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateActualAmount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, actualAmount }: { id: string; actualAmount: number }): Promise<Claim> =>
      apiFetch(`/claims/${id}/actual-amount`, {
        method: "PATCH",
        body: JSON.stringify({ actualAmount }),
      }) as Promise<Claim>,
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
    mutationFn: (id: string): Promise<Claim> =>
      apiFetch(`/claims/${id}/close`, { method: "POST" }) as Promise<Claim>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CLAIMS] });
      toast.success("Case closed successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}