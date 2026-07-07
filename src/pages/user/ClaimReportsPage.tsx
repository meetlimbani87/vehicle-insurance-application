import { useState } from "react";
import { motion } from "framer-motion";
import { FileDown, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useClaims } from "@/hooks/useClaims";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } };
const container = { animate: { transition: { staggerChildren: 0.07 } } };
const item = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

export default function ClaimReportsPage() {
  const { data: claims, isLoading } = useClaims();
  const [previewClaim, setPreviewClaim] = useState<string | null>(null);
  const selectedClaim = claims?.find((c) => c.id === previewClaim);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Claim Reports</h1>
        <p className="text-muted-foreground">View and download claim reports</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : (
        <motion.div variants={container} initial="initial" animate="animate" className="space-y-3">
          {claims?.filter((c) => c.status !== "Filed").map((claim) => (
            <motion.div key={claim.id} variants={item}>
              <Card>
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">Report #{claim.claimNumber}</p>
                      <Badge variant={claim.status === "Approved" ? "success" : claim.status === "Rejected" ? "destructive" : "secondary"}>
                        {claim.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{claim.vehicleMake} {claim.vehicleModel} • Filed: {claim.filedDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPreviewClaim(claim.id)}>
                      <Eye className="h-4 w-4 mr-1" /> Preview
                    </Button>
                    <Button size="sm" onClick={() => toast.info("PDF download coming soon")}>
                      <FileDown className="h-4 w-4 mr-1" /> Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Dialog open={!!previewClaim} onOpenChange={() => setPreviewClaim(null)}>
        <DialogHeader>
          <DialogTitle>Report Preview — {selectedClaim?.claimNumber}</DialogTitle>
          <DialogDescription>Summary of the claim report</DialogDescription>
        </DialogHeader>
        {selectedClaim && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg">
              <div><span className="text-muted-foreground">Claim:</span> {selectedClaim.claimNumber}</div>
              <div><span className="text-muted-foreground">Status:</span> {selectedClaim.status}</div>
              <div><span className="text-muted-foreground">Vehicle:</span> {selectedClaim.vehicleMake} {selectedClaim.vehicleModel}</div>
              <div><span className="text-muted-foreground">Date:</span> {selectedClaim.accidentDate}</div>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-muted-foreground mb-1">Description</p>
              <p>{selectedClaim.description}</p>
            </div>
            {selectedClaim.estimatedAmount && (
              <div className="p-3 border rounded-lg">
                <p className="text-muted-foreground mb-1">Financial</p>
                <p>Estimated: ₹{selectedClaim.estimatedAmount.toLocaleString()}</p>
                {selectedClaim.actualAmount && <p>Actual: ₹{selectedClaim.actualAmount.toLocaleString()}</p>}
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setPreviewClaim(null)}>Close</Button>
          <Button onClick={() => toast.info("PDF download coming soon")}>
            <FileDown className="h-4 w-4 mr-1" /> Download PDF
          </Button>
        </DialogFooter>
      </Dialog>
    </motion.div>
  );
}
