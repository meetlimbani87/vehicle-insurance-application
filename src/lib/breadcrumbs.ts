import type { BreadcrumbItem } from "@/components/ui/breadcrumb";
import { ROUTES } from "@/constants/routes";

const STATIC_LABELS: Record<string, string> = {
  [ROUTES.DASHBOARD]: "Dashboard",
  [ROUTES.APPLICATIONS]: "Applications",
  [ROUTES.POLICY_CREATE]: "New Policy",
  [ROUTES.CLAIM_CREATE]: "File a Claim",
  [ROUTES.CLAIM_TRACKING]: "Claim Tracking",
  [ROUTES.PAY_SCHEDULE]: "Payment Schedule",
  [ROUTES.PAY_LOGS]: "Payment Logs",
  [ROUTES.REPORTS]: "Reports",
  [ROUTES.PROFILE]: "Profile",
  [ROUTES.TERMS]: "Terms Analysis",
  [ROUTES.NOTIFICATIONS]: "Notifications",
  [ROUTES.ADMIN_DASHBOARD]: "Dashboard",
  [ROUTES.ADMIN_CLAIMS]: "Claims",
  [ROUTES.ADMIN_USERS]: "Users",
  [ROUTES.ADMIN_AUDIT]: "Audit Logs",
  [ROUTES.ADMIN_ANALYTICS]: "Analytics",
  [ROUTES.ADMIN_MAINTENANCE]: "Maintenance",
};

/** Builds a breadcrumb trail for the current pathname. Handles dynamic
 * /policies/:id and /claims/:id detail routes with a friendly fallback label. */
export function getBreadcrumbs(pathname: string, isAdmin?: boolean): BreadcrumbItem[] {
  if (STATIC_LABELS[pathname]) {
    return [{ label: STATIC_LABELS[pathname] }];
  }

  if (pathname.startsWith("/policies/")) {
    return [
      { label: "Applications", to: ROUTES.APPLICATIONS },
      { label: "Policy Details" },
    ];
  }

  if (pathname.startsWith("/claims/")) {
    return [
      { label: "Claim Tracking", to: ROUTES.CLAIM_TRACKING },
      { label: "Claim Details" },
    ];
  }

  const fallback = pathname
    .split("/")
    .filter(Boolean)
    .pop()
    ?.replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return [{ label: fallback || (isAdmin ? "Admin" : "Dashboard") }];
}
