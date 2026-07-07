import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, CheckCircle, XCircle, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useClaims, useUpdateClaimStatus } from "@/hooks/useClaims";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { Link } from "react-router";

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

export default function AdminClaimsPage() {
  const { data: claims, isLoading } = useClaims();
  const updateStatus = useUpdateClaimStatus();
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [actionDialog, setActionDialog] = useState<{ id: string; action: "Approved" | "Rejected" } | null>(null);

  const filtered = (claims ?? []).filter((c) => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!c.claimNumber.toLowerCase().includes(s) && !c.vehicleMake.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Manage Claims</h1>
        <p className="text-muted-foreground">Review and process insurance claims</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search claims..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select
          options={[
            { value: "Filed", label: "Filed" },
            { value: "Under Review", label: "Under Review" },
            { value: "Approved", label: "Approved" },
            { value: "Rejected", label: "Rejected" },
            { value: "Closed", label: "Closed" },
          ]}
          placeholder="All Statuses"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-48"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Claim #</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Vehicle</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Policy</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estimated</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actual</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium">{c.claimNumber}</td>
                      <td className="py-3 px-4">{c.vehicleMake} {c.vehicleModel}</td>
                      <td className="py-3 px-4 hidden md:table-cell">{c.policyNumber}</td>
                      <td className="py-3 px-4 hidden lg:table-cell">{c.accidentDate}</td>
                      <td className="py-3 px-4">{c.estimatedAmount ? `₹${c.estimatedAmount.toLocaleString()}` : "—"}</td>
                      <td className="py-3 px-4">{c.actualAmount ? `₹${c.actualAmount.toLocaleString()}` : "—"}</td>
                      <td className="py-3 px-4">
                        <Badge variant={c.status === "Approved" ? "success" : c.status === "Rejected" ? "destructive" : c.status === "Closed" ? "secondary" : "warning"}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <Link to={ROUTES.CLAIM_DETAIL(c.id)}>
                            <Button variant="ghost" size="icon" title="View"><Eye className="h-4 w-4" /></Button>
                          </Link>
                          {(c.status === "Filed" || c.status === "Under Review") && (
                            <>
                              <Button variant="ghost" size="icon" title="Approve" onClick={() => setActionDialog({ id: c.id, action: "Approved" })}>
                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Reject" onClick={() => setActionDialog({ id: c.id, action: "Rejected" })}>
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">No claims found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogHeader>
          <DialogTitle>{actionDialog?.action === "Approved" ? "Approve Claim" : "Reject Claim"}</DialogTitle>
          <DialogDescription>
            Are you sure you want to {actionDialog?.action === "Approved" ? "approve" : "reject"} this claim? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setActionDialog(null)}>Cancel</Button>
          <Button
            variant={actionDialog?.action === "Rejected" ? "destructive" : "default"}
            onClick={() => {
              if (actionDialog) {
                updateStatus.mutate({ id: actionDialog.id, status: actionDialog.action });
                setActionDialog(null);
              }
            }}
          >
            {actionDialog?.action === "Approved" ? "Approve" : "Reject"}
          </Button>
        </DialogFooter>
      </Dialog>
    </motion.div>
  );
}
