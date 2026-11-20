import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { apiFetch } from "@/lib/api";

export interface AnalyticsSummary {
  claimsByMonth: { month: string; count: number }[];
  policyStatusBreakdown: { status: string; count: number }[];
  vehicleCategories: { type: string; count: number }[];
  avgSettlementTime: { month: string; days: number }[];
}

export function useAnalytics() {
  return useQuery({
    queryKey: [QUERY_KEYS.ANALYTICS],
    queryFn: () => apiFetch("/admin/analytics/summary") as Promise<AnalyticsSummary>,
  });
}
