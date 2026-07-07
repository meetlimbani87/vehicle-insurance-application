import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import type { LoginInput, RegisterInput } from "@/schemas/authSchemas";

export function useLogin() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: LoginInput) => {
      await new Promise((r) => setTimeout(r, 800));
      // Mock: accept any valid email/password combo
      if (data.email === "admin@example.com") {
        return {
          token: "mock-jwt-token-admin",
          user: { id: "u9", name: "Arjun Verma", email: data.email, role: "admin" as const, phone: "9876543218" },
        };
      }
      return {
        token: "mock-jwt-token-user",
        user: { id: "u1", name: "Rahul Sharma", email: data.email, role: "user" as const, phone: "9876543210" },
      };
    },
    onSuccess: ({ token, user }) => {
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
    mutationFn: async (_data: RegisterInput) => {
      await new Promise((r) => setTimeout(r, 800));
      return { success: true };
    },
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
  return () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out");
    navigate("/login");
  };
}
