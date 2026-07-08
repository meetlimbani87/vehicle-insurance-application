import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, FileText, CreditCard, TrendingUp, Plus, AlertCircle, ArrowRight,
  Car, Clock, Bell, CheckCircle, XCircle, AlertTriangle, UserPlus, Upload,
  ClipboardCheck, PiggyBank,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import EmptyState from "@/components/ui/empty-state";
import { usePolicies } from "@/hooks/usePolicies";
import { useClaims } from "@/hooks/useClaims";
import { ROUTES } from "@/constants/routes";
import { useCurrentUser } from "@/hooks/useAuth";
import { mockNotifications } from "@/mock/mockNotifications";

function AnimatedNumber({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const duration = 700;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{prefix}{display.toLocaleString()}</>;
}

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -8 },
};

const container = { initial: {}, animate: { transition: { staggerChildren: 0.07 } } };
const item = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const notifIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CreditCard, FileText, Shield, Bell, CheckCircle, XCircle, AlertTriangle, UserPlus, Upload,
};

const quickActions = [
  { to: ROUTES.POLICY_CREATE, label: "New Policy", description: "Apply for coverage", icon: Plus, accent: "text-brand-primary bg-brand-primary/10" },
  { to: ROUTES.CLAIM_CREATE, label: "File a Claim", description: "Report an incident", icon: AlertCircle, accent: "text-brand-warn bg-brand-warn/10" },
  { to: ROUTES.CLAIM_TRACKING, label: "Track Claims", description: "Check claim status", icon: Clock, accent: "text-brand-secondary bg-brand-secondary/10" },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { data: policies, isLoading: policiesLoading } = usePolicies();
  const { data: claims, isLoading: claimsLoading } = useClaims();
  const user = useCurrentUser();
  const isLoading = policiesLoading || claimsLoading;

  const activePolicies = policies?.filter((p) => p.status === "Active").length ?? 0;
  const openClaims = claims?.filter((c) => c.status !== "Closed" && c.status !== "Rejected").length ?? 0;
  const totalClaimed = claims?.reduce((sum, c) => sum + (c.actualAmount || 0), 0) ?? 0;
  const recentClaims = claims?.slice(0, 4) ?? [];
  const unreadNotifications = mockNotifications.filter((n) => !n.read).slice(0, 4);

  const summaryCards = [
    { title: "Total Policies", value: policies?.length ?? 0, prefix: "", icon: Shield, color: "text-brand-primary", bg: "bg-brand-primary/10" },
    { title: "Open Claims", value: openClaims, prefix: "", icon: FileText, color: "text-brand-secondary", bg: "bg-brand-secondary/10" },
    { title: "Next Payment Due", value: 12500, prefix: "₹", icon: CreditCard, color: "text-brand-warn", bg: "bg-brand-warn/10" },
    { title: "Total Claimed", value: totalClaimed, prefix: "₹", icon: TrendingUp, color: "text-brand-accent", bg: "bg-brand-accent/10" },
  ];

  const claimStatusBreakdown = useMemo(() => {
    if (!claims || claims.length === 0) return [];
    const statuses: { label: string; key: typeof claims[number]["status"]; color: string }[] = [
      { label: "Approved", key: "Approved", color: "bg-brand-accent" },
      { label: "Under Review", key: "Under Review", color: "bg-brand-warn" },
      { label: "Filed", key: "Filed", color: "bg-brand-secondary" },
      { label: "Closed", key: "Closed", color: "bg-muted-foreground/40" },
      { label: "Rejected", key: "Rejected", color: "bg-destructive" },
    ];
    return statuses
      .map((s) => ({ ...s, count: claims.filter((c) => c.status === s.key).length }))
      .filter((s) => s.count > 0);
  }, [claims]);

  // Unified activity feed combining policy and claim events, newest first
  const activityFeed = useMemo(() => {
    const policyEvents = (policies ?? []).map((p) => ({
      id: `policy-${p.id}`,
      date: p.startDate,
      title: `Policy ${p.status.toLowerCase()}`,
      description: `${p.vehicleMake} ${p.vehicleModel} · ${p.policyNumber}`,
      icon: Shield,
      to: ROUTES.POLICY_DETAIL(p.id),
      accent: "text-brand-primary bg-brand-primary/10",
    }));
    const claimEvents = (claims ?? []).map((c) => ({
      id: `claim-${c.id}`,
      date: c.filedDate,
      title: `Claim ${c.status.toLowerCase()}`,
      description: `${c.vehicleMake} ${c.vehicleModel} · ${c.claimNumber}`,
      icon: FileText,
      to: ROUTES.CLAIM_DETAIL(c.id),
      accent: "text-brand-secondary bg-brand-secondary/10",
    }));
    return [...policyEvents, ...claimEvents]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [policies, claims]);

  const vehicles = useMemo(() => {
    const map = new Map<string, { make: string; model: string; reg: string; type: string; status: string }>();
    (policies ?? []).forEach((p) => {
      if (!map.has(p.registrationNo)) {
        map.set(p.registrationNo, { make: p.vehicleMake, model: p.vehicleModel, reg: p.registrationNo, type: p.vehicleType, status: p.status });
      }
    });
    return Array.from(map.values()).slice(0, 4);
  }, [policies]);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      {/* Welcome section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-primary via-brand-primary to-brand-secondary/80 px-5 sm:px-7 py-6 sm:py-7">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ maskImage: "radial-gradient(50% 60% at 15% 40%, transparent 45%, black 85%)" }}
        >
          <div className="absolute -top-20 -right-16 h-64 w-64 rounded-full border-[36px] border-brand-accent/[0.12]" />
          <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full border-[30px] border-white/[0.06]" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-white/60 text-sm font-medium">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              {greeting()}, {user?.name?.split(" ")[0] || "there"}
            </h1>
            <p className="text-white/60 text-sm mt-1.5 max-w-md">
              Here's what's happening across your policies and claims today.
            </p>
          </div>
          <div className="flex gap-2.5 shrink-0">
            <Link to={ROUTES.POLICY_CREATE}>
              <Button size="sm" className="bg-brand-accent hover:bg-brand-accent/90">
                <Plus className="h-4 w-4" /> New Policy
              </Button>
            </Link>
            <Link to={ROUTES.CLAIM_CREATE}>
              <Button size="sm" variant="outline" className="border-white/15 bg-white/[0.06] text-white hover:bg-white/10 hover:text-white">
                <AlertCircle className="h-4 w-4" /> File a Claim
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="skeleton" exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map((card, i) => (
              <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card interactive className="group">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{card.title}</p>
                        <p className="text-2xl font-bold mt-1 font-display tracking-tight">
                          <AnimatedNumber value={card.value} prefix={card.prefix} />
                        </p>
                      </div>
                      <div className={`h-12 w-12 rounded-xl ${card.bg} flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3`}>
                        <card.icon className={`h-6 w-6 ${card.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {quickActions.map((action) => (
              <Link key={action.to} to={action.to}>
                <Card interactive className="group h-full">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${action.accent}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{action.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Vehicle summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Your Vehicles</CardTitle>
              <Link to={ROUTES.APPLICATIONS}>
                <Button variant="ghost" size="sm">View All <ArrowRight className="h-3.5 w-3.5" /></Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                </div>
              ) : vehicles.length === 0 ? (
                <EmptyState icon={Car} title="No vehicles yet" description="Apply for a policy to see your vehicles here." compact />
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {vehicles.map((v) => (
                    <div key={v.reg} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
                      <div className="h-10 w-10 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
                        <Car className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{v.make} {v.model}</p>
                        <p className="text-xs text-muted-foreground truncate">{v.reg}</p>
                      </div>
                      <Badge variant={v.status === "Active" ? "success" : v.status === "Expired" ? "destructive" : "secondary"}>
                        {v.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <Link to={ROUTES.CLAIM_TRACKING}>
                <Button variant="ghost" size="sm">View All <ArrowRight className="h-3.5 w-3.5" /></Button>
              </Link>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="skel" exit={{ opacity: 0 }} className="space-y-3">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
                  </motion.div>
                ) : activityFeed.length === 0 ? (
                  <EmptyState icon={ClipboardCheck} title="No activity yet" description="Your policy and claim updates will show up here." compact />
                ) : (
                  <motion.div key="content" variants={container} initial="initial" animate="animate" className="space-y-1">
                    {activityFeed.map((ev) => (
                      <motion.div key={ev.id} variants={item}>
                        <Link to={ev.to} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/60 transition-colors">
                          <div className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center ${ev.accent}`}>
                            <ev.icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground capitalize truncate">{ev.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{ev.description}</p>
                          </div>
                          <p className="text-xs text-muted-foreground shrink-0">
                            {new Date(ev.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                          </p>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Claims overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Claims Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {isLoading ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-6 w-full rounded" />)}</div>
              ) : claimStatusBreakdown.length === 0 ? (
                <EmptyState icon={PiggyBank} title="No claims filed" description="Filed claims will appear here with their status." compact />
              ) : (
                claimStatusBreakdown.map((s) => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-muted-foreground">{s.label}</span>
                      <span className="text-sm font-semibold text-foreground">{s.count}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.color}`}
                        style={{ width: `${(s.count / (claims?.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Active policies */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Active Policies</CardTitle>
              <Badge variant="success">{activePolicies} active</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
              ) : activePolicies === 0 ? (
                <EmptyState icon={Shield} title="No active policies" actionLabel="Apply now" onAction={() => (window.location.href = ROUTES.POLICY_CREATE)} compact />
              ) : (
                policies?.filter((p) => p.status === "Active").slice(0, 3).map((policy) => (
                  <Link key={policy.id} to={ROUTES.POLICY_DETAIL(policy.id)} className="block">
                    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/60 transition-colors">
                      <div className="h-9 w-9 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
                        <Car className="h-4 w-4 text-brand-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{policy.vehicleMake} {policy.vehicleModel}</p>
                        <p className="text-xs text-muted-foreground truncate">{policy.policyNumber}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Notifications panel */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Notifications</CardTitle>
              <Link to={ROUTES.NOTIFICATIONS}>
                <Button variant="ghost" size="sm">View All <ArrowRight className="h-3.5 w-3.5" /></Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-1">
              {unreadNotifications.length === 0 ? (
                <EmptyState icon={Bell} title="You're all caught up" compact />
              ) : (
                unreadNotifications.map((n) => {
                  const Icon = notifIconMap[n.icon] ?? Bell;
                  return (
                    <div key={n.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/60 transition-colors">
                      <div className="h-8 w-8 shrink-0 rounded-lg bg-brand-secondary/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-brand-secondary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Recent claims */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Claims</CardTitle>
              <Link to={ROUTES.CLAIM_TRACKING}>
                <Button variant="ghost" size="sm">View All <ArrowRight className="h-3.5 w-3.5" /></Button>
              </Link>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="skel2" exit={{ opacity: 0 }} className="space-y-3">
                    {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                  </motion.div>
                ) : recentClaims.length === 0 ? (
                  <EmptyState icon={FileText} title="No claims yet" description="Your filed claims will show up here." compact />
                ) : (
                  <motion.div key="content" variants={container} initial="initial" animate="animate" className="space-y-2">
                    {recentClaims.map((claim) => (
                      <motion.div key={claim.id} variants={item}>
                        <Link to={ROUTES.CLAIM_DETAIL(claim.id)}>
                          <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/40 transition-colors">
                            <div className="h-9 w-9 rounded-full bg-brand-secondary/10 flex items-center justify-center shrink-0">
                              <FileText className="h-4 w-4 text-brand-secondary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-sm font-medium truncate">{claim.claimNumber}</p>
                                <Badge
                                  variant={
                                    claim.status === "Approved" ? "success" :
                                    claim.status === "Rejected" ? "destructive" :
                                    claim.status === "Closed" ? "secondary" : "warning"
                                  }
                                >
                                  {claim.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {claim.vehicleMake} {claim.vehicleModel}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
