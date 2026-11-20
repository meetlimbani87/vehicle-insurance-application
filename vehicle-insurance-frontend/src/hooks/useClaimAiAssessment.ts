import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "sonner";
import type { Claim } from "@/schemas/claimSchemas";

export function useRunClaimAiAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claimId: string): Promise<Claim> => {
      return apiFetch<Claim>(`/claims/${claimId}/ai-assessment`, {
        method: "POST",
      });
    },
    onSuccess: (data, claimId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLAIM, claimId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLAIMS] });
      toast.success("AI Claim Assessment completed!");
    },
    onError: (err: Error) => {
      toast.error(`AI Assessment failed: ${err.message}`);
    },
  });
}
