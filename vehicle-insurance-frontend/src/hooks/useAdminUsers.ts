import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "sonner";
import type { User } from "@/mock/mockUsers";
import { apiFetch } from "@/lib/api";

export function useAdminUsers() {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS],
    queryFn: () => apiFetch("/admin/users") as Promise<User[]>,
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: User["status"] }) =>
      apiFetch(`/admin/users/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }) as Promise<User>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      toast.success("User status updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCreateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; email: string; password?: string; phone?: string }) =>
      apiFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify({ ...data, role: "admin" }),
      }) as Promise<User>,
    onSuccess: (newUser) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      toast.success(`Admin account created for ${newUser.name || newUser.email}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
