import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Receipt, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePayments } from "@/hooks/usePayments";
import { usePolicies } from "@/hooks/usePolicies";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import PageHeader from "@/components/layout/PageHeader";
import { generateReceiptPDF } from "@/lib/pdfUtils";

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

export default function PaymentLogsPage() {
  const [policyFilter, setPolicyFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { data: payments = [] } = usePayments();
  const { data: policies = [] } = usePolicies();

  const filteredPayments = payments.filter((p) => {
    if (policyFilter && p.policyId !== policyFilter) return false;
    if (dateFrom && p.dueDate < dateFrom) return false;
    if (dateTo && p.dueDate > dateTo) return false;
    return true;
  });

  const handleExportCSV = () => {
    if (filteredPayments.length === 0) {
      toast.error("No payment records to export.");
      return;
    }

    const dateStr = new Date().toISOString().split("T")[0];
    const headers = ["Date", "Policy Number", "Amount (INR)", "Interval", "Status", "Receipt Number"];
    const rows = filteredPayments.map((p) => [
      `"${p.dueDate || ''}"`,
      `"${p.policyNumber || ''}"`,
      `"${p.amount || 0}"`,
      `"${p.interval || ''}"`,
      `"${p.status || ''}"`,
      `"${p.receiptNo || ''}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Payment_Logs_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${filteredPayments.length} payment logs to CSV successfully!`);
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <PageHeader
        title="Payment Logs"
        description="View all payment transactions"
        actions={
          <Button variant="outline" onClick={handleExportCSV} className="cursor-pointer">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Select
          options={policies.map((p) => ({ value: p.id, label: p.policyNumber }))}
          placeholder="All Policies"
          value={policyFilter}
          onChange={(e) => setPolicyFilter(e.target.value)}
          className="sm:w-48"
        />
        <DatePicker value={dateFrom} onChange={setDateFrom} placeholder="From date" className="sm:w-40" />
        <DatePicker value={dateTo} onChange={setDateTo} placeholder="To date" className="sm:w-40" />
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
                  <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">Interval</th>
                  <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">Receipt / Download</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-3 px-4">{p.dueDate}</td>
                    <td className="py-3 px-4 font-medium">{p.policyNumber}</td>
                    <td className="py-3 px-4">₹{p.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 capitalize text-muted-foreground">{p.interval?.replace("-", " ") ?? "—"}</td>
                    <td className="py-3 px-4">
                      <Badge variant={p.status === "Paid" ? "success" : p.status === "Pending" ? "warning" : "destructive"}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {p.status === "Paid" ? (
                        <button
                          onClick={() => {
                            generateReceiptPDF(p);
                            toast.success(`Downloaded Receipt PDF for ${p.policyNumber}`);
                          }}
                          className="font-mono text-xs text-emerald-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <Receipt className="h-3.5 w-3.5" /> {p.receiptNo || "REC-VERIFIED"}
                        </button>
                      ) : (
                        <span className="text-muted-foreground text-xs">{p.receiptNo || "—"}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">No payment records found</td>
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
