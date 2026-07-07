import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, FileText, CreditCard, TrendingUp, Plus, AlertCircle, ArrowRight, Car, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePolicies } from "@/hooks/usePolicies";
import { useClaims } from "@/hooks/useClaims";
import { ROUTES } from "@/constants/routes";
import { useCurrentUser } from "@/hooks/useAuth";

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

const container = { animate: { transition: { staggerChildren: 0.07 } } };
const item = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const { data: policies, isLoading: policiesLoading } = usePolicies();
  const { data: claims, isLoading: claimsLoading } = useClaims();
  const user = useCurrentUser();
  const isLoading = policiesLoading || claimsLoading;

  const activePolicies = policies?.filter((p) => p.status === "Active").length ?? 0;
  const openClaims = claims?.filter((c) => c.status !== "Closed" && c.status !== "Rejected").length ?? 0;
  const totalClaimed = claims?.reduce((sum, c) => sum + (c.actualAmount || 0), 0) ?? 0;
  const recentClaims = claims?.slice(0, 5) ?? [];

  const summaryCards = [
    { title: "Total Policies", value: policies?.length ?? 0, prefix: "", icon: Shield, color: "text-brand-primary", bg: "bg-brand-primary/10" },
    { title: "Open Claims", value: openClaims, prefix: "", icon: FileText, color: "text-brand-secondary", bg: "bg-brand-secondary/10" },
    { title: "Next Payment Due", value: 12500, prefix: "₹", icon: CreditCard, color: "text-brand-warn", bg: "bg-brand-warn/10" },
    { title: "Total Claimed", value: totalClaimed, prefix: "₹", icon: TrendingUp, color: "text-brand-accent", bg: "bg-emerald-50" },
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name || "User"} 👋</h1>
        <p className="text-muted-foreground">Here's your insurance overview</p>
      </div>

      {/* Summary Cards */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="skeleton" exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {summaryCards.map((card, i) => (
              <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card interactive className="group">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{card.title}</p>
                        <p className="text-2xl font-bold mt-1 font-display">
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
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to={ROUTES.POLICY_CREATE}>
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" /> New Policy
                </Button>
              </Link>
              <Link to={ROUTES.CLAIM_CREATE}>
                <Button className="w-full justify-start" variant="outline">
                  <AlertCircle className="h-4 w-4 mr-2" /> File a Claim
                </Button>
              </Link>
              <Link to={ROUTES.CLAIM_TRACKING}>
                <Button className="w-full justify-start" variant="outline">
                  <Clock className="h-4 w-4 mr-2" /> Track Claims
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Active Policies */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Active Policies</CardTitle>
              <Badge variant="success">{activePolicies} active</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {policies?.filter((p) => p.status === "Active").slice(0, 3).map((policy) => (
                <Link key={policy.id} to={ROUTES.POLICY_DETAIL(policy.id)} className="block">
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                      <Car className="h-5 w-5 text-brand-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{policy.vehicleMake} {policy.vehicleModel}</p>
                      <p className="text-xs text-muted-foreground">{policy.policyNumber}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Claims */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Claims</CardTitle>
              <Link to={ROUTES.CLAIM_TRACKING}>
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="skel" exit={{ opacity: 0 }} className="space-y-3">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
                  </motion.div>
                ) : (
                  <motion.div key="content" variants={container} initial="initial" animate="animate" className="space-y-3">
                    {recentClaims.length === 0 ? (
                      <p className="text-center text-muted-foreground py-6">No claims yet</p>
                    ) : (
                      recentClaims.map((claim) => (
                        <motion.div key={claim.id} variants={item}>
                          <Link to={ROUTES.CLAIM_DETAIL(claim.id)}>
                            <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                              <div className="h-10 w-10 rounded-full bg-brand-secondary/10 flex items-center justify-center shrink-0">
                                <FileText className="h-5 w-5 text-brand-secondary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-medium">{claim.claimNumber}</p>
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
                                  {claim.vehicleMake} {claim.vehicleModel} • {claim.location}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                {claim.estimatedAmount && (
                                  <p className="text-sm font-medium">₹{claim.estimatedAmount.toLocaleString()}</p>
                                )}
                                <p className="text-xs text-muted-foreground">{claim.accidentDate}</p>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))
                    )}
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
