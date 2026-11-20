import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

export interface ExtractedVehicle {
  registrationNo?: string | null;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  vehicleType?: string | null;
}

export interface ExtractedCoverage {
  startDate?: string | null;
  endDate?: string | null;
  coverageType?: string | null;
  insuredDeclaredValue?: string | null;
  deductible?: string | null;
}

export interface ExtractedPayment {
  totalPremium?: string | null;
  paymentInterval?: string | null;
  installmentAmount?: string | null;
  nextPaymentDate?: string | null;
}

export interface PolicyExtractionResult {
  policyNumber?: string | null;
  insuranceCompany?: string | null;
  policyholderName?: string | null;
  vehicle?: ExtractedVehicle;
  coverage?: ExtractedCoverage;
  payment?: ExtractedPayment;
  includedCoverage?: string[];
  exclusions?: string[];
  claimRequirements?: string[];
  limits?: string[];
  specialConditions?: string[];
  warnings?: string[];
  confidence?: number;
}

export interface PolicyDataConflict {
  field: string;
  existingValue: string;
  extractedValue: string;
}

export interface PolicyAiAnalysisResponse {
  id: string;
  policyId: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  extractionResult?: PolicyExtractionResult | null;
  conflicts?: PolicyDataConflict[];
  modelProvider?: string;
  analyzedAt?: string;
  sourceDocumentUrl?: string;
  errorMessage?: string;
  createdAt?: string;
}

export function usePolicyAiAnalysis(policyId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.POLICY_AI_ANALYSIS, policyId],
    queryFn: async () => {
      try {
        return (await apiFetch(`/policies/${policyId}/ai-analysis`)) as PolicyAiAnalysisResponse;
      } catch (err: any) {
        if (err?.message?.includes("404") || err?.message?.includes("No AI analysis found")) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!policyId,
    retry: false,
  });
}

export function useAnalyzePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ policyId, documentUrl }: { policyId: string; documentUrl?: string }): Promise<PolicyAiAnalysisResponse> =>
      apiFetch(`/policies/${policyId}/ai-analysis`, {
        method: "POST",
        body: JSON.stringify({ documentUrl }),
      }) as Promise<PolicyAiAnalysisResponse>,
    onSuccess: (data, { policyId }) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.POLICY_AI_ANALYSIS, policyId] });
      toast.success("AI policy document analysis completed");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to analyze policy document"),
  });
}

export function useExtractPolicyDocumentPreview() {
  return useMutation({
    mutationFn: async (file: File): Promise<PolicyExtractionResult> => {
      const formData = new FormData();
      formData.append("file", file);
      return apiFetch("/policies/extract-preview", {
        method: "POST",
        body: formData,
      }) as Promise<PolicyExtractionResult>;
    },
    onError: (err: Error) => toast.error(err.message || "Failed to extract policy details from document"),
  });
}
