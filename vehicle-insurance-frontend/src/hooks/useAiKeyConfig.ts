import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

export interface AiKeyStatus {
  configured: boolean;
  maskedKey: string | null;
  provider: string;
  model: string;
}

export function useAiKeyConfig() {
  return useQuery({
    queryKey: ["aiKeyConfig"],
    queryFn: async () => {
      try {
        const res = (await apiFetch("/admin/settings/ai-key")) as AiKeyStatus;
        return res;
      } catch {
        return {
          configured: false,
          maskedKey: null,
          provider: "OpenAI",
          model: "gpt-4o",
        };
      }
    },
  });
}

export function useUpdateAiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { apiKey: string; provider?: string; model?: string }) =>
      apiFetch("/admin/settings/ai-key", {
        method: "POST",
        body: JSON.stringify(data),
      }) as Promise<{ success: boolean; message: string; maskedKey: string; configured: boolean }>,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["aiKeyConfig"] });
      toast.success(res.message || "API key updated securely!");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useClearAiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch("/admin/settings/ai-key", {
        method: "DELETE",
      }) as Promise<{ success: boolean; message: string }>,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["aiKeyConfig"] });
      toast.success(res.message || "API key cleared. System using free built-in engine.");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
