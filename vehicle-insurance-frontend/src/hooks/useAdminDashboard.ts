import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { apiFetch } from "@/lib/api";

export interface AdminDashboardSummary {
  totalPolicies: number;
  totalClaims: number;
  claimedCount: number;
  unclaimedCount: number;
  premiumCollected: number;
  monthlyClaims: { month: string; count: number }[];
  vehicleDistribution: { type: string; count: number }[];
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN_DASHBOARD],
    queryFn: () => apiFetch("/admin/dashboard/summary") as Promise<AdminDashboardSummary>,
  });
}
