import { useParams, Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Car, Building, Calendar, Clock, FileText, CreditCard, AlertCircle, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { usePolicy } from "@/hooks/usePolicies";
import { useClaims } from "@/hooks/useClaims";
import { mockPayments } from "@/mock/mockPayments";
import { ROUTES } from "@/constants/routes";
import { useState } from "react";
import { toast } from "sonner";

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function PolicyDetailPage() {
  const { id } = useParams();
  const { data: policy, isLoading } = usePolicy(id);
  const { data: claims } = useClaims();
  const [notes, setNotes] = useState("");
  const linkedClaims = claims?.filter((c) => c.policyId === id) ?? [];
  const payments = mockPayments.filter((p) => p.policyId === id);

  const getDaysRemaining = () => {
    if (!policy) return 0;
    const end = new Date(policy.endDate);
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysRemaining();
  const expiryColor = daysRemaining > 90 ? "text-emerald-600" : daysRemaining > 30 ? "text-amber-600" : "text-destructive";

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="skeleton" exit={{ opacity: 0 }} className="space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </motion.div>
        ) : policy ? (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Header */}
            <Card>
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                      <Shield className="h-7 w-7 text-brand-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-xl font-bold">{policy.policyNumber}</h1>
                        <Badge variant={policy.status === "Active" ? "success" : policy.status === "Expired" ? "destructive" : "secondary"}>
                          {policy.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{policy.insuranceCompany} • {policy.coverageType}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`${ROUTES.CLAIM_CREATE}?policyId=${policy.id}`}>
                      <Button>
                        <AlertCircle className="h-4 w-4 mr-2" /> File a Claim
                      </Button>
                    </Link>
                  </div>
                </div>

                <Separator className="my-5" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <InfoItem icon={Car} label="Vehicle" value={`${policy.vehicleMake} ${policy.vehicleModel} (${policy.vehicleYear})`} />
                  <InfoItem icon={FileText} label="Registration" value={policy.registrationNo} />
                  <InfoItem icon={Calendar} label="Period" value={`${policy.startDate} → ${policy.endDate}`} />
                  <InfoItem icon={CreditCard} label="Premium" value={`₹${policy.premiumAmount.toLocaleString()}`} />
                </div>

                <div className="mt-4 p-3 rounded-lg bg-muted/50 flex items-center gap-2">
                  <Clock className={`h-5 w-5 ${expiryColor}`} />
                  <span className={`text-sm font-medium ${expiryColor}`}>
                    {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Policy expired"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No payment records</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Date</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Amount</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Receipt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p) => (
                          <tr key={p.id} className="border-b last:border-0">
                            <td className="py-3 px-2">{p.dueDate}</td>
                            <td className="py-3 px-2">₹{p.amount.toLocaleString()}</td>
                            <td className="py-3 px-2">
                              <Badge variant={p.status === "Paid" ? "success" : p.status === "Pending" ? "warning" : "destructive"}>
                                {p.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-2">{p.receiptNo || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea placeholder="Add notes about this policy..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                <Button className="mt-3" size="sm" onClick={() => { toast.success("Notes saved"); }}>Save Notes</Button>
              </CardContent>
            </Card>

            {/* Linked Claims */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Linked Claims ({linkedClaims.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {linkedClaims.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No claims filed for this policy</p>
                ) : (
                  <div className="space-y-3">
                    {linkedClaims.map((c) => (
                      <Link key={c.id} to={ROUTES.CLAIM_DETAIL(c.id)}>
                        <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <FileText className="h-5 w-5 text-brand-secondary" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{c.claimNumber}</p>
                            <p className="text-xs text-muted-foreground">{c.accidentDate} • {c.location}</p>
                          </div>
                          <Badge variant={c.status === "Approved" ? "success" : c.status === "Rejected" ? "destructive" : "warning"}>
                            {c.status}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <p className="text-center text-muted-foreground py-10">Policy not found</p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
