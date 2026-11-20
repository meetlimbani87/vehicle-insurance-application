import { Navigate, useLocation } from "react-router";
import { useCurrentUser } from "@/hooks/useAuth";

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  const user = useCurrentUser();
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}
