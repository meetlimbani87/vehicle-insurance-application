import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockPayments } from "@/mock/mockPayments";
import { mockPolicies } from "@/mock/mockPolicies";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

export default function PaymentLogsPage() {
  const [policyFilter, setPolicyFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredPayments = mockPayments.filter((p) => {
    if (policyFilter && p.policyId !== policyFilter) return false;
    if (dateFrom && p.dueDate < dateFrom) return false;
    if (dateTo && p.dueDate > dateTo) return false;
    return true;
  });

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <PageHeader
        title="Payment Logs"
        description="View all payment transactions"
        actions={
          <Button variant="outline" onClick={() => toast.info("CSV export coming soon")}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Select
          options={mockPolicies.map((p) => ({ value: p.id, label: p.policyNumber }))}
          placeholder="All Policies"
          value={policyFilter}
          onChange={(e) => setPolicyFilter(e.target.value)}
          className="sm:w-48"
        />
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="sm:w-40" />
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="sm:w-40" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">Policy</th>
                  <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                  <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-3 px-4">{p.dueDate}</td>
                    <td className="py-3 px-4 font-medium">{p.policyNumber}</td>
                    <td className="py-3 px-4">₹{p.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge variant={p.status === "Paid" ? "success" : p.status === "Pending" ? "warning" : "destructive"}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{p.receiptNo || "—"}</td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">No payment records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
