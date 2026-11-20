import { useState } from "react";
import { useParams, Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Car,
  Calendar,
  Clock,
  FileText,
  CreditCard,
  AlertCircle,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Eye,
  Check,
  X,
  FileCheck,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Ban,
  MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { usePolicy } from "@/hooks/usePolicies";
import { useClaims } from "@/hooks/useClaims";
import { usePayments } from "@/hooks/usePayments";
import { usePolicyAiAnalysis, useAnalyzePolicy } from "@/hooks/useAiAnalysis";
import { ROUTES } from "@/constants/routes";
import { resolveUploadUrl } from "@/lib/api";
import { formatPolicyTimeRemaining } from "@/lib/utils";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function PolicyDetailPage() {
  const { id } = useParams();
  const { data: policy, isLoading, error } = usePolicy(id);
  const { data: claims } = useClaims();
  const { data: allPayments } = usePayments();
  const { data: analysis, isLoading: isAiLoading } = usePolicyAiAnalysis(id);
  const analyzeMutation = useAnalyzePolicy();

  const [activeTab, setActiveTab] = useState<"extraction" | "terms" | "overview" | "claims">("claims");
  const [termsSubTab, setTermsSubTab] = useState<"included" | "dos" | "donts">("included");
  const [termsExpanded, setTermsExpanded] = useState<boolean>(false);

  const linkedClaims = claims?.filter(
    (c) =>
      c.policyId === id ||
      (policy?.policyNumber && c.policyNumber === policy.policyNumber) ||
      (c.vehicleMake?.toLowerCase() === policy?.vehicleMake?.toLowerCase() &&
        c.vehicleModel?.toLowerCase() === policy?.vehicleModel?.toLowerCase())
  ) ?? [];
  const payments = allPayments?.filter((p) => p.policyId === id) ?? [];

  const getDaysRemaining = () => {
    if (!policy) return 0;
    const end = new Date(policy.endDate);
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysRemaining();
  const expiryColor = daysRemaining > 90 ? "text-brand-accent" : daysRemaining > 30 ? "text-brand-warn" : "text-destructive";
  const durationDisplay = formatPolicyTimeRemaining(policy?.endDate, policy?.status);

  const handleAnalyze = () => {
    if (id) analyzeMutation.mutate({ policyId: id });
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6 max-w-6xl mx-auto pb-12">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="skeleton" exit={{ opacity: 0 }} className="space-y-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </motion.div>
        ) : error || !policy ? (
          <motion.div key="error" className="py-16 text-center text-destructive font-medium">
            Failed to load policy details. Please try again.
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            
            {/* Top Header & Quick Actions Bar */}
            <div className="bg-card border rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-lg font-bold tracking-tight text-foreground">{policy.policyNumber}</h1>
                    <Badge variant={policy.status === "Active" || policy.status === "Renewed" ? "success" : policy.status === "Expired" ? "destructive" : "secondary"}>
                      {policy.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {policy.vehicleMake} {policy.vehicleModel} ({policy.vehicleYear}) &bull; Reg: <strong className="text-foreground">{policy.registrationNo}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzeMutation.isPending}
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white shadow-xs font-semibold text-xs h-9 px-4 rounded-xl"
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Re-Analyzing PDF...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Re-Scan PDF Terms
                    </>
                  )}
                </Button>

                <Link to={ROUTES.CLAIM_CREATE}>
                  <Button size="sm" variant="outline" className="text-xs h-9 px-3 rounded-xl">
                    File Claim Under Policy
                  </Button>
                </Link>
              </div>
            </div>

            {/* Interactive Top 4 Metric Options Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Option 1: Claims Filed Under This Policy */}
              <div
                onClick={() => setActiveTab("claims")}
                className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 ${
                  activeTab === "claims"
                    ? "bg-card border-brand-primary ring-2 ring-brand-primary/20 shadow-md scale-[1.01]"
                    : "bg-card/70 border-border hover:border-brand-primary/50 hover:bg-card"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-brand-primary" /> Policy Claims ({linkedClaims.length})
                  </span>
                  {activeTab === "claims" ? (
                    <Badge className="bg-brand-primary text-white text-[10px] px-2 py-0">Active View</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">Click to View</Badge>
                  )}
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-extrabold text-brand-primary">{linkedClaims.length} Claim{linkedClaims.length !== 1 ? "s" : ""}</span>
                  <Badge variant={linkedClaims.length > 0 ? "outline" : "success"} className="text-[10px]">
                    {linkedClaims.length > 0 ? "Incidents Filed" : "Clean History"}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                  <span>List of Claims & Statuses</span> <ArrowRight className="h-3 w-3" />
                </p>
              </div>

              {/* Option 2: AI Document Extraction */}
              <div
                onClick={() => setActiveTab("extraction")}
                className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 ${
                  activeTab === "extraction"
                    ? "bg-card border-brand-accent ring-2 ring-brand-accent/20 shadow-md scale-[1.01]"
                    : "bg-card/70 border-border hover:border-brand-accent/50 hover:bg-card"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-brand-accent" /> AI Extraction
                  </span>
                  {activeTab === "extraction" ? (
                    <Badge variant="success" className="text-[10px] px-2 py-0">Active View</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">Click to View</Badge>
                  )}
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl font-extrabold text-foreground">
                    {analysis?.extractionResult?.confidence != null ? `${Math.round(analysis.extractionResult.confidence * 100)}% Match` : "AI Scanned"}
                  </span>
                  <Badge variant={analysis?.status === "COMPLETED" ? "success" : "outline"} className="text-[10px]">
                    {analysis?.status ?? "Pending"}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                  <span>Structured Document Terms</span> <ArrowRight className="h-3 w-3" />
                </p>
              </div>

              {/* Option 3: Policy Terms, Coverage & Exclusions */}
              <div
                onClick={() => setActiveTab("terms")}
                className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 ${
                  activeTab === "terms"
                    ? "bg-card border-brand-primary ring-2 ring-brand-primary/20 shadow-md scale-[1.01]"
                    : "bg-card/70 border-border hover:border-brand-primary/50 hover:bg-card"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <FileCheck className="h-4 w-4 text-brand-primary" /> Coverage
                  </span>
                  {activeTab === "terms" ? (
                    <Badge className="bg-brand-primary text-white text-[10px] px-2 py-0">Active View</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">Click to View</Badge>
                  )}
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl font-extrabold text-brand-primary">
                    {analysis?.extractionResult?.includedCoverage?.length ?? 5} Coverages
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                  <span>Protection & Fine Print</span> <ArrowRight className="h-3 w-3" />
                </p>
              </div>

              {/* Option 4: Policy Overview & Payment Schedule */}
              <div
                onClick={() => setActiveTab("overview")}
                className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 ${
                  activeTab === "overview"
                    ? "bg-card border-brand-secondary ring-2 ring-brand-secondary/20 shadow-md scale-[1.01]"
                    : "bg-card/70 border-border hover:border-brand-secondary/50 hover:bg-card"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-brand-secondary" /> Specs & Plan
                  </span>
                  {activeTab === "overview" ? (
                    <Badge className="bg-brand-secondary text-white text-[10px] px-2 py-0">Active View</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">Click to View</Badge>
                  )}
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl font-extrabold text-foreground">₹{policy.premiumAmount.toLocaleString()}</span>
                  <span className={`text-xs ${durationDisplay.colorClass}`}>{durationDisplay.label}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                  <span>Vehicle Specs & Premium</span> <ArrowRight className="h-3 w-3" />
                </p>
              </div>

            </div>

            {/* Full Page Details Area */}
            <AnimatePresence mode="wait">

              {/* VIEW 0: CLAIMS FILED UNDER THIS POLICY */}
              {activeTab === "claims" && (
                <motion.div
                  key="claims-view"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <Card className="border bg-card p-6 rounded-2xl shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <h2 className="text-base font-bold text-foreground">Claims History Filed Under Policy {policy.policyNumber}</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Comprehensive incident records, AI assessments, and payout settlement history</p>
                      </div>
                      <Link to={ROUTES.CLAIM_CREATE}>
                        <Button size="sm" className="bg-brand-primary text-white text-xs h-8 px-3.5 rounded-lg font-semibold">
                          + File New Claim
                        </Button>
                      </Link>
                    </div>

                    {/* Claims Allowance & Limit Capacity Banner */}
                    <div className="p-4 rounded-xl border border-brand-primary/20 bg-brand-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-bold text-foreground flex items-center gap-1.5">
                          <Shield className="h-4 w-4 text-brand-primary" /> Policy Claim Allowance & Frequency Cap
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Extracted Terms: Allowed limit of <strong>{policy.maxClaimsPerYear || 2} Claims per Policy Year</strong> and <strong>{policy.maxClaimsPerMonth || 1} Claim per Month</strong>.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-xs font-bold text-brand-primary border-brand-primary/40 bg-background py-1 px-3">
                          {linkedClaims.length} of {policy.maxClaimsPerYear || 2} Claims Used
                        </Badge>
                      </div>
                    </div>

                    {linkedClaims.length === 0 ? (
                      <div className="py-12 text-center space-y-3">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-bold text-foreground">Clean Claims Record</p>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          No accident claims have been filed under this policy so far. You have a 100% clean claims history!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {linkedClaims.map((c) => (
                          <Link key={c.id} to={ROUTES.CLAIM_DETAIL(c.id)}>
                            <div className="p-4 rounded-xl border bg-background hover:bg-muted/30 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-2xs">
                              <div className="flex items-center gap-3.5">
                                <div className="h-10 w-10 rounded-xl bg-brand-secondary/10 text-brand-secondary flex items-center justify-center shrink-0">
                                  <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-sm text-foreground group-hover:text-brand-primary transition-colors">
                                      {c.claimNumber}
                                    </span>
                                    <Badge variant={c.status === "Approved" ? "success" : c.status === "Rejected" ? "destructive" : "warning"} className="text-[10px]">
                                      {c.status}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {c.accidentDate ? `Accident Date: ${c.accidentDate}` : "Filed Incident"} &bull; Location: <strong className="text-foreground">{c.location || "N/A"}</strong>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 self-end sm:self-center">
                                <div className="text-right">
                                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Est. Repair Cost</p>
                                  <p className="text-sm font-bold text-brand-primary">
                                    {c.estimatedAmount ? `₹${c.estimatedAmount.toLocaleString()}` : "Pending"}
                                  </p>
                                </div>
                                <Button size="sm" variant="outline" className="text-xs h-8 px-3 rounded-lg group-hover:border-brand-primary group-hover:text-brand-primary">
                                  View Claim <ArrowRight className="h-3.5 w-3.5 ml-1" />
                                </Button>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}

              {/* VIEW 1: AI POLICY EXTRACTION */}
              {activeTab === "extraction" && (
                <motion.div
                  key="extraction-view"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <Card className="border bg-card p-6 rounded-2xl shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <h2 className="text-base font-bold text-foreground">AI Policy Document Extraction Results</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Structured policy terms extracted directly from uploaded PDF insurance policy</p>
                      </div>
                      <Badge variant={analysis?.status === "COMPLETED" ? "success" : "outline"} className="text-xs px-3 py-1">
                        {analysis?.status ?? "Ready for Scan"}
                      </Badge>
                    </div>

                    {/* Extracted Key-Value Facts Grid */}
                    {analysis?.extractionResult ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-3.5 rounded-xl border bg-background">
                          <p className="text-[11px] text-muted-foreground font-medium">Extracted Policy No</p>
                          <p className="text-sm font-bold text-foreground mt-1">{analysis.extractionResult.policyNumber || policy.policyNumber}</p>
                        </div>
                        <div className="p-3.5 rounded-xl border bg-background">
                          <p className="text-[11px] text-muted-foreground font-medium">Extracted Insurance Provider</p>
                          <p className="text-sm font-bold text-foreground mt-1">{analysis.extractionResult.insuranceCompany || policy.insuranceCompany}</p>
                        </div>
                        <div className="p-3.5 rounded-xl border bg-background">
                          <p className="text-[11px] text-muted-foreground font-medium">Extracted Policyholder</p>
                          <p className="text-sm font-bold text-foreground mt-1">{analysis.extractionResult.policyholderName || policy.ownerName}</p>
                        </div>
                        <div className="p-3.5 rounded-xl border bg-background">
                          <p className="text-[11px] text-muted-foreground font-medium">Coverage Period</p>
                          <p className="text-sm font-bold text-foreground mt-1">
                            {analysis.extractionResult.coverage?.startDate || policy.startDate} &rarr; {analysis.extractionResult.coverage?.endDate || policy.endDate}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-xl border bg-background">
                          <p className="text-[11px] text-muted-foreground font-medium">Insured Declared Value (IDV)</p>
                          <p className="text-sm font-bold text-brand-primary mt-1">{analysis.extractionResult.coverage?.insuredDeclaredValue || "Standard IDV"}</p>
                        </div>
                        <div className="p-3.5 rounded-xl border bg-background">
                          <p className="text-[11px] text-muted-foreground font-medium">Compulsory Deductible</p>
                          <p className="text-sm font-bold text-foreground mt-1">{analysis.extractionResult.coverage?.deductible || "₹2,000"}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center border rounded-xl bg-muted/20 space-y-3">
                        <Sparkles className="h-8 w-8 text-brand-accent mx-auto" />
                        <h3 className="text-sm font-bold text-foreground">Run AI Policy Extraction</h3>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto">
                          Click the button below to extract structured terms, coverage limits, and fine print exclusions from your policy document.
                        </p>
                        <Button onClick={handleAnalyze} disabled={analyzeMutation.isPending} className="bg-brand-primary text-white text-xs h-9">
                          Start AI Analysis
                        </Button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}

              {/* VIEW 2: COVERAGE, EXCLUSIONS & FINE PRINT (SPACIOUS & ELEGANT SUB-TABS!) */}
              {activeTab === "terms" && (
                <motion.div
                  key="terms-view"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <Card className="border bg-card p-6 rounded-2xl shadow-xs space-y-6">
                    <div className="border-b pb-4">
                      <h2 className="text-base font-bold text-foreground">Policy Terms, Included Coverage & Claim Do's / Don'ts</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">Select a category below to explore itemized terms, Do's & Don'ts</p>
                    </div>
                    {/* High-Contrast Interactive Category Selector Cards */}
                    {(() => {
                      const inc = analysis?.extractionResult?.includedCoverage || [
                        "Own damage caused by accidental external collision",
                        "Third-party bodily injury & property damage liability",
                        "Personal accident cover for owner-driver up to ₹15,00,000",
                        "Fire, explosion, lightning, self-ignition & theft protection",
                        "Flood, cyclone, storm, inundation & landslide cover"
                      ];

                      const dos = [
                        "Take clear 360-degree photos and videos of vehicle damage, road position, and third-party license plates before moving vehicle.",
                        "File a Police FIR / Intimation report immediately for major accidents, theft, vandalization, or third-party injuries.",
                        "Intimate your insurance company within 24–48 hours of the incident to prevent claim repudiation for delay.",
                        "Send vehicle directly to an authorized Cashless Network Garage for faster claim settlement and direct surveyor inspection.",
                        "Keep all original repair bills, towing receipts, component replacement invoices, and payment receipts safely stored.",
                        "Verify surveyor credentials before handing over vehicle keys or signing any claim settlement discharge voucher."
                      ];

                      const donts = [
                        "DO NOT attempt to crank or restart the engine if water entered the engine bay or flooded exhaust (hydrostatic lock risk).",
                        "DO NOT start any repair work, disassembly, or paint work before the official insurance surveyor conducts physical inspection.",
                        "DO NOT make false statements, inflate repair estimates, or conceal pre-existing vehicle damage during surveyor interview.",
                        "DO NOT sign blank claim forms, blank discharge vouchers, or unverified workshop estimate sheets.",
                        "DO NOT drive away from accident site without capturing clear photographic evidence and third-party driver credentials.",
                        "DO NOT pay workshop repair bills in full without getting written approval from insurer if claiming under cashless settlement."
                      ];

                      const totalCount = termsSubTab === "included" ? inc.length : termsSubTab === "dos" ? dos.length : donts.length;
                      const visInc = termsExpanded ? inc : inc.slice(0, 4);
                      const visDos = termsExpanded ? dos : dos.slice(0, 4);
                      const visDonts = termsExpanded ? donts : donts.slice(0, 4);
                      const remCount = Math.max(0, totalCount - 4);

                      return (
                        <div className="space-y-5">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Option 1: Included Coverage */}
                            <button
                              type="button"
                              onClick={() => { setTermsSubTab("included"); setTermsExpanded(false); }}
                              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between ${
                                termsSubTab === "included"
                                  ? "bg-brand-primary text-white border-brand-primary shadow-md ring-2 ring-brand-primary/30 scale-[1.01]"
                                  : "bg-card text-foreground border-border hover:bg-muted/40"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <CheckCircle2 className={`h-5 w-5 shrink-0 ${termsSubTab === "included" ? "text-white" : "text-brand-primary"}`} />
                                <div>
                                  <p className="text-xs font-bold">Included Coverage</p>
                                  <p className={`text-[11px] ${termsSubTab === "included" ? "text-blue-100" : "text-muted-foreground"}`}>{inc.length} Covered Terms</p>
                                </div>
                              </div>
                              {termsSubTab === "included" ? (
                                <Badge className="bg-white text-brand-primary text-[10px] font-bold px-2 py-0.5 shadow-2xs">Active View</Badge>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">Click to View</span>
                              )}
                            </button>

                            {/* Option 2: Claim Do's */}
                            <button
                              type="button"
                              onClick={() => { setTermsSubTab("dos"); setTermsExpanded(false); }}
                              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between ${
                                termsSubTab === "dos"
                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-600/30 scale-[1.01]"
                                  : "bg-card text-foreground border-border hover:bg-muted/40"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <CheckCircle2 className={`h-5 w-5 shrink-0 ${termsSubTab === "dos" ? "text-white" : "text-emerald-600"}`} />
                                <div>
                                  <p className="text-xs font-bold">Claim Do's</p>
                                  <p className={`text-[11px] ${termsSubTab === "dos" ? "text-emerald-100" : "text-muted-foreground"}`}>{dos.length} Positive Steps</p>
                                </div>
                              </div>
                              {termsSubTab === "dos" ? (
                                <Badge className="bg-white text-emerald-800 text-[10px] font-bold px-2 py-0.5 shadow-2xs">Active View</Badge>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">Click to View</span>
                              )}
                            </button>

                            {/* Option 3: Claim Don'ts */}
                            <button
                              type="button"
                              onClick={() => { setTermsSubTab("donts"); setTermsExpanded(false); }}
                              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between ${
                                termsSubTab === "donts"
                                  ? "bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-600/30 scale-[1.01]"
                                  : "bg-card text-foreground border-border hover:bg-muted/40"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <Ban className={`h-5 w-5 shrink-0 ${termsSubTab === "donts" ? "text-white" : "text-rose-600"}`} />
                                <div>
                                  <p className="text-xs font-bold">Claim Don'ts</p>
                                  <p className={`text-[11px] ${termsSubTab === "donts" ? "text-rose-100" : "text-muted-foreground"}`}>{donts.length} Mistakes to Avoid</p>
                                </div>
                              </div>
                              {termsSubTab === "donts" ? (
                                <Badge className="bg-white text-rose-800 text-[10px] font-bold px-2 py-0.5 shadow-2xs">Active View</Badge>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">Click to View</span>
                              )}
                            </button>
                          </div>

                          {/* Sub-Tab Items Grid */}
                          <motion.div
                            key={termsSubTab}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3.5 pt-2"
                          >
                            {termsSubTab === "included" && (
                              <div className="space-y-3.5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                  {inc.slice(0, 4).map((item, idx) => (
                                    <motion.div
                                      key={`p-inc-top-${idx}`}
                                      initial={{ opacity: 0, scale: 0.97 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ duration: 0.2 }}
                                      className="p-4 rounded-xl border border-brand-primary/20 bg-background shadow-2xs flex items-start gap-3.5 hover:border-brand-primary/40 transition-colors"
                                    >
                                      <div className="p-1.5 rounded-full bg-brand-primary/10 text-brand-primary shrink-0 mt-0.5">
                                        <Check className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <p className="text-xs font-semibold text-brand-primary mb-0.5">Covered Term #{idx + 1}</p>
                                        <p className="text-sm font-medium text-foreground leading-relaxed">{item}</p>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                                {inc.length > 4 && (
                                  <motion.div
                                    initial={false}
                                    animate={{
                                      height: termsExpanded ? "auto" : 0,
                                      opacity: termsExpanded ? 1 : 0,
                                    }}
                                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                                    className="overflow-hidden"
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                                      {inc.slice(4).map((item, idx) => (
                                        <div
                                          key={`p-inc-extra-${idx}`}
                                          className="p-4 rounded-xl border border-brand-primary/20 bg-background shadow-2xs flex items-start gap-3.5 hover:border-brand-primary/40 transition-colors"
                                        >
                                          <div className="p-1.5 rounded-full bg-brand-primary/10 text-brand-primary shrink-0 mt-0.5">
                                            <Check className="h-4 w-4" />
                                          </div>
                                          <div>
                                            <p className="text-xs font-semibold text-brand-primary mb-0.5">Covered Term #{idx + 5}</p>
                                            <p className="text-sm font-medium text-foreground leading-relaxed">{item}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            )}

                            {termsSubTab === "dos" && (
                              <div className="space-y-3.5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                  {dos.slice(0, 4).map((item, idx) => (
                                    <motion.div
                                      key={`p-do-top-${idx}`}
                                      initial={{ opacity: 0, scale: 0.97 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ duration: 0.2 }}
                                      className="p-4 rounded-xl border border-emerald-500/20 bg-background shadow-2xs flex items-start gap-3.5 hover:border-emerald-500/40 transition-colors"
                                    >
                                      <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-600 shrink-0 mt-0.5">
                                        <Check className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-0.5">Essential Do #{idx + 1}</p>
                                        <p className="text-sm font-medium text-foreground leading-relaxed">{item}</p>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                                {dos.length > 4 && (
                                  <motion.div
                                    initial={false}
                                    animate={{
                                      height: termsExpanded ? "auto" : 0,
                                      opacity: termsExpanded ? 1 : 0,
                                    }}
                                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                                    className="overflow-hidden"
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                                      {dos.slice(4).map((item, idx) => (
                                        <div
                                          key={`p-do-extra-${idx}`}
                                          className="p-4 rounded-xl border border-emerald-500/20 bg-background shadow-2xs flex items-start gap-3.5 hover:border-emerald-500/40 transition-colors"
                                        >
                                          <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-600 shrink-0 mt-0.5">
                                            <Check className="h-4 w-4" />
                                          </div>
                                          <div>
                                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-0.5">Essential Do #{idx + 5}</p>
                                            <p className="text-sm font-medium text-foreground leading-relaxed">{item}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            )}

                            {termsSubTab === "donts" && (
                              <div className="space-y-3.5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                  {donts.slice(0, 4).map((item, idx) => (
                                    <motion.div
                                      key={`p-dont-top-${idx}`}
                                      initial={{ opacity: 0, scale: 0.97 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ duration: 0.2 }}
                                      className="p-4 rounded-xl border border-rose-500/20 bg-background shadow-2xs flex items-start gap-3.5 hover:border-rose-500/40 transition-colors"
                                    >
                                      <div className="p-1.5 rounded-full bg-rose-500/10 text-rose-600 shrink-0 mt-0.5">
                                        <X className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 mb-0.5">Critical Mistake To Avoid #{idx + 1}</p>
                                        <p className="text-sm font-medium text-foreground leading-relaxed">{item}</p>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                                {donts.length > 4 && (
                                  <motion.div
                                    initial={false}
                                    animate={{
                                      height: termsExpanded ? "auto" : 0,
                                      opacity: termsExpanded ? 1 : 0,
                                    }}
                                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                                    className="overflow-hidden"
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                                      {donts.slice(4).map((item, idx) => (
                                        <div
                                          key={`p-dont-extra-${idx}`}
                                          className="p-4 rounded-xl border border-rose-500/20 bg-background shadow-2xs flex items-start gap-3.5 hover:border-rose-500/40 transition-colors"
                                        >
                                          <div className="p-1.5 rounded-full bg-rose-500/10 text-rose-600 shrink-0 mt-0.5">
                                            <X className="h-4 w-4" />
                                          </div>
                                          <div>
                                            <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 mb-0.5">Critical Mistake To Avoid #{idx + 5}</p>
                                            <p className="text-sm font-medium text-foreground leading-relaxed">{item}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            )}
                          </motion.div>

                          {/* Show More / Show Less Toggle Button */}
                          {totalCount > 4 && (
                            <div className="pt-2 text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setTermsExpanded(!termsExpanded)}
                                className="text-xs font-semibold px-5 h-9 rounded-xl border-brand-primary/30 text-brand-primary hover:bg-brand-primary/10"
                              >
                                {termsExpanded ? (
                                  <>
                                    <ChevronUp className="h-4 w-4 mr-1.5" /> Show Less (Collapse to 4 Items)
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-4 w-4 mr-1.5" /> Show All Items (+{remCount} more)
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </Card>
                </motion.div>
              )}

              {/* VIEW 3: POLICY OVERVIEW & PAYMENT SCHEDULE */}
              {activeTab === "overview" && (
                <motion.div
                  key="overview-view"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <Card className="border bg-card p-6 rounded-2xl shadow-xs space-y-6">
                    <div className="border-b pb-4">
                      <h2 className="text-base font-bold text-foreground">Vehicle Specifications & Policy Plan</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">Policy registration details, owner records, and coverage schedule</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl border bg-background space-y-1">
                        <p className="text-[11px] text-muted-foreground">Vehicle Model</p>
                        <p className="font-semibold text-foreground text-sm">{policy.vehicleMake} {policy.vehicleModel}</p>
                        <p className="text-[11px] text-muted-foreground">Year: {policy.vehicleYear}</p>
                      </div>

                      <div className="p-3.5 rounded-xl border bg-background space-y-1">
                        <p className="text-[11px] text-muted-foreground">Registration No.</p>
                        <p className="font-semibold text-foreground text-sm">{policy.registrationNo}</p>
                        <p className="text-[11px] text-muted-foreground">Type: {policy.vehicleType}</p>
                      </div>

                      <div className="p-3.5 rounded-xl border bg-background space-y-1">
                        <p className="text-[11px] text-muted-foreground">Policy Owner</p>
                        <p className="font-semibold text-foreground text-sm">{policy.ownerName}</p>
                        <p className="text-[11px] text-muted-foreground">Insurer: {policy.insuranceCompany}</p>
                      </div>

                      <div className="p-3.5 rounded-xl border bg-background space-y-1">
                        <p className="text-[11px] text-muted-foreground">Insured Valuation</p>
                        <p className="font-bold text-brand-primary text-sm">₹{policy.premiumAmount.toLocaleString()}</p>
                        <p className="text-[11px] text-muted-foreground">Coverage: {policy.coverageType}</p>
                      </div>
                    </div>

                    {/* Linked Claims List */}
                    {linkedClaims.length > 0 && (
                      <div className="space-y-3 pt-2 border-t">
                        <h3 className="text-xs font-semibold text-foreground">Associated Policy Claims ({linkedClaims.length})</h3>
                        <div className="space-y-2">
                          {linkedClaims.map((c) => (
                            <Link key={c.id} to={ROUTES.CLAIM_DETAIL(c.id)}>
                              <div className="flex items-center justify-between p-3 border rounded-xl bg-background hover:bg-muted/20 text-xs">
                                <div>
                                  <p className="font-semibold text-foreground">{c.claimNumber}</p>
                                  <p className="text-muted-foreground text-[11px]">Accident Date: {c.accidentDate} &bull; Location: {c.location}</p>
                                </div>
                                <Badge variant={c.status === "Approved" ? "success" : c.status === "Rejected" ? "destructive" : "warning"}>
                                  {c.status}
                                </Badge>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
