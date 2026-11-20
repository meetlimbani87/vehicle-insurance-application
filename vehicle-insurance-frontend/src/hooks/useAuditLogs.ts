import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import type { AuditLog } from "@/mock/mockAuditLogs";
import { apiFetch } from "@/lib/api";

export function useAuditLogs() {
  return useQuery({
    queryKey: [QUERY_KEYS.AUDIT_LOGS],
    queryFn: () => apiFetch("/admin/audit-logs") as Promise<AuditLog[]>,
  });
}
