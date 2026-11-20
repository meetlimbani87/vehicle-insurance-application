import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Search, Shield, MapPin, Calendar, AlertTriangle, FileText, Bot, Eye, Sparkles, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useClaims, useUpdateClaimStatus } from "@/hooks/useClaims";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/layout/PageHeader";
import type { Claim } from "@/mock/mockClaims";

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

function getVehicleCategory(vehicleMake?: string, vehicleModel?: string, vehicleType?: string): string {
  const str = `${vehicleType || ""} ${vehicleMake || ""} ${vehicleModel || ""}`.toLowerCase();
  if (
    str.includes("two wheeler") || str.includes("bike") || str.includes("motorcycle") ||
    str.includes("scooter") || str.includes("yamaha") || str.includes("fz") ||
    str.includes("royal enfield") || str.includes("bullet") || str.includes("ktm") || str.includes("pulsar")
  ) {
    return "Two Wheeler";
  }
  if (str.includes("suv") || str.includes("crossover") || str.includes("fortuner") || str.includes("creta") || str.includes("thar") || str.includes("harrier")) {
    return "SUV";
  }
  if (str.includes("truck") || str.includes("commercial") || str.includes("bus") || str.includes("van")) {
    return "Commercial";
  }
  return "Car";
}

export default function AdminClaimsPage() {
  const { data: claims, isLoading } = useClaims();
  const updateStatus = useUpdateClaimStatus();
  const [searchParams] = useSearchParams();
  const reviewId = searchParams.get("review") || searchParams.get("id");

  const [statusFilter, setStatusFilter] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"aiConfidence" | "estimatedAmount" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [reviewClaim, setReviewClaim] = useState<Claim | null>(null);

  useEffect(() => {
    if (reviewId && claims && claims.length > 0) {
      const match = claims.find((c) => c.id === reviewId || c.claimNumber === reviewId);
      if (match) {
        setReviewClaim(match);
      }
    }
  }, [reviewId, claims]);

  const toggleSort = (field: "aiConfidence" | "estimatedAmount") => {
    if (sortField === field) {
      if (sortOrder === "desc") {
        setSortOrder("asc");
      } else {
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const filtered = (claims ?? []).filter((c) => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (vehicleTypeFilter) {
      const cat = getVehicleCategory(c.vehicleMake, c.vehicleModel, (c as any).vehicleType);
      if (cat !== vehicleTypeFilter) return false;
    }
    if (search) {
      const s = search.toLowerCase();
      if (!c.claimNumber.toLowerCase().includes(s) && !c.vehicleMake.toLowerCase().includes(s) && !c.vehicleModel.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0;

    if (sortField === "aiConfidence") {
      const confA = a.damageAssessment?.aiConfidence ?? (a as any).aiConfidence ?? 0;
      const confB = b.damageAssessment?.aiConfidence ?? (b as any).aiConfidence ?? 0;
      return sortOrder === "asc" ? confA - confB : confB - confA;
    }

    if (sortField === "estimatedAmount") {
      const amtA = a.estimatedAmount ?? 0;
      const amtB = b.estimatedAmount ?? 0;
      return sortOrder === "asc" ? amtA - amtB : amtB - amtA;
    }

    return 0;
  });

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-5 max-w-6xl mx-auto pb-12">
      <PageHeader title="Manage Claims" description="Review accident incidents, check AI assessments, and process claim decisions" />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search claims by number or vehicle..." className="pl-9 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <Select
          options={[
            { value: "", label: "All Vehicle Types" },
            { value: "Car", label: "Cars / Sedans" },
            { value: "Two Wheeler", label: "Two Wheelers / Bikes" },
            { value: "SUV", label: "SUVs / Crossovers" },
            { value: "Commercial", label: "Commercial / Trucks" },
          ]}
          placeholder="All Vehicle Types"
          value={vehicleTypeFilter}
          onChange={(e) => setVehicleTypeFilter(e.target.value)}
          className="sm:w-48 text-xs bg-background"
        />

        <Select
          options={[
            { value: "", label: "All Statuses" },
            { value: "Filed", label: "Filed" },
            { value: "Under Review", label: "Under Review" },
            { value: "Approved", label: "Approved" },
            { value: "Rejected", label: "Rejected" },
            { value: "Closed", label: "Closed" },
          ]}
          placeholder="All Statuses"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-44 text-xs bg-background"
        />
      </div>

      <Card className="border bg-card shadow-xs">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50 text-muted-foreground">
                    <th scope="col" className="text-left py-3 px-4 font-bold uppercase">Claim #</th>
                    <th scope="col" className="text-left py-3 px-4 font-bold uppercase">Vehicle</th>
                    <th scope="col" className="text-left py-3 px-4 font-bold uppercase hidden md:table-cell">Policy #</th>

                    <th scope="col" className="text-left py-3 px-4">
                      <button
                        onClick={() => toggleSort("aiConfidence")}
                        className="flex items-center gap-1.5 font-bold uppercase hover:text-foreground transition-colors cursor-pointer"
                        title="Click to sort by AI Confidence score"
                      >
                        <span>AI Match</span>
                        {sortField === "aiConfidence" ? (
                          sortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-brand-primary font-bold" /> : <ArrowDown className="h-3.5 w-3.5 text-brand-primary font-bold" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-40 hover:opacity-100" />
                        )}
                      </button>
                    </th>

                    <th scope="col" className="text-left py-3 px-4">
                      <button
                        onClick={() => toggleSort("estimatedAmount")}
                        className="flex items-center gap-1.5 font-bold uppercase hover:text-foreground transition-colors cursor-pointer"
                        title="Click to sort by estimated repair cost"
                      >
                        <span>Estimated Repair</span>
                        {sortField === "estimatedAmount" ? (
                          sortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-brand-primary font-bold" /> : <ArrowDown className="h-3.5 w-3.5 text-brand-primary font-bold" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-40 hover:opacity-100" />
                        )}
                      </button>
                    </th>

                    <th scope="col" className="text-left py-3 px-4 font-bold uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sorted.map((c) => {
                    const rawConf = c.damageAssessment?.aiConfidence ?? (c as any).aiConfidence;

                    return (
                      <tr
                        key={c.id}
                        onClick={() => setReviewClaim(c)}
                        className="hover:bg-muted/40 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-4 font-bold text-foreground hover:text-brand-primary">{c.claimNumber}</td>
                        <td className="py-3.5 px-4 font-medium text-foreground">{c.vehicleMake} {c.vehicleModel}</td>
                        <td className="py-3.5 px-4 hidden md:table-cell font-mono text-muted-foreground">{c.policyNumber}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={
                              c.damageEligibility === "Eligible" ? "success" :
                              c.damageEligibility === "Ineligible" || c.damageEligibility === "Not Eligible" ? "destructive" : "warning"
                            } className="text-[10px] px-2 py-0.5">
                              {c.damageEligibility || "Eligible"}
                            </Badge>
                            {rawConf && (
                              <span className="text-[11px] font-bold text-foreground">{rawConf}%</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-foreground">
                          {c.estimatedAmount ? `₹${c.estimatedAmount.toLocaleString()}` : "—"}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={c.status === "Approved" ? "success" : c.status === "Rejected" ? "destructive" : c.status === "Closed" ? "secondary" : "warning"} className="text-[10px] px-2 py-0.5">
                            {c.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground font-medium">
                        No claims found matching your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactive Claim Review Modal */}
      <Dialog open={!!reviewClaim} onOpenChange={(open) => !open && setReviewClaim(null)}>
        {reviewClaim && (
          <>
            <DialogHeader className="border-b pb-4">
              <div className="flex items-center justify-between gap-3 pr-6">
                <div>
                  <DialogTitle className="text-base font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-brand-primary" /> Claim Review: {reviewClaim.claimNumber}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Official incident cause overview & decision processing hub
                  </DialogDescription>
                </div>
                <Badge variant={reviewClaim.status === "Approved" ? "success" : reviewClaim.status === "Rejected" ? "destructive" : reviewClaim.status === "Closed" ? "secondary" : "warning"} className="text-xs px-2.5 py-0.5">
                  {reviewClaim.status}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              
              {/* Summary Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border bg-muted/20">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">Vehicle Model</p>
                  <p className="font-bold text-foreground mt-0.5">{reviewClaim.vehicleMake} {reviewClaim.vehicleModel}</p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Reg: {reviewClaim.registrationNo || 'MH-02-EE-9841'}</p>
                </div>

                <div className="p-3 rounded-xl border bg-muted/20">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">Linked Policy</p>
                  <p className="font-bold text-foreground mt-0.5">{reviewClaim.policyNumber}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Filed: {reviewClaim.filedDate}</p>
                </div>

                <div className="p-3 rounded-xl border bg-muted/20 col-span-2 sm:col-span-1">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">Est. Repair Cost</p>
                  <p className="font-bold text-brand-primary mt-0.5 text-sm">{reviewClaim.estimatedAmount ? `₹${reviewClaim.estimatedAmount.toLocaleString()}` : "Pending Estimate"}</p>
                </div>
              </div>

              {/* Accident Incident Cause */}
              <div className="p-4 rounded-xl border bg-card space-y-2">
                <div className="flex items-center gap-2 text-foreground font-bold text-xs">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" /> Accident Incident Cause & Description
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg border">
                  {reviewClaim.description || "No specific incident description provided."}
                </p>
              </div>

              {/* AI Damage Inspection Readiness */}
              {reviewClaim.damageAssessment && (
                <div className="p-4 rounded-xl border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                      <Bot className="h-4 w-4 text-brand-primary" /> AI Damage Inspection Readiness
                    </div>
                    <Badge variant={reviewClaim.damageAssessment.eligibility === "Eligible" ? "success" : "warning"} className="text-[10px]">
                      {reviewClaim.damageAssessment.eligibility} ({reviewClaim.damageAssessment.aiConfidence}% Match)
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {reviewClaim.damageAssessment.points.map((pt, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg border bg-muted/20 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground text-[11px]">{pt.area}</p>
                          <p className="text-[10px] text-muted-foreground">{pt.description}</p>
                        </div>
                        <Badge variant={pt.severity === "Critical" || pt.severity === "High" ? "destructive" : "secondary"} className="text-[9px] px-1.5 py-0">
                          {pt.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Classified Data Shield Note */}
              <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 text-[11px] text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Classified customer personal documents and supporting damage photos are hidden per privacy policy.</span>
              </div>
            </div>

            <DialogFooter className="border-t pt-3 flex items-center justify-end">
              <Button variant="outline" size="sm" onClick={() => setReviewClaim(null)} className="text-xs h-9 px-5">
                Close Overview
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </motion.div>
  );
}
