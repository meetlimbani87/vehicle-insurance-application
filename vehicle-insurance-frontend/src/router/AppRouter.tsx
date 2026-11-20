import { createHashRouter } from "react-router";
import MainLayout from "@/components/layout/MainLayout";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import RouteErrorPage from "@/components/RouteErrorPage";

// Landing
import LandingPage from "@/pages/LandingPage";

// Auth
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";

// User pages
import DashboardPage from "@/pages/user/DashboardPage";
import ApplicationsPage from "@/pages/user/ApplicationsPage";
import PolicyCreatePage from "@/pages/user/PolicyCreatePage";
import PolicyDetailPage from "@/pages/user/PolicyDetailPage";
import ClaimCreatePage from "@/pages/user/ClaimCreatePage";
import ClaimDetailPage from "@/pages/user/ClaimDetailPage";
import ClaimTrackingPage from "@/pages/user/ClaimTrackingPage";
import PaymentsPage from "@/pages/user/PaymentsPage";
import ProfilePage from "@/pages/user/ProfilePage";
import TermsAnalysisPage from "@/pages/user/TermsAnalysisPage";
import NotificationsPage from "@/pages/user/NotificationsPage";

import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminClaimsPage from "@/pages/admin/AdminClaimsPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AuditLogsPage from "@/pages/admin/AuditLogsPage";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";

import NotFoundPage from "@/pages/NotFoundPage";

export const router = createHashRouter([
  { path: "/", element: <LandingPage />, errorElement: <RouteErrorPage /> },
  { path: "/login", element: <PublicOnlyRoute><LoginPage /></PublicOnlyRoute>, errorElement: <RouteErrorPage /> },
  { path: "/register", element: <PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>, errorElement: <RouteErrorPage /> },
  {
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    errorElement: <RouteErrorPage />,
    children: [
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/applications", element: <ApplicationsPage /> },
      { path: "/policies/create", element: <PolicyCreatePage /> },
      { path: "/policies/:id", element: <PolicyDetailPage /> },
      { path: "/claims/create", element: <ClaimCreatePage /> },
      { path: "/claims/:id", element: <ClaimDetailPage /> },
      { path: "/claim-tracking", element: <ClaimTrackingPage /> },
      { path: "/payments", element: <PaymentsPage /> },
      { path: "/payments/schedule", element: <PaymentsPage /> },
      { path: "/payments/logs", element: <PaymentsPage /> },
      { path: "/profile", element: <ProfilePage /> },
      { path: "/terms", element: <TermsAnalysisPage /> },
      { path: "/notifications", element: <NotificationsPage /> },
    ],
  },
  {
    element: (
      <AdminRoute>
        <MainLayout isAdmin />
      </AdminRoute>
    ),
    errorElement: <RouteErrorPage />,
    children: [
      { path: "/admin/dashboard", element: <AdminDashboardPage /> },
      { path: "/admin/claims", element: <AdminClaimsPage /> },
      { path: "/admin/users", element: <AdminUsersPage /> },
      { path: "/admin/audit-logs", element: <AuditLogsPage /> },
      { path: "/admin/analytics", element: <AnalyticsPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
