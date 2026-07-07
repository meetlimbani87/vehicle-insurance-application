import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  Shield, FileText, LayoutDashboard, Plus, AlertCircle, CreditCard,
  BarChart3, User, FileSearch, Bell, Settings, LogOut, Menu, X,
  ClipboardList, Calendar, Receipt, BookOpen, Users, Activity, Wrench, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const location = useLocation();
  const user = useCurrentUser();
  const logout = useLogout();
  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b bg-background/95 backdrop-blur px-4 h-14">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="h-7 w-7 rounded-lg bg-brand-primary flex items-center justify-center">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="font-display font-bold text-brand-primary">VehicleInsure</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to={ROUTES.NOTIFICATIONS}>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-destructive" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-background border-r transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <Link to={isAdmin ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD} className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-brand-primary flex items-center justify-center shadow-sm">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-brand-primary text-sm tracking-tight">VehicleInsure</span>
              {isAdmin && <Badge variant="warning" className="ml-1 text-[10px] px-1.5 py-0">Admin</Badge>}
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <motion.nav
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
          className="flex flex-col gap-0.5 p-3 overflow-y-auto h-[calc(100%-8rem)]"
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <motion.div
                key={item.to}
                variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}
              >
                <Link
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg pl-3.5 pr-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-primary/[0.06] text-brand-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-nav-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-brand-accent"
                    />
                  )}
                  <item.icon className={cn("h-4 w-4 shrink-0 transition-transform", isActive && "text-brand-accent")} />
                  {item.label}
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>

        <div className="absolute bottom-0 left-0 right-0 border-t p-3 bg-background">
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="h-8 w-8 rounded-full bg-brand-secondary flex items-center justify-center text-white text-xs font-display font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 md:p-5 lg:p-6 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
