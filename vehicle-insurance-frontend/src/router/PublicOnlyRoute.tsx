import { Navigate } from "react-router";
import { useCurrentUser } from "@/hooks/useAuth";

export default function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  const user = useCurrentUser();

  if (token && user) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  return <>{children}</>;
}
