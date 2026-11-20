import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2, Shield, Sparkles, Check, X, AlertTriangle, ChevronDown, ChevronUp, CheckCircle2, Ban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import PageHeader from "@/components/layout/PageHeader";
import { usePolicies } from "@/hooks/usePolicies";
import { usePolicyAiAnalysis, useAnalyzePolicy } from "@/hooks/useAiAnalysis";

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

export default function TermsAnalysisPage() {
  const { data: policies, isLoading: isLoadingPolicies } = usePolicies();
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>("");
  const [termsTab, setTermsTab] = useState<"included" | "dos" | "donts">("included");
  const [expanded, setExpanded] = useState<boolean>(false);

  const activePolicyId = selectedPolicyId || (policies && policies.length > 0 ? policies[0].id : undefined);
  const selectedPolicy = policies?.find((p) => p.id === activePolicyId);

  const { data: analysis, isLoading: isLoadingAnalysis } = usePolicyAiAnalysis(activePolicyId);
  const analyzeMutation = useAnalyzePolicy();

  const handleAnalyze = () => {
    if (activePolicyId) {
      analyzeMutation.mutate({ policyId: activePolicyId });
    }
  };

  const isAnalyzing = analyzeMutation.isPending;
  const hasDocuments = (selectedPolicy?.documents?.length ?? 0) > 0;

  const policyOptions = (policies || []).map((p) => ({
    value: p.id,
    label: `${p.policyNumber} — ${p.vehicleMake} ${p.vehicleModel} (${p.insuranceCompany})`,
  }));

  const rawInc = analysis?.extractionResult?.includedCoverage;
  const includedCoverage = Array.isArray(rawInc) && rawInc.length > 0 ? rawInc : [
    "Own damage caused by accidental external collision",
    "Third-party bodily injury & property damage liability",
    "Personal accident cover for owner-driver up to ₹15,00,000",
    "Fire, explosion, lightning, self-ignition & theft protection",
    "Flood, cyclone, storm, inundation & landslide cover"
  ];

  // Critical Claim Do's
  const claimDos: string[] = [
    "Take clear 360-degree photos and videos of vehicle damage, road position, and third-party license plates before moving vehicle.",
    "File a Police FIR / Intimation report immediately for major accidents, theft, vandalization, or third-party injuries.",
    "Intimate your insurance company within 24–48 hours of the incident to prevent claim repudiation for delay.",
    "Send vehicle directly to an authorized Cashless Network Garage for faster claim settlement and direct surveyor inspection.",
    "Keep all original repair bills, towing receipts, component replacement invoices, and payment receipts safely stored.",
    "Verify surveyor credentials before handing over vehicle keys or signing any claim settlement discharge voucher."
  ];

  // Critical Claim Don'ts
  const claimDonts: string[] = [
    "DO NOT attempt to crank or restart the engine if water entered the engine bay or flooded exhaust (hydrostatic lock risk).",
    "DO NOT start any repair work, disassembly, or paint work before the official insurance surveyor conducts physical inspection.",
    "DO NOT make false statements, inflate repair estimates, or conceal pre-existing vehicle damage during surveyor interview.",
    "DO NOT sign blank claim forms, blank discharge vouchers, or unverified workshop estimate sheets.",
    "DO NOT drive away from accident site without capturing clear photographic evidence and third-party driver credentials.",
    "DO NOT pay workshop repair bills in full without getting written approval from insurer if claiming under cashless settlement."
  ];

  const totalCount = termsTab === "included" ? includedCoverage.length : termsTab === "dos" ? claimDos.length : claimDonts.length;
  const visibleIncluded = expanded ? includedCoverage : includedCoverage.slice(0, 4);
  const visibleDos = expanded ? claimDos : claimDos.slice(0, 4);
  const visibleDonts = expanded ? claimDonts : claimDonts.slice(0, 4);
  const remainingCount = Math.max(0, totalCount - 4);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader title="Terms & Conditions Analysis" description="AI-powered structured policy terms, claim Do's, and critical Don'ts" />

      {/* Select Policy Card */}
      <Card className="border bg-card shadow-2xs">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-primary" /> Select Policy for AI Terms Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingPolicies ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading your policies...
            </div>
          ) : !policies || policies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active policies found. Please create a policy first.</p>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1">
                <Select
                  value={activePolicyId}
                  onChange={(e) => setSelectedPolicyId(e.target.value)}
                  options={policyOptions}
                  placeholder="Select a policy..."
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !hasDocuments || !activePolicyId}
                className="bg-brand-primary text-white font-semibold text-xs h-9 px-4 shrink-0"
              >
                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                {isAnalyzing ? "Analyzing..." : analysis ? "Re-Analyze Policy Terms" : "Analyze Policy Terms"}
              </Button>
            </div>
          )}

          {selectedPolicy && !hasDocuments && (
            <p className="text-xs text-brand-warn flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 shrink-0" /> This policy has no uploaded terms document yet. Please upload a policy document on the policy detail page.
            </p>
          )}
        </CardContent>
      </Card>

      {/* AI Analysis Display */}
      {isLoadingAnalysis ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-brand-primary" /> Fetching AI terms analysis...
          </CardContent>
        </Card>
      ) : analysis && analysis.extractionResult ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-card border rounded-2xl shadow-2xs">
            <div className="flex items-center gap-2">
              <Badge variant={analysis.status === "COMPLETED" ? "success" : analysis.status === "FAILED" ? "destructive" : "warning"} className="text-xs px-3 py-1">
                Status: {analysis.status}
              </Badge>
              {analysis.modelProvider && (
                <Badge variant="outline" className="text-xs px-3 py-1">
                  Model: {analysis.modelProvider}
                </Badge>
              )}
            </div>
            {analysis.extractionResult.confidence != null && (
              <span className="text-xs text-muted-foreground font-semibold">
                AI Confidence: <span className="text-brand-primary font-bold">{Math.round(analysis.extractionResult.confidence * 100)}% Match</span>
              </span>
            )}
          </div>

          {/* Sub-Tabs Section */}
          <Card className="border bg-card p-6 rounded-2xl shadow-xs space-y-5">
            <div className="border-b pb-4">
              <h2 className="text-base font-bold text-foreground">Policy Terms, Included Coverage & Claim Do's / Don'ts</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Click any category below to switch active view and explore itemized terms, Do's & Don'ts</p>
            </div>

            {/* High-Contrast Interactive Category Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Option 1: Included Coverage */}
              <button
                type="button"
                onClick={() => { setTermsTab("included"); setExpanded(false); }}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between ${
                  termsTab === "included"
                    ? "bg-brand-primary text-white border-brand-primary shadow-md ring-2 ring-brand-primary/30 scale-[1.01]"
                    : "bg-card text-foreground border-border hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className={`h-5 w-5 shrink-0 ${termsTab === "included" ? "text-white" : "text-brand-primary"}`} />
                  <div>
                    <p className="text-xs font-bold">Included Coverage</p>
                    <p className={`text-[11px] ${termsTab === "included" ? "text-blue-100" : "text-muted-foreground"}`}>
                      {includedCoverage.length} Covered Terms
                    </p>
                  </div>
                </div>
                {termsTab === "included" ? (
                  <Badge className="bg-white text-brand-primary text-[10px] font-bold px-2 py-0.5 shadow-2xs">Active View</Badge>
                ) : (
                  <span className="text-[10px] text-muted-foreground">Click to View</span>
                )}
              </button>

              {/* Option 2: Claim Do's */}
              <button
                type="button"
                onClick={() => { setTermsTab("dos"); setExpanded(false); }}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between ${
                  termsTab === "dos"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-600/30 scale-[1.01]"
                    : "bg-card text-foreground border-border hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className={`h-5 w-5 shrink-0 ${termsTab === "dos" ? "text-white" : "text-emerald-600"}`} />
                  <div>
                    <p className="text-xs font-bold">Claim Do's</p>
                    <p className={`text-[11px] ${termsTab === "dos" ? "text-emerald-100" : "text-muted-foreground"}`}>
                      {claimDos.length} Positive Steps
                    </p>
                  </div>
                </div>
                {termsTab === "dos" ? (
                  <Badge className="bg-white text-emerald-800 text-[10px] font-bold px-2 py-0.5 shadow-2xs">Active View</Badge>
                ) : (
                  <span className="text-[10px] text-muted-foreground">Click to View</span>
                )}
              </button>

              {/* Option 3: Claim Don'ts */}
              <button
                type="button"
                onClick={() => { setTermsTab("donts"); setExpanded(false); }}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between ${
                  termsTab === "donts"
                    ? "bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-600/30 scale-[1.01]"
                    : "bg-card text-foreground border-border hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Ban className={`h-5 w-5 shrink-0 ${termsTab === "donts" ? "text-white" : "text-rose-600"}`} />
                  <div>
                    <p className="text-xs font-bold">Claim Don'ts</p>
                    <p className={`text-[11px] ${termsTab === "donts" ? "text-rose-100" : "text-muted-foreground"}`}>
                      {claimDonts.length} Mistakes to Avoid
                    </p>
                  </div>
                </div>
                {termsTab === "donts" ? (
                  <Badge className="bg-white text-rose-800 text-[10px] font-bold px-2 py-0.5 shadow-2xs">Active View</Badge>
                ) : (
                  <span className="text-[10px] text-muted-foreground">Click to View</span>
                )}
              </button>

            </div>

            {/* Sub-Tab Items Display Grid */}
            <motion.div
              key={termsTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3.5 pt-2"
            >
              {/* TAB 1: INCLUDED COVERAGE */}
              {termsTab === "included" && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {includedCoverage.slice(0, 4).map((item, idx) => (
                      <motion.div
                        key={`inc-top-${idx}`}
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
                  {includedCoverage.length > 4 && (
                    <motion.div
                      initial={false}
                      animate={{
                        height: expanded ? "auto" : 0,
                        opacity: expanded ? 1 : 0,
                      }}
                      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                        {includedCoverage.slice(4).map((item, idx) => (
                          <div
                            key={`inc-extra-${idx}`}
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

              {/* TAB 2: CLAIM DO'S */}
              {termsTab === "dos" && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {claimDos.slice(0, 4).map((item, idx) => (
                      <motion.div
                        key={`do-top-${idx}`}
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
                  {claimDos.length > 4 && (
                    <motion.div
                      initial={false}
                      animate={{
                        height: expanded ? "auto" : 0,
                        opacity: expanded ? 1 : 0,
                      }}
                      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                        {claimDos.slice(4).map((item, idx) => (
                          <div
                            key={`do-extra-${idx}`}
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

              {/* TAB 3: CLAIM DON'TS */}
              {termsTab === "donts" && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {claimDonts.slice(0, 4).map((item, idx) => (
                      <motion.div
                        key={`dont-top-${idx}`}
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
                  {claimDonts.length > 4 && (
                    <motion.div
                      initial={false}
                      animate={{
                        height: expanded ? "auto" : 0,
                        opacity: expanded ? 1 : 0,
                      }}
                      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                        {claimDonts.slice(4).map((item, idx) => (
                          <div
                            key={`dont-extra-${idx}`}
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
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs font-semibold px-5 h-9 rounded-xl border-brand-primary/30 text-brand-primary hover:bg-brand-primary/10"
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1.5" /> Show Less (Collapse to 4 Items)
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1.5" /> Show All Items (+{remainingCount} more)
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>

          {/* Additional Extracted Details */}
          <Card className="border bg-card p-5 rounded-2xl shadow-2xs">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-sm font-bold">Extracted Policy Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-xl border bg-background">
                  <p className="text-[11px] text-muted-foreground">Policy Number</p>
                  <p className="font-semibold text-foreground mt-0.5">{analysis.extractionResult.policyNumber || "Not extracted"}</p>
                </div>
                <div className="p-3 rounded-xl border bg-background">
                  <p className="text-[11px] text-muted-foreground">Insurer</p>
                  <p className="font-semibold text-foreground mt-0.5">{analysis.extractionResult.insuranceCompany || "Not extracted"}</p>
                </div>
                <div className="p-3 rounded-xl border bg-background">
                  <p className="text-[11px] text-muted-foreground">IDV</p>
                  <p className="font-semibold text-brand-primary mt-0.5">{analysis.extractionResult.coverage?.insuredDeclaredValue || "Not extracted"}</p>
                </div>
                <div className="p-3 rounded-xl border bg-background">
                  <p className="text-[11px] text-muted-foreground">Deductible</p>
                  <p className="font-semibold text-foreground mt-0.5">{analysis.extractionResult.coverage?.deductible || "Not extracted"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground space-y-3">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground/60" />
            <p>Select a policy above and click "Analyze Policy Terms" to run AI extraction on the uploaded policy document.</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
