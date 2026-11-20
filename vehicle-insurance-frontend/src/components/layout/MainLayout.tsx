import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentUser } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import Breadcrumb from "@/components/ui/breadcrumb";
import {
  Shield, FileText, LayoutDashboard, Plus, AlertCircle,
  BarChart3, User, FileSearch, Bell, LogOut, X, PanelLeftClose, PanelLeftOpen,
  ClipboardList, Calendar, Receipt, BookOpen, Users, Activity, Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Tooltip from "@/components/ui/tooltip";
import TopBar from "./TopBar";
import { toast } from "sonner";

interface MainLayoutProps {
  isAdmin?: boolean;
}

const userNavItems = [
  { to: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.APPLICATIONS, label: "Policies & Apps", icon: ClipboardList },
  { to: ROUTES.CLAIM_TRACKING, label: "Claims", icon: FileSearch },
  { to: ROUTES.PAYMENTS, label: "Payments & Billing", icon: Receipt },
  { to: ROUTES.TERMS, label: "Terms Analysis", icon: BookOpen },
  { to: ROUTES.PROFILE, label: "Profile", icon: User },
];

const adminNavItems = [
  { to: ROUTES.ADMIN_DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.ADMIN_CLAIMS, label: "Claims", icon: FileText },
  { to: ROUTES.ADMIN_USERS, label: "Users", icon: Users },
  { to: ROUTES.ADMIN_AUDIT, label: "Audit Logs", icon: Activity },
  { to: ROUTES.ADMIN_ANALYTICS, label: "Analytics", icon: BarChart3 },
];

export default function MainLayout({ isAdmin }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = useCurrentUser();

  const navItems = isAdmin ? adminNavItems : userNavItems;
  const breadcrumbs = getBreadcrumbs(location.pathname, isAdmin);

  const logout = () => {
    qc.clear();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out");
    navigate("/login");
  };

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const current = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(current);
      } else {
        setScrollProgress(100);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

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
          collapsed ? "lg:w-16" : "lg:w-64"
        )}
      >
        <div className={cn("flex items-center h-16 border-b border-white/10 shrink-0 px-3 justify-between", collapsed && "lg:px-0 lg:justify-center")}>
          {collapsed ? (
            <button
              onClick={() => setCollapsed(false)}
              className="h-10 w-10 rounded-xl bg-brand-accent/20 hover:bg-brand-accent/30 flex items-center justify-center text-white transition-all group cursor-pointer"
              aria-label="Expand sidebar"
              title="Click to expand sidebar"
            >
              <Shield className="h-5 w-5 text-brand-accent group-hover:scale-110 transition-transform" />
            </button>
          ) : (
            <>
              <Link to={isAdmin ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD} className="flex items-center gap-2.5 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-brand-accent flex items-center justify-center shadow-sm shrink-0">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <span className="font-display font-bold text-white text-sm tracking-tight truncate block">VehicleInsure</span>
                  {isAdmin && <Badge variant="warning" className="mt-0.5 text-[10px] px-1.5 py-0">Admin</Badge>}
                </div>
              </Link>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCollapsed(true)}
                  className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
                <Button variant="ghost" size="icon" aria-label="Close menu" className="lg:hidden text-white/70 hover:text-white hover:bg-white/10" onClick={() => setSidebarOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>

        <motion.nav
          aria-label="Primary"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
          className={cn("flex flex-col gap-1.5 p-3 overflow-y-auto flex-1", collapsed && "lg:px-2 lg:items-center")}
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
                      "relative flex items-center transition-all duration-150 rounded-xl",
                      collapsed
                        ? "lg:h-10 lg:w-10 lg:justify-center text-white/70 hover:text-white hover:bg-white/10"
                        : "gap-3 px-3 py-2.5 text-sm font-medium w-full text-white/60 hover:bg-white/[0.07] hover:text-white",
                      isActive && (
                        collapsed
                          ? "lg:bg-brand-accent/20 lg:text-brand-accent lg:ring-1 lg:ring-brand-accent/50 font-bold"
                          : "bg-white/[0.1] text-white font-semibold"
                      )
                    )}
                  >
                    {!collapsed && isActive && (
                      <motion.span
                        layoutId="active-nav-pill"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-brand-accent"
                      />
                    )}
                    <navItem.icon className={cn("h-5 w-5 shrink-0 transition-transform", isActive && (collapsed ? "text-brand-accent scale-110" : "text-brand-accent"))} />
                    <span className={cn(collapsed && "lg:hidden")}>{navItem.label}</span>
                  </Link>
                </Tooltip>
              </motion.div>
            );
          })}
        </motion.nav>

        <div className="border-t border-white/10 p-3 shrink-0 flex flex-col items-center">
          <div className={cn("flex items-center gap-2 mb-2 w-full px-2", collapsed && "lg:justify-center lg:px-0")}>
            <div className="h-9 w-9 rounded-full bg-brand-secondary flex items-center justify-center text-white text-xs font-display font-bold shrink-0 ring-2 ring-white/10">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className={cn("flex-1 min-w-0", collapsed && "lg:hidden")}>
              <p className="text-sm font-medium text-white truncate">{user?.name || "User"}</p>
              <p className="text-xs text-white/40 truncate">{user?.email || ""}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className={cn(
              "w-full text-white/60 hover:bg-white/[0.08] hover:text-white transition-colors",
              collapsed ? "lg:h-10 lg:w-10 lg:p-0 lg:justify-center rounded-xl" : "justify-start"
            )}
            size="sm"
            onClick={logout}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5" />
            <span className={cn(collapsed && "lg:hidden")}>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn("transition-[margin] duration-300", collapsed ? "lg:ml-16" : "lg:ml-64")}>
        <TopBar
          breadcrumbs={breadcrumbs}
          navItems={navItems}
          sidebarCollapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          onOpenMobileSidebar={() => setSidebarOpen(true)}
        />

        <main className="min-h-[calc(100vh-4rem)] pb-3">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[90rem] mx-auto">
            <div className="mb-4 md:hidden">
              <Breadcrumb items={breadcrumbs} />
            </div>
            <Outlet />
          </div>
        </main>

        {/* Bottom Page Scroll Progression Bar (Spans Left-to-Right Across Main White Content Area) */}
        <div
          className={cn(
            "fixed bottom-0 right-0 z-40 h-1.5 bg-muted/40 transition-[left] duration-300 pointer-events-none border-t border-border/40",
            collapsed ? "lg:left-16" : "lg:left-64",
            "left-0"
          )}
        >
          <div
            className="h-full bg-gradient-to-r from-brand-primary via-indigo-600 to-brand-accent transition-[width] duration-600 ease-out rounded-r-full shadow-xs"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
