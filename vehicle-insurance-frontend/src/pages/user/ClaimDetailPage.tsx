import { useState } from "react";
import { useParams, Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ZodError } from "zod";
import {
  FileText,
  MapPin,
  Calendar,
  AlertTriangle,
  Clock,
  Download,
  Shield,
  Loader2,
  Target,
  Bot,
  ClipboardList,
  CheckCircle2,
  Camera,
  CreditCard,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Eye,
  MessageSquare,
  Brain
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useClaim, useClaims, useUpdateActualAmount, useCloseCase, useUpdateClaimStatus } from "@/hooks/useClaims";
import { usePolicies } from "@/hooks/usePolicies";
import { usePayments } from "@/hooks/usePayments";
import { useRunClaimAiAssessment } from "@/hooks/useClaimAiAssessment";
import { useAiLearning } from "@/hooks/useAiLearning";
import { updateClaimAmountSchema } from "@/schemas/claimSchemas";
import { ROUTES } from "@/constants/routes";
import { resolveUploadUrl } from "@/lib/api";
import { evaluateClaimAiApproval } from "@/lib/descriptionValidator";
import { generateClaimReportPDF } from "@/lib/pdfUtils";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function ClaimDetailPage() {
  const { id } = useParams();
  const { data: claim, isLoading, error } = useClaim(id);
  const { data: rawPolicies } = usePolicies();
  const { data: rawClaims } = useClaims();
  const { data: rawPayments } = usePayments();
  const updateAmount = useUpdateActualAmount();
  const closeCase = useCloseCase();
  const runAiAssessment = useRunClaimAiAssessment();
  const updateStatusMutation = useUpdateClaimStatus();
  const { getCalibratedAssessment } = useAiLearning();
  const [actualAmount, setActualAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [activeTab, setActiveTab] = useState<"approval" | "financials" | "overview">("approval");

  const policies = Array.isArray(rawPolicies) ? rawPolicies : [];
  const claims = Array.isArray(rawClaims) ? rawClaims : [];
  const payments = Array.isArray(rawPayments) ? rawPayments : [];

  const linkedPolicy = policies.find(
    (p) => p.id === claim?.policyId || (claim?.policyNumber && p.policyNumber === claim.policyNumber)
  );

  const policyClaimsCount = claims.filter(
    (c) => c.policyId === linkedPolicy?.id || (linkedPolicy?.policyNumber && c.policyNumber === linkedPolicy.policyNumber)
  ).length;

  const policyPayments = payments.filter(
    (p) => p.policyId === linkedPolicy?.id
  );

  const photos = claim?.photos || claim?.documents || [];

  const aiAssessment = evaluateClaimAiApproval(
    claim?.description || "",
    photos,
    linkedPolicy,
    policyClaimsCount,
    policyPayments
  );

  const hasAssessment = !!(claim?.aiAssessed || claim?.damageEligibility || claim?.damageAssessment?.eligibility);
  const eligibility = aiAssessment.eligibility;
  const confidence = aiAssessment.score;
  const damagePoints = hasAssessment ? (claim?.damagePoints || claim?.damageAssessment?.points || []) : [];

  const handleStatusChange = (newStatus: string) => {
    if (id) updateStatusMutation.mutate({ id, status: newStatus as any });
  };

  const handleUpdateAmount = () => {
    try {
      updateClaimAmountSchema.parse({ actualAmount });
      setAmountError("");
      if (id) updateAmount.mutate({ id, actualAmount: Number(actualAmount) });
    } catch (err) {
      if (err instanceof ZodError) {
        setAmountError(err.errors[0]?.message || "Invalid amount");
      }
    }
  };

  const handleDownloadClaimReport = () => {
    if (!claim) return;
    generateClaimReportPDF(claim);
    toast.success(`Claim report PDF for #${claim.claimNumber} downloaded successfully!`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-6xl mx-auto pb-12">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="py-20 max-w-md mx-auto text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto shadow-2xs">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Claim Details Unavailable</h2>
          <p className="text-xs text-muted-foreground mt-1">This claim ID was not found or may have been removed.</p>
        </div>
        <Link to={ROUTES.CLAIMS}>
          <Button size="sm" className="bg-brand-primary text-white text-xs px-5 h-9 rounded-xl">
            Back to Claims List
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="space-y-6">
            
            {/* Top Sleek Header & Actions Bar */}
            <div className="bg-card border rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg font-bold tracking-tight text-foreground">{claim.claimNumber}</h1>
                    <Badge variant={
                      claim.status === "Approved" ? "success" :
                      claim.status === "Rejected" ? "destructive" :
                      claim.status === "Closed" ? "secondary" : "warning"
                    } className="text-[11px] px-2 py-0.5">
                      {claim.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {claim.vehicleMake} {claim.vehicleModel} &bull; Reg: <span className="font-semibold text-foreground">{claim.registrationNo}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {/* User Claim Status Selector */}
                <div className="flex items-center gap-1.5 bg-muted/30 p-1 rounded-xl border">
                  <span className="text-[10px] font-semibold text-muted-foreground pl-2">Status:</span>
                  <Select
                    options={[
                      { value: "Filed", label: "Filed" },
                      { value: "Under Review", label: "Under Review" },
                      { value: "Approved", label: "Approved" },
                      { value: "Rejected", label: "Rejected" },
                      { value: "Closed", label: "Closed" },
                    ]}
                    value={claim.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="h-8 text-xs w-32 bg-background border-0"
                  />
                </div>

                <Button
                  onClick={() => id && runAiAssessment.mutate(id)}
                  disabled={runAiAssessment.isPending}
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white shadow-xs font-semibold text-xs h-9 px-4"
                >
                  {runAiAssessment.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <Bot className="h-3.5 w-3.5 mr-1.5" /> Run AI Assessment
                    </>
                  )}
                </Button>

                <Button variant="outline" size="sm" onClick={handleDownloadClaimReport} className="text-xs h-9 px-3">
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Download Report
                </Button>
              </div>
            </div>

            {/* Interactive Top 3 Metric Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Option 1: AI Approval & Damage Report Card */}
              <div
                onClick={() => setActiveTab("approval")}
                className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 ${
                  activeTab === "approval"
                    ? "bg-card border-brand-accent ring-2 ring-brand-accent/20 shadow-md scale-[1.01]"
                    : "bg-card/70 border-border hover:border-brand-accent/50 hover:bg-card"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Target className="h-4 w-4 text-brand-accent" /> AI Approval Chance
                  </span>
                  {activeTab === "approval" ? (
                    <Badge variant="success" className="text-[10px] px-2 py-0">Active View</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">Click to View</Badge>
                  )}
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-3xl font-extrabold text-brand-accent">{hasAssessment ? `${confidence}%` : "Yet to Run"}</span>
                  <Badge variant={hasAssessment ? (eligibility === "Eligible" ? "success" : "destructive") : "outline"} className="text-[11px]">
                    {hasAssessment ? eligibility : "Not Assessed"}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                  <span>Damage Scanner & Inspection Prep</span> <ArrowRight className="h-3 w-3" />
                </p>
              </div>

              {/* Option 2: Repair Cost & Financial Settlement Card */}
              <div
                onClick={() => setActiveTab("financials")}
                className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 ${
                  activeTab === "financials"
                    ? "bg-card border-brand-primary ring-2 ring-brand-primary/20 shadow-md scale-[1.01]"
                    : "bg-card/70 border-border hover:border-brand-primary/50 hover:bg-card"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-brand-primary" /> Est. Repair Cost
                  </span>
                  {activeTab === "financials" ? (
                    <Badge className="bg-brand-primary text-white text-[10px] px-2 py-0">Active View</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">Click to View</Badge>
                  )}
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-3xl font-extrabold text-brand-primary">
                    {claim.estimatedAmount ? `₹${claim.estimatedAmount.toLocaleString()}` : "₹18,500"}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {claim.actualAmount ? `Actual: ₹${claim.actualAmount.toLocaleString()}` : "Settlement"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                  <span>Financial Breakdown & Payout</span> <ArrowRight className="h-3 w-3" />
                </p>
              </div>

              {/* Option 3: Claim & Policy Overview Card */}
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
                    <Shield className="h-4 w-4 text-brand-secondary" /> Policy & Claim Details
                  </span>
                  {activeTab === "overview" ? (
                    <Badge className="bg-brand-secondary text-white text-[10px] px-2 py-0">Active View</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">Click to View</Badge>
                  )}
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg font-bold text-foreground">{claim.policyNumber}</span>
                  <span className="text-xs text-muted-foreground font-medium">{claim.accidentDate}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                  <span>Incident Description & Photos</span> <ArrowRight className="h-3 w-3" />
                </p>
              </div>

            </div>

            {/* Full Page Details Area for Selected Active View */}
            <AnimatePresence mode="wait">
              
              {/* VIEW 1: AI APPROVAL & DAMAGE INSPECTION REPORT */}
              {activeTab === "approval" && (
                <motion.div
                  key="approval-view"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {!hasAssessment ? (
                    <Card className="border bg-card p-8 rounded-2xl shadow-xs text-center space-y-4">
                      <div className="h-14 w-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto shadow-2xs">
                        <Bot className="h-7 w-7" />
                      </div>
                      <div className="max-w-md mx-auto space-y-1.5">
                        <h2 className="text-base font-bold text-foreground">AI Assessment Yet to Run</h2>
                        <p className="text-xs text-muted-foreground">
                          An AI surveyor damage inspection has not been executed for this claim yet. Click below to run AI vision photo scanning, policy terms verification, and damage estimation.
                        </p>
                      </div>
                      <Button
                        onClick={() => id && runAiAssessment.mutate(id)}
                        disabled={runAiAssessment.isPending}
                        className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs h-10 px-6 rounded-xl shadow-xs"
                      >
                        {runAiAssessment.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Running AI Analysis...
                          </>
                        ) : (
                          <>
                            <Bot className="h-4 w-4 mr-2" /> Run AI Assessment Now
                          </>
                        )}
                      </Button>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      <Card className="border bg-card p-6 rounded-2xl shadow-xs space-y-6">
                      <div className="flex items-center justify-between border-b pb-4">
                        <div>
                          <h2 className="text-base font-bold text-foreground">AI Damage Inspection & Acceptance Analysis</h2>
                          <p className="text-xs text-muted-foreground mt-0.5">Pre-claim prediction based on policy terms, damage photo scan, and payment standing</p>
                        </div>
                        <Badge variant={
                          eligibility === "Eligible" ? "success" :
                          eligibility === "Ineligible" || eligibility === "Not Eligible" ? "destructive" : "warning"
                        } className="text-xs px-3 py-1">
                          {eligibility}
                        </Badge>
                      </div>

                    {/* Visual Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>Claim Acceptance Match Score</span>
                        <span className="text-brand-accent">{confidence}% Match</span>
                      </div>
                      <div className="h-3.5 w-full rounded-full bg-muted overflow-hidden p-0.5 border">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent transition-all duration-700"
                          style={{ width: `${confidence}%` }}
                        />
                      </div>
                    </div>

                    {/* 4 Priority Category Assessment Matrix */}
                    <div className="space-y-3 pt-1">
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Brain className="h-4 w-4 text-brand-primary" /> Recalibrated AI Verification Matrix (Priority Hierarchy)
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        
                        {/* Priority 1: Description Quality (40% Weight) */}
                        <div className={`p-3.5 border rounded-xl bg-background space-y-1 ${aiAssessment.breakdown.descriptionScore < 50 ? "border-destructive/40 bg-destructive/5" : "border-emerald-500/30"}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <FileText className="h-4 w-4 text-brand-primary" /> 1. Incident Description (40%)
                            </span>
                            <Badge variant={aiAssessment.breakdown.descriptionScore >= 70 ? "success" : aiAssessment.breakdown.descriptionScore >= 40 ? "warning" : "destructive"}>
                              {aiAssessment.breakdown.descriptionScore}% Match
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                            {aiAssessment.breakdown.descriptionReason}
                          </p>
                        </div>

                        {/* Priority 2: Image Verification (30% Weight) */}
                        <div className={`p-3.5 border rounded-xl bg-background space-y-1 ${aiAssessment.breakdown.imageScore < 50 ? "border-destructive/40 bg-destructive/5" : "border-emerald-500/30"}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <Camera className="h-4 w-4 text-brand-secondary" /> 2. Damage Photo Scan (30%)
                            </span>
                            <Badge variant={aiAssessment.breakdown.imageScore >= 70 ? "success" : aiAssessment.breakdown.imageScore >= 40 ? "warning" : "destructive"}>
                              {aiAssessment.breakdown.imageScore}% Match
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                            {aiAssessment.breakdown.imageReason}
                          </p>
                        </div>

                        {/* Priority 3: Policy Status & Claims Cap (20% Weight) */}
                        <div className={`p-3.5 border rounded-xl bg-background space-y-1 ${aiAssessment.breakdown.policyScore < 50 ? "border-destructive/40 bg-destructive/5" : "border-emerald-500/30"}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <Shield className="h-4 w-4 text-brand-accent" /> 3. Policy & Claims Cap (20%)
                            </span>
                            <Badge variant={aiAssessment.breakdown.policyScore >= 70 ? "success" : aiAssessment.breakdown.policyScore >= 40 ? "warning" : "destructive"}>
                              {aiAssessment.breakdown.policyScore}% Match
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                            {aiAssessment.breakdown.policyReason}
                          </p>
                        </div>

                        {/* Priority 4: Payment Standing (10% Weight) */}
                        <div className={`p-3.5 border rounded-xl bg-background space-y-1 ${aiAssessment.breakdown.paymentScore < 50 ? "border-amber-500/40 bg-amber-500/5" : "border-emerald-500/30"}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <CreditCard className="h-4 w-4 text-emerald-600" /> 4. Premium Payment Logs (10%)
                            </span>
                            <Badge variant={aiAssessment.breakdown.paymentScore >= 70 ? "success" : aiAssessment.breakdown.paymentScore >= 40 ? "warning" : "destructive"}>
                              {aiAssessment.breakdown.paymentScore}% Standing
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                            {aiAssessment.breakdown.paymentReason}
                          </p>
                        </div>

                      </div>
                    </div>

                    {/* Detailed Question Assessment Checklist */}
                    <div className="space-y-3 pt-2 border-t">
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <ClipboardList className="h-4 w-4 text-brand-secondary" /> Specific AI Claim Acceptance Evaluation Checklist ({aiAssessment.questions.length} Audit Points)
                      </h3>

                      <div className="space-y-2">
                        {aiAssessment.questions.map((q) => (
                          <div key={q.id} className="p-3 rounded-xl border bg-background flex items-start justify-between gap-3 text-xs">
                            <div className="flex items-start gap-2.5">
                              {q.passed ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                              )}
                              <div>
                                <p className="font-bold text-foreground">{q.question}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">{q.explanation}</p>
                              </div>
                            </div>
                            <Badge variant={q.passed ? "success" : "destructive"} className="text-[10px] shrink-0">
                              {q.passed ? `+${q.scoreImpact}% Passed` : "0% Failed"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Identified Damage Points List */}
                    <div className="space-y-3 pt-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Identified Vehicle Damage Points</h3>
                      <div className="space-y-2.5">
                        {damagePoints.map((point, i) => (
                          <div key={i} className="flex items-center justify-between p-3.5 border rounded-xl bg-background hover:bg-muted/20 transition-colors text-xs">
                            <div>
                              <p className="font-semibold text-foreground text-xs">{point.area}</p>
                              <p className="text-muted-foreground text-[11px] mt-0.5">{point.description}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant={
                                point.severity === "Critical" || point.severity === "High" ? "destructive" :
                                point.severity === "Medium" ? "warning" : "success"
                              } className="text-[10px] px-2 py-0.5">
                                {point.severity}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* AI Surveyor Q&A Interview Prep Guide */}
                  <Card className="border bg-card p-6 rounded-2xl shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <h2 className="text-base font-bold text-foreground">AI Surveyor Interview & Q&A Prep Guide</h2>
                      </div>
                      <Badge variant="secondary" className="text-xs font-semibold">Inspection Prep</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4.5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-950/20 shadow-2xs space-y-2.5">
                        <div className="flex items-start gap-2.5">
                          <MessageSquare className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Surveyor Question #1</p>
                            <p className="text-sm font-semibold text-foreground leading-snug mt-0.5">"What was your vehicle's speed and direction during contact?"</p>
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-background border border-indigo-500/20 text-xs leading-relaxed">
                          <span className="font-bold text-indigo-700 dark:text-indigo-400 block mb-1">Recommended Response:</span>
                          <span className="text-foreground font-medium">State clearly that you were traveling at low speed (e.g. 15-20 km/h) when light contact occurred on the rear-right bumper. Match dashcam or GPS telemetry.</span>
                        </div>
                      </div>

                      <div className="p-4.5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-950/20 shadow-2xs space-y-2.5">
                        <div className="flex items-start gap-2.5">
                          <MessageSquare className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Surveyor Question #2</p>
                            <p className="text-sm font-semibold text-foreground leading-snug mt-0.5">"Were any existing dents or scratches present before this incident?"</p>
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-background border border-indigo-500/20 text-xs leading-relaxed">
                          <span className="font-bold text-indigo-700 dark:text-indigo-400 block mb-1">Recommended Response:</span>
                          <span className="text-foreground font-medium">Confirm the panel was in clean condition prior to the incident, and spot photos reflect the fresh impact damage exclusively.</span>
                        </div>
                      </div>
                    </div>
                      </Card>
                    </div>
                  )}
                </motion.div>
              )}

              {/* VIEW 2: REPAIR COST & FINANCIAL SETTLEMENT */}
              {activeTab === "financials" && (
                <motion.div
                  key="financials-view"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <Card className="border bg-card p-6 rounded-2xl shadow-xs space-y-6">
                    <div className="border-b pb-4">
                      <h2 className="text-base font-bold text-foreground">Claim Financial Settlement & Repair Estimates</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">AI workshop estimate vs actual settled payout breakdown</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">Estimated Repair Cost (AI Calculated)</p>
                        <p className="text-3xl font-extrabold text-brand-primary">
                          {claim.estimatedAmount ? `₹${claim.estimatedAmount.toLocaleString()}` : "₹18,500"}
                        </p>
                        <p className="text-[11px] text-muted-foreground pt-1">Based on Indian workshop body panel repair & labor rates</p>
                      </div>

                      <div className="p-4 rounded-xl border bg-background space-y-2">
                        {claim.actualAmount ? (
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">Actual Settled Amount</p>
                            <p className="text-3xl font-extrabold text-brand-accent mt-1">₹{claim.actualAmount.toLocaleString()}</p>
                            <Badge variant="success" className="text-[10px] mt-2">Settlement Recorded</Badge>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs font-semibold text-foreground mb-1.5">Enter Actual Settled Amount</p>
                            <div className="flex gap-2">
                              <Input
                                placeholder="₹0"
                                className="h-9 text-xs"
                                value={actualAmount}
                                onChange={(e) => setActualAmount(e.target.value)}
                              />
                              <Button size="sm" className="h-9 text-xs px-4 bg-brand-primary" onClick={handleUpdateAmount} disabled={updateAmount.isPending}>
                                Save Payout
                              </Button>
                            </div>
                            {amountError && <p className="text-[11px] text-destructive mt-1">{amountError}</p>}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Workshop Cost Breakdown Table */}
                    <div className="space-y-3 pt-2 border-t">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Itemized Workshop Repair Breakdown</h3>
                      <div className="border rounded-xl overflow-hidden text-xs">
                        <div className="grid grid-cols-3 bg-muted/40 p-3 font-semibold text-foreground border-b">
                          <span>Repair Component</span>
                          <span>Work Type</span>
                          <span className="text-right">Est. Cost</span>
                        </div>
                        {damagePoints.map((pt, idx) => (
                          <div key={idx} className="grid grid-cols-3 p-3 border-b last:border-0 items-center">
                            <span className="font-semibold text-foreground">{pt.area}</span>
                            <span className="text-muted-foreground">{pt.description}</span>
                            <span className="text-right font-bold text-foreground">₹{(pt.estimatedRepairCost || 8500).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* VIEW 3: POLICY & CLAIM OVERVIEW */}
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
                      <h2 className="text-base font-bold text-foreground">Claim Record & Policy Information</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">Accident details, vehicle specifications, and uploaded photos</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div className="flex items-start gap-2.5 p-3 rounded-xl border bg-background">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-muted-foreground text-[11px]">Accident Date</p>
                          <p className="font-semibold text-foreground">{claim.accidentDate}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-3 rounded-xl border bg-background">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-muted-foreground text-[11px]">Location</p>
                          <p className="font-semibold text-foreground">{claim.location}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-3 rounded-xl border bg-background">
                        <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-muted-foreground text-[11px]">Policy Number</p>
                          <Link to={ROUTES.POLICY_DETAIL(claim.policyId)} className="font-semibold text-brand-secondary hover:underline flex items-center gap-1">
                            {claim.policyNumber} <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-3 rounded-xl border bg-background">
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-muted-foreground text-[11px]">Filed Date</p>
                          <p className="font-semibold text-foreground">{claim.filedDate}</p>
                        </div>
                      </div>
                    </div>

                    {/* Accident Description Box */}
                    <div className="space-y-2 pt-2">
                      <h3 className="text-xs font-semibold text-foreground">Accident Incident Description</h3>
                      <div className="p-4 rounded-xl bg-muted/30 text-muted-foreground leading-relaxed text-xs border">
                        {claim.description}
                      </div>
                    </div>

                    {/* Photos */}
                    {claim.photos?.length > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        <h3 className="text-xs font-semibold text-foreground">Uploaded Damage Documentation Photos</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {claim.photos.map((photo, i) => (
                            <a
                              key={i}
                              href={resolveUploadUrl(photo)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative aspect-video rounded-xl overflow-hidden border bg-muted"
                            >
                              <img src={resolveUploadUrl(photo)} alt="Damage" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Predictive Disclaimer Footer Note */}
            <div className="p-4 rounded-2xl bg-muted/20 border border-border text-xs text-muted-foreground flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-brand-warn shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground text-xs">AI Predictive Model Disclaimer</p>
                <p className="text-[11px] mt-0.5">
                  Estimates and probabilities are generated by AI predictive models for pre-claim inspection readiness. Final claim settlement depends on physical garage estimates, surveyor inspection, depreciation, and policy deductible rules.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }
