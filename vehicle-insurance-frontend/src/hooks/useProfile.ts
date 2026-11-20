import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  role: "user" | "admin";
  emailNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
}

const PROFILE_KEY = ["profile"];

// Keeps the cached login-time snapshot (used by useCurrentUser() everywhere
// else in the app, e.g. the header) in sync after a profile edit, without
// needing to convert every consumer of useCurrentUser() to an async query.
function syncLocalUserCache(profile: UserProfile) {
  const stored = localStorage.getItem("user");
  if (!stored) return;
  try {
    const cached = JSON.parse(stored);
    localStorage.setItem("user", JSON.stringify({ ...cached, name: profile.name, phone: profile.phone }));
  } catch {
    // ignore malformed cache, nothing to sync
  }
}

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: () => apiFetch("/users/me") as Promise<UserProfile>,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; phone: string; address: string }) =>
      apiFetch("/users/me", { method: "PATCH", body: JSON.stringify(data) }) as Promise<UserProfile>,
    onSuccess: (profile) => {
      qc.setQueryData(PROFILE_KEY, profile);
      syncLocalUserCache(profile);
      toast.success("Profile updated successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
      apiFetch("/users/me/password", { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => toast.success("Password changed successfully"),
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { emailNotifications: boolean; smsNotifications: boolean; inAppNotifications: boolean }) =>
      apiFetch("/users/me/notification-preferences", { method: "PATCH", body: JSON.stringify(data) }) as Promise<UserProfile>,
    onSuccess: (profile) => {
      qc.setQueryData(PROFILE_KEY, profile);
      toast.success("Notification preferences updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
