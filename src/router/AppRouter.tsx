import { createHashRouter } from "react-router";
import MainLayout from "@/components/layout/MainLayout";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
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
import PaymentSchedulePage from "@/pages/user/PaymentSchedulePage";
import PaymentLogsPage from "@/pages/user/PaymentLogsPage";
import ClaimReportsPage from "@/pages/user/ClaimReportsPage";
import ProfilePage from "@/pages/user/ProfilePage";
import TermsAnalysisPage from "@/pages/user/TermsAnalysisPage";
import NotificationsPage from "@/pages/user/NotificationsPage";

// Admin pages
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminClaimsPage from "@/pages/admin/AdminClaimsPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AuditLogsPage from "@/pages/admin/AuditLogsPage";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";
import MaintenancePage from "@/pages/admin/MaintenancePage";

import NotFoundPage from "@/pages/NotFoundPage";

export const router = createHashRouter([
  { path: "/", element: <LandingPage />, errorElement: <RouteErrorPage /> },
  { path: "/login", element: <LoginPage />, errorElement: <RouteErrorPage /> },
  { path: "/register", element: <RegisterPage />, errorElement: <RouteErrorPage /> },
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
      { path: "/payments/schedule", element: <PaymentSchedulePage /> },
      { path: "/payments/logs", element: <PaymentLogsPage /> },
      { path: "/reports", element: <ClaimReportsPage /> },
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
      { path: "/admin/maintenance", element: <MaintenancePage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
