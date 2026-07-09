import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search, Bell, User, Settings, LogOut, PanelLeftClose, PanelLeftOpen,
  CreditCard, FileText, Shield, CheckCircle, XCircle, AlertTriangle, UserPlus, Upload, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Breadcrumb, { type BreadcrumbItem } from "@/components/ui/breadcrumb";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { mockNotifications } from "@/mock/mockNotifications";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const notifIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CreditCard, FileText, Shield, Bell, CheckCircle, XCircle, AlertTriangle, UserPlus, Upload,
};

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface TopBarProps {
  breadcrumbs: BreadcrumbItem[];
  navItems: NavItem[];
  sidebarCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobileSidebar: () => void;
}

export default function TopBar({ breadcrumbs, navItems, sidebarCollapsed, onToggleCollapse, onOpenMobileSidebar }: TopBarProps) {
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const user = useCurrentUser();
  const logout = useLogout();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return navItems.filter((n) => n.label.toLowerCase().includes(q)).slice(0, 6);
  }, [query, navItems]);

  const unread = mockNotifications.filter((n) => !n.read).slice(0, 5);
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  const goTo = (to: string) => {
    navigate(to);
    setQuery("");
    searchRef.current?.blur();
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 h-full px-4 sm:px-5 lg:px-6">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
          aria-label="Open menu"
        >
          <PanelLeftOpen className="h-5 w-5" />
        </button>

        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}
        </button>

        <Breadcrumb items={breadcrumbs} className="hidden md:flex shrink-0" />

        {/* Search */}
        <div className="relative flex-1 max-w-md ml-1 sm:ml-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 120)}
            placeholder="Search pages..."
            aria-label="Search pages"
            role="combobox"
            aria-expanded={searchFocused && !!query}
            aria-autocomplete="list"
            className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-8 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-brand-secondary focus-visible:bg-background transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          <AnimatePresence>
            {searchFocused && query && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 mt-2 rounded-xl border border-border bg-popover shadow-[0_16px_40px_rgba(16,24,40,0.14)] p-1.5 overflow-hidden"
              >
                {results.length === 0 ? (
                  <p className="text-sm text-muted-foreground px-3 py-2.5">No pages match "{query}"</p>
                ) : (
                  results.map((r) => (
                    <button
                      key={r.to}
                      onClick={() => goTo(r.to)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer text-left"
                    >
                      <r.icon className="h-4 w-4 text-muted-foreground" />
                      {r.label}
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger className="relative h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 sm:w-96 p-0 overflow-hidden">
              <div className="flex items-center justify-between px-3.5 py-3 border-b border-border">
                <span className="font-display font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && <Badge variant="warning">{unreadCount} new</Badge>}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {unread.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">You're all caught up</p>
                ) : (
                  unread.map((n) => {
                    const Icon = notifIconMap[n.icon] ?? Bell;
                    return (
                      <div key={n.id} className="flex items-start gap-3 px-3.5 py-3 hover:bg-muted/60 transition-colors border-b border-border/60 last:border-0">
                        <div className="h-8 w-8 shrink-0 rounded-lg bg-brand-secondary/10 flex items-center justify-center">
                          <Icon className="h-4 w-4 text-brand-secondary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <Link
                to={ROUTES.NOTIFICATIONS}
                className="block text-center text-sm font-medium text-brand-secondary hover:bg-muted transition-colors py-2.5 border-t border-border"
              >
                View all notifications
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 pl-1 pr-2 h-9 rounded-lg hover:bg-muted transition-colors">
              <div className="h-7 w-7 rounded-full bg-brand-secondary flex items-center justify-center text-white text-xs font-display font-bold shrink-0">
                {user?.name?.charAt(0) || "U"}
              </div>
              <span className="hidden sm:block text-sm font-medium text-foreground max-w-[8rem] truncate">
                {user?.name || "User"}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
              <div className="px-2.5 pb-2 -mt-1">
                <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>
                <User className="h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(ROUTES.NOTIFICATIONS)}>
                <Bell className="h-4 w-4" /> Notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Settings page isn't wired up in this demo yet")}>
                <Settings className="h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onClick={logout}>
                <LogOut className="h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
