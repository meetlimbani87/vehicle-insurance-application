import { Navigate } from "react-router";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user?.role === "admin" ? <>{children}</> : <Navigate to="/dashboard" replace />;
}
