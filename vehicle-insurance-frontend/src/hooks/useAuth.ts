import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import type { LoginInput, RegisterInput } from "@/schemas/authSchemas";
import { apiFetch } from "@/lib/api";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  phone: string;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

export function useLogin() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginInput) =>
      apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }) as Promise<LoginResponse>,
    onSuccess: ({ token, user }) => {
      qc.clear(); // Wipes previous user's query cache immediately
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      toast.success(`Welcome back, ${user.name}`);
      navigate(user.role === "admin" ? "/admin/dashboard" : "/dashboard");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRegister() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: RegisterInput) =>
      apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }) as Promise<{ success: boolean }>,
    onSuccess: () => {
      toast.success("Account created successfully!");
      navigate("/login");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCurrentUser() {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as { id: string; name: string; email: string; role: string; phone: string };
  } catch {
    return null;
  }
}

export function useLogout() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  return () => {
    qc.clear(); // Wipes current user's query cache
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out");
    navigate("/login");
  };
}
