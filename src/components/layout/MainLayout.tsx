import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import Breadcrumb from "@/components/ui/breadcrumb";
import {
  Shield, FileText, LayoutDashboard, Plus, AlertCircle,
  BarChart3, User, FileSearch, Bell, LogOut, X,
  ClipboardList, Calendar, Receipt, BookOpen, Users, Activity, Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Tooltip from "@/components/ui/tooltip";
import TopBar from "./TopBar";

interface MainLayoutProps {
  isAdmin?: boolean;
}

const userNavItems = [
  { to: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.APPLICATIONS, label: "Applications", icon: ClipboardList },
  { to: ROUTES.POLICY_CREATE, label: "New Policy", icon: Plus },
  { to: ROUTES.CLAIM_CREATE, label: "File a Claim", icon: AlertCircle },
  { to: ROUTES.CLAIM_TRACKING, label: "Claim Tracking", icon: FileSearch },
  { to: ROUTES.PAY_SCHEDULE, label: "Payment Schedule", icon: Calendar },
  { to: ROUTES.PAY_LOGS, label: "Payment Logs", icon: Receipt },
  { to: ROUTES.REPORTS, label: "Reports", icon: BarChart3 },
  { to: ROUTES.TERMS, label: "Terms Analysis", icon: BookOpen },
  { to: ROUTES.NOTIFICATIONS, label: "Notifications", icon: Bell },
  { to: ROUTES.PROFILE, label: "Profile", icon: User },
];

const adminNavItems = [
  { to: ROUTES.ADMIN_DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.ADMIN_CLAIMS, label: "Claims", icon: FileText },
  { to: ROUTES.ADMIN_USERS, label: "Users", icon: Users },
  { to: ROUTES.ADMIN_AUDIT, label: "Audit Logs", icon: Activity },
  { to: ROUTES.ADMIN_ANALYTICS, label: "Analytics", icon: BarChart3 },
  { to: ROUTES.ADMIN_MAINTENANCE, label: "Maintenance", icon: Wrench },
];

export default function MainLayout({ isAdmin }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const user = useCurrentUser();
  const logout = useLogout();
  const navItems = isAdmin ? adminNavItems : userNavItems;
  const breadcrumbs = getBreadcrumbs(location.pathname, isAdmin);

  return (
    <div className="relative min-h-screen bg-secondary/70">
      {/* Layered tint anchored to the sidebar edge — keeps the content area from
          reading as flat white against the navy rail. Fixed so it doesn't scroll
          away and expose plain white beneath long pages. */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(46rem 26rem at -6% -8%, rgba(46,109,164,0.09), transparent 60%), radial-gradient(34rem 22rem at 108% 6%, rgba(14,156,136,0.06), transparent 55%)",
        }}
      />
      {/* Sidebar overlay (mobile) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-brand-primary transition-[width,transform] duration-300 lg:translate-x-0 flex flex-col",
          sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64",
          collapsed ? "lg:w-[4.5rem]" : "lg:w-64"
        )}
      >
        <div className={cn("flex items-center h-16 border-b border-white/10 shrink-0", collapsed ? "lg:justify-center px-4" : "justify-between px-4")}>
          <Link to={isAdmin ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD} className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-brand-accent flex items-center justify-center shadow-sm shrink-0">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div className={cn("min-w-0", collapsed && "lg:hidden")}>
              <span className="font-display font-bold text-white text-sm tracking-tight truncate block">VehicleInsure</span>
              {isAdmin && <Badge variant="warning" className="mt-0.5 text-[10px] px-1.5 py-0">Admin</Badge>}
            </div>
          </Link>
          <Button variant="ghost" size="icon" aria-label="Close menu" className="lg:hidden text-white/70 hover:text-white hover:bg-white/10" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <motion.nav
          aria-label="Primary"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
          className="flex flex-col gap-0.5 p-3 overflow-y-auto flex-1"
        >
          {navItems.map((navItem) => {
            const isActive = location.pathname === navItem.to;
            return (
              <motion.div key={navItem.to} variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}>
                <Tooltip content={navItem.label} side="right" disabled={!collapsed}>
                  <Link
                    to={navItem.to}
                    onClick={() => setSidebarOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors w-full",
                      collapsed ? "lg:justify-center lg:px-0 px-3.5" : "pl-3.5 pr-3",
                      isActive ? "bg-white/[0.08] text-white font-semibold" : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="active-nav-pill"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-brand-accent"
                      />
                    )}
                    <navItem.icon className={cn("h-4 w-4 shrink-0", isActive && "text-brand-accent")} />
                    <span className={cn(collapsed && "lg:hidden")}>{navItem.label}</span>
                  </Link>
                </Tooltip>
              </motion.div>
            );
          })}
        </motion.nav>

        <div className="border-t border-white/10 p-3 shrink-0">
          <div className={cn("flex items-center gap-2 mb-2 px-2", collapsed && "lg:justify-center lg:px-0")}>
            <div className="h-8 w-8 rounded-full bg-brand-secondary flex items-center justify-center text-white text-xs font-display font-bold shrink-0">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className={cn("flex-1 min-w-0", collapsed && "lg:hidden")}>
              <p className="text-sm font-medium text-white truncate">{user?.name || "User"}</p>
              <p className="text-xs text-white/40 truncate">{user?.email || ""}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className={cn("w-full text-white/55 hover:bg-white/[0.06] hover:text-white", collapsed ? "lg:justify-center lg:px-0 justify-start" : "justify-start")}
            size="sm"
            onClick={logout}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="h-4 w-4" />
            <span className={cn(collapsed && "lg:hidden")}>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn("transition-[margin] duration-300", collapsed ? "lg:ml-[4.5rem]" : "lg:ml-64")}>
        <TopBar
          breadcrumbs={breadcrumbs}
          navItems={navItems}
          sidebarCollapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          onOpenMobileSidebar={() => setSidebarOpen(true)}
        />

        <main className="min-h-[calc(100vh-4rem)]">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[90rem] mx-auto">
            <div className="mb-4 md:hidden">
              <Breadcrumb items={breadcrumbs} />
            </div>
            {/* Removed animated route transitions temporarily to avoid blank/white flash
                while navigating back to routes. If this fixes the issue we can reintroduce
                enter/exit animations with a safer strategy. */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
