import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import type { Payment } from "@/mock/mockPayments";
import { apiFetch } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useAuth";

export function usePayments() {
  const user = useCurrentUser();

  return useQuery({
    queryKey: [QUERY_KEYS.PAYMENTS, user?.id, user?.email],
    queryFn: async () => {
      const data = (await apiFetch("/payments")) as Payment[];
      if (!user) return [];
      return data;
    },
  });
}
