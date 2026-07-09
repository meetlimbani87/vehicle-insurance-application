import { useState } from "react";
import { useParams, Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ZodError } from "zod";
import { FileText, MapPin, Calendar, AlertTriangle, CheckCircle, XCircle, Clock, Download, Shield, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useClaim, useUpdateActualAmount, useCloseCase } from "@/hooks/useClaims";
import { updateClaimAmountSchema } from "@/schemas/claimSchemas";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const statusSteps = ["Filed", "Under Review", "Approved", "Closed"];

export default function ClaimDetailPage() {
  const { id } = useParams();
  const { data: claim, isLoading } = useClaim(id);
  const updateAmount = useUpdateActualAmount();
  const closeCase = useCloseCase();
  const [actualAmount, setActualAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [showAI, setShowAI] = useState(false);

  // Simulate AI loading
  useState(() => {
    const timer = setTimeout(() => setShowAI(true), 1500);
    return () => clearTimeout(timer);
  });

  const handleUpdateAmount = () => {
    try {
      updateClaimAmountSchema.parse({ actualAmount });
      setAmountError("");
      if (id) updateAmount.mutate({ id, actualAmount: Number(actualAmount) });
    } catch (err) {
      if (err instanceof ZodError) {
        setAmountError(err.issues[0]?.message || "Invalid amount");
      }
    }
  };

  const getStepIndex = (status: string) => {
    if (status === "Rejected") return 2;
    return statusSteps.indexOf(status);
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="skeleton" exit={{ opacity: 0 }} className="space-y-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </motion.div>
        ) : claim ? (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Claim Summary */}
            <Card>
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-xl bg-brand-secondary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-7 w-7 text-brand-secondary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-xl font-bold">{claim.claimNumber}</h1>
                        <Badge variant={
                          claim.status === "Approved" ? "success" :
                          claim.status === "Rejected" ? "destructive" :
                          claim.status === "Closed" ? "secondary" : "warning"
                        }>{claim.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{claim.vehicleMake} {claim.vehicleModel} ({claim.registrationNo})</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" onClick={() => toast.info("Report download coming soon")}>
                      <Download className="h-4 w-4 mr-2" /> Download Report
                    </Button>
                    {claim.status === "Approved" && claim.actualAmount && (
                      <Button variant="destructive" onClick={() => id && closeCase.mutate(id)} disabled={closeCase.isPending}>
                        {closeCase.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Close Case
                      </Button>
                    )}
                  </div>
                </div>

                <Separator className="my-5" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Accident Date</p>
                      <p className="text-sm font-medium">{claim.accidentDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium">{claim.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Policy</p>
                      <Link to={ROUTES.POLICY_DETAIL(claim.policyId)} className="text-sm font-medium text-brand-secondary hover:underline">
                        {claim.policyNumber}
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Filed</p>
                      <p className="text-sm font-medium">{claim.filedDate}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-muted/50">
                  <p className="text-sm">{claim.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* AI Damage Assessment */}
            {claim.damageAssessment && (
              <AnimatePresence>
                {showAI ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          🤖 AI Damage Assessment
                          <Badge variant={
                            claim.damageAssessment.eligibility === "Eligible" ? "success" :
                            claim.damageAssessment.eligibility === "Not Eligible" ? "destructive" : "warning"
                          }>
                            {claim.damageAssessment.eligibility}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 mb-4">
                          {claim.damageAssessment.points.map((point, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <p className="text-sm font-medium">{point.area}</p>
                                <p className="text-xs text-muted-foreground">{point.description}</p>
                              </div>
                              <Badge variant={
                                point.severity === "Critical" ? "destructive" :
                                point.severity === "High" ? "destructive" :
                                point.severity === "Medium" ? "warning" : "success"
                              }>
                                {point.severity}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 p-3 rounded-lg bg-brand-warn/[0.08] text-brand-warn">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <p className="text-xs">This assessment is AI-generated and should be verified by a licensed surveyor. Confidence: {claim.damageAssessment.aiConfidence}%</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-brand-secondary" />
                        <p className="text-sm text-muted-foreground">Analyzing damage assessment...</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </AnimatePresence>
            )}

            {/* Amounts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Claim Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <p className="text-sm text-muted-foreground mb-1">Estimated Amount</p>
                    <p className="text-2xl font-bold text-brand-primary">
                      {claim.estimatedAmount ? `₹${claim.estimatedAmount.toLocaleString()}` : "Pending"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    {claim.actualAmount ? (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Actual Amount</p>
                        <p className="text-2xl font-bold text-brand-accent">₹{claim.actualAmount.toLocaleString()}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium mb-2">Enter Actual Amount</p>
                        <div className="flex gap-2">
                          <Input placeholder="₹0" value={actualAmount} onChange={(e) => setActualAmount(e.target.value)} />
                          <Button onClick={handleUpdateAmount} disabled={updateAmount.isPending}>Save</Button>
                        </div>
                        {amountError && <p className="text-sm text-destructive mt-1">{amountError}</p>}
                      </div>
                    )}
                  </div>
                </div>

                {claim.estimatedAmount && claim.actualAmount && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2">Comparison</p>
                    <div className="flex gap-2 items-center">
                      <div className="flex-1 h-4 rounded-full bg-brand-primary/20 overflow-hidden">
                        <div className="h-full bg-brand-primary rounded-full" style={{ width: "100%" }} />
                      </div>
                      <span className="text-xs w-24 text-right">Est: ₹{claim.estimatedAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2 items-center mt-1">
                      <div className="flex-1 h-4 rounded-full bg-brand-accent/20 overflow-hidden">
                        <div className="h-full bg-brand-accent rounded-full" style={{ width: `${(claim.actualAmount / claim.estimatedAmount) * 100}%` }} />
                      </div>
                      <span className="text-xs w-24 text-right">Act: ₹{claim.actualAmount.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Claim Status Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {(claim.status === "Rejected" ? ["Filed", "Under Review", "Rejected"] : statusSteps).map((s, i) => {
                    const currentIdx = getStepIndex(claim.status);
                    const isCompleted = i < currentIdx;
                    const isCurrent = i === currentIdx;
                    const isRejected = s === "Rejected";

                    return (
                      <motion.div
                        key={s}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 24, delay: i * 0.1 }}
                        className="flex items-start gap-4 pb-6 last:pb-0"
                      >
                        <div className="flex flex-col items-center">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            isRejected ? "bg-destructive text-white" :
                            isCompleted ? "bg-brand-accent text-white" :
                            isCurrent ? "bg-brand-primary text-white" : "bg-muted text-muted-foreground"
                          }`}>
                            {isRejected ? <XCircle className="h-4 w-4" /> :
                             isCompleted ? <CheckCircle className="h-4 w-4" /> :
                             isCurrent ? <Clock className="h-4 w-4" /> :
                             <div className="h-2 w-2 rounded-full bg-current" />}
                          </div>
                          {i < (claim.status === "Rejected" ? 2 : statusSteps.length - 1) && (
                            <div className={`w-0.5 h-8 ${isCompleted ? "bg-brand-accent" : "bg-muted"}`} />
                          )}
                        </div>
                        <div className="pt-1">
                          <p className={`text-sm font-medium ${isCurrent ? "text-brand-primary" : isCompleted ? "text-brand-accent" : "text-muted-foreground"}`}>
                            {s}
                          </p>
                          {isCurrent && <p className="text-xs text-muted-foreground mt-0.5">Current status</p>}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes ({claim.notes.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {claim.notes.map((note, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/50 text-sm">{note}</div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea placeholder="Add a note..." className="flex-1" />
                  <Button onClick={() => toast.success("Note added")}>Add</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <p className="text-center text-muted-foreground py-10">Claim not found</p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
