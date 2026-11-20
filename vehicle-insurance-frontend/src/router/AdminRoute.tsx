import { Navigate, useLocation } from "react-router";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const location = useLocation();

  if (!token || !userStr) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  let user: any = {};
  try {
    user = JSON.parse(userStr);
  } catch {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
