import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Search, FileText, AlertCircle, Clock, CheckCircle2, ChevronDown, Bot, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
import { useClaims, useUpdateClaimStatus } from "@/hooks/useClaims";
import { useRunClaimAiAssessment } from "@/hooks/useClaimAiAssessment";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } };
const container = { animate: { transition: { staggerChildren: 0.07 } } };
const item = { initial: { opacity: 0, x: -12 }, animate: { opacity: 1, x: 0 } };

export default function ClaimTrackingPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const { data: rawClaims, isLoading } = useClaims();
  const updateStatusMutation = useUpdateClaimStatus();
  const runAiAssessment = useRunClaimAiAssessment();

  const claims = Array.isArray(rawClaims) ? rawClaims : [];

  const allClaims = claims;
  const pending = claims.filter((c) => c.status === "Filed");
  const underReview = claims.filter((c) => c.status === "Under Review");
  const approved = claims.filter((c) => c.status === "Approved");
  const closed = claims.filter((c) => c.status === "Closed");
  const rejected = claims.filter((c) => c.status === "Rejected");

  const pendingCount = pending.length + underReview.length;
  const activeClaims = claims.filter((c) => c.status !== "Closed" && c.status !== "Rejected");

  const handleSettleIndividualClaim = (claim: any) => {
    const payoutAmt = claim.estimatedAmount || claim.actualAmount || 15000;
    updateStatusMutation.mutate(
      { id: claim.id, status: "Closed" as any },
      {
        onSuccess: () => {
          toast.success(`Claim payout of ₹${payoutAmt.toLocaleString()} for claim #${claim.claimNumber} successfully disbursed & settled!`);
        },
      }
    );
  };

  const handleSettleAllClaims = () => {
    if (activeClaims.length === 0) {
      toast.info("All claims are already settled & closed.");
      return;
    }

    let totalPayout = 0;
    activeClaims.forEach((c) => {
      const amt = c.estimatedAmount || c.actualAmount || 15000;
      totalPayout += amt;
      updateStatusMutation.mutate({ id: c.id, status: "Closed" as any });
    });

    toast.success(`All ${activeClaims.length} active claims (Total ₹${totalPayout.toLocaleString()}) have been successfully disbursed & settled!`);
  };

  const filterClaims = (list: typeof claims) => {
    if (!search) return list;
    const s = search.toLowerCase();
    return list.filter((c) => c.claimNumber.toLowerCase().includes(s) || c.location.toLowerCase().includes(s) || c.vehicleMake.toLowerCase().includes(s));
  };

  const handleStatusChange = (claimId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: claimId, status: newStatus as any });
  };

  const renderList = (list: typeof claims) => {
    const filtered = filterClaims(list);
    if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>;
    if (filtered.length === 0) return <EmptyState icon={FileText} title="No Claims Found" description="Try adjusting your search or category filter." compact />;

    return (
      <motion.div variants={container} initial="initial" animate="animate" className="space-y-3">
        {filtered.map((claim) => (
          <motion.div key={claim.id} variants={item}>
            <Card 
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("button, select, a, input")) return;
                navigate(ROUTES.CLAIM_DETAIL(claim.id));
              }}
              className="hover:border-brand-primary/50 transition-colors bg-card cursor-pointer"
            >
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-bold text-sm text-foreground hover:text-brand-primary transition-colors cursor-pointer" onClick={() => navigate(ROUTES.CLAIM_DETAIL(claim.id))}>
                      {claim.claimNumber}
                    </span>
                    <Badge variant={
                      claim.status === "Approved" ? "success" :
                      claim.status === "Rejected" ? "destructive" :
                      claim.status === "Closed" ? "secondary" : "warning"
                    } className="text-[10px] px-2 py-0">
                      {claim.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {claim.vehicleMake} {claim.vehicleModel} ({claim.registrationNo}) &bull; Location: <span className="font-semibold text-foreground">{claim.location}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Accident Date: {claim.accidentDate} &bull; Filed: {claim.filedDate} &bull; Estimated Payout: <strong className="text-foreground font-bold">₹{(claim.estimatedAmount || claim.actualAmount || 15000).toLocaleString()}</strong>
                  </p>
                </div>

                {/* User Status Update Dropdown & Quick Actions */}
                <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                  <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] font-semibold text-muted-foreground block">Update Status:</span>
                    <Select
                      options={[
                        { value: "Filed", label: "Filed" },
                        { value: "Under Review", label: "Under Review" },
                        { value: "Approved", label: "Approved" },
                        { value: "Rejected", label: "Rejected" },
                        { value: "Closed", label: "Closed" },
                      ]}
                      value={claim.status}
                      onChange={(e) => handleStatusChange(claim.id, e.target.value)}
                      className="h-8 text-xs w-36 bg-background"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 pt-3 flex-wrap">
                    {claim.status !== "Closed" ? (
                      <Button
                        size="sm"
                        className="h-8 text-xs px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs whitespace-nowrap cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSettleIndividualClaim(claim);
                        }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Pay & Settle Payout (₹{(claim.estimatedAmount || claim.actualAmount || 15000).toLocaleString()})
                      </Button>
                    ) : (
                      <Badge variant="success" className="h-8 text-[11px] px-2.5 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Payout Settled
                      </Badge>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs px-2.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        runAiAssessment.mutate(claim.id);
                      }}
                      disabled={runAiAssessment.isPending}
                    >
                      <Bot className="h-3.5 w-3.5 mr-1 text-brand-primary" /> AI Assessment
                    </Button>

                    <Button 
                      size="sm" 
                      className="h-8 text-xs px-3 bg-brand-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(ROUTES.CLAIM_DETAIL(claim.id));
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-5">
      <PageHeader
        title="Personal Claims Management"
        description="Track status, manage claim progress, and run AI damage acceptance assessments"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {activeClaims.length > 0 && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs px-3.5 cursor-pointer"
                onClick={handleSettleAllClaims}
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Pay & Settle All Claims (₹{activeClaims.reduce((acc, c) => acc + (c.estimatedAmount || c.actualAmount || 15000), 0).toLocaleString()})
              </Button>
            )}
            <Link to={ROUTES.CLAIM_CREATE}>
              <Button size="sm" className="bg-brand-primary text-xs">
                + File a New Claim
              </Button>
            </Link>
          </div>
        }
      />

      {/* Daily Pending Claims Reminder Banner */}
      {pendingCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs flex items-start gap-3 shadow-2xs">
          <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-xs text-foreground">Daily Progress Reminder</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              You have <strong className="text-foreground">{pendingCount} active claim(s)</strong> in progress. Update your claim status as your physical inspection progresses, or run AI assessment to preview your approval chance.
            </p>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search claims by number, vehicle, or location..." className="pl-9 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Category Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full sm:w-auto overflow-x-auto bg-muted/40 p-1 rounded-xl">
          <TabsTrigger value="all" className="text-xs font-semibold">All Claims ({allClaims.length})</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs font-semibold">Filed ({pending.length})</TabsTrigger>
          <TabsTrigger value="under-review" className="text-xs font-semibold">Under Review ({underReview.length})</TabsTrigger>
          <TabsTrigger value="approved" className="text-xs font-semibold">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="closed" className="text-xs font-semibold">Closed ({closed.length})</TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs font-semibold">Rejected ({rejected.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">{renderList(allClaims)}</TabsContent>
        <TabsContent value="pending">{renderList(pending)}</TabsContent>
        <TabsContent value="under-review">{renderList(underReview)}</TabsContent>
        <TabsContent value="approved">{renderList(approved)}</TabsContent>
        <TabsContent value="closed">{renderList(closed)}</TabsContent>
        <TabsContent value="rejected">{renderList(rejected)}</TabsContent>
      </Tabs>

      {/* Bottom Page Claims Resolution Progress Bar Banner */}
      {allClaims.length > 0 && (() => {
        const total = allClaims.length;
        const settled = approved.length + closed.length;
        const pct = Math.round((settled / total) * 100);
        
        return (
          <div className="pt-6 mt-6 border-t space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Claims Resolution & Action Meter</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {settled} of {total} Claims Fully Processed & Settled ({pct}% Resolution Rate)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs flex-wrap">
                <Badge variant="outline" className="text-[11px] px-2.5 py-0.5 border-amber-500/30 text-amber-700 dark:text-amber-300">
                  Filed ({pending.length})
                </Badge>
                <Badge variant="outline" className="text-[11px] px-2.5 py-0.5 border-blue-500/30 text-blue-700 dark:text-blue-300">
                  Under Review ({underReview.length})
                </Badge>
                <Badge variant="outline" className="text-[11px] px-2.5 py-0.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                  Approved ({approved.length})
                </Badge>
              </div>
            </div>

            {/* Visual Smooth Gradient Progress Bar */}
            <div className="h-2.5 w-full bg-muted/60 rounded-full overflow-hidden p-0.5 border border-border/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
                className="h-full bg-gradient-to-r from-brand-primary to-emerald-500 rounded-full shadow-2xs"
              />
            </div>
          </div>
        );
      })()}
    </motion.div>
  );
}
