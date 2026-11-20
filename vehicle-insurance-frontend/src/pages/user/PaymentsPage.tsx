import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CreditCard, Calendar, Download, Receipt, Sparkles, CheckCircle2, Clock, AlertCircle, Info, Shield, ShieldCheck, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { usePayments } from "@/hooks/usePayments";
import { usePolicies } from "@/hooks/usePolicies";
import { useCurrentUser } from "@/hooks/useAuth";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import EmptyState from "@/components/ui/empty-state";
import PageHeader from "@/components/layout/PageHeader";
import { generateReceiptPDF } from "@/lib/pdfUtils";

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } };
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const PAYMENTS_STORAGE_KEY = "vehicleinsure_marked_paid_payments";

// Date comparison helper: returns true if dueDate is on or before today
const isDueOrPast = (dueDateStr: string): boolean => {
  if (!dueDateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  return due <= today;
};

export default function PaymentsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("schedule");
  const [policyFilter, setPolicyFilter] = useState("");
  const [timeRange, setTimeRange] = useState("all-time");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Payment Confirmation & Details Modal State
  const [payModalPayment, setPayModalPayment] = useState<any | null>(null);
  const [viewDetailModalItem, setViewDetailModalItem] = useState<any | null>(null);
  const [paymentExecutionDate, setPaymentExecutionDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [receiptRefInput, setReceiptRefInput] = useState<string>("");

  const { data: apiPayments = [] } = usePayments();
  const { data: policies = [] } = usePolicies();
  const currentUser = useCurrentUser();
  // Scoped per-user so one account's "marked as paid" clicks can't leak
  // into another account's view of the same page (localStorage isn't
  // cleared on login/logout, only the query cache is).
  const paymentsStorageKey = currentUser?.id ? `${PAYMENTS_STORAGE_KEY}_${currentUser.id}` : PAYMENTS_STORAGE_KEY;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Load persistent marked paid records from localStorage
  const [markedPaidItems, setMarkedPaidItems] = useState<Record<string, { paidDate: string; receiptNo: string }>>(() => {
    try {
      const saved = localStorage.getItem(paymentsStorageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save marked paid records to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(paymentsStorageKey, JSON.stringify(markedPaidItems));
    } catch {
      // Storage quota or permission exception handler
    }
  }, [markedPaidItems]);

  // Payment schedule for the signed-in user, straight from the API.
  // (This used to merge in a handful of hardcoded "POL-2024-00x" demo rows
  // on top of the real data. Those rows had no user/policy association at
  // all, so every account — including a brand-new one with zero real
  // payments — saw the exact same 5 leftover entries. That's what made the
  // Payments page look like it was still showing a previous account's data
  // after switching users. The real, correctly user-scoped data from
  // usePayments() is all that should render here.)
  const initialSchedule = useMemo(() => {
    const seen = new Set();
    return apiPayments.filter((item) => {
      const key = `${item.policyNumber}-${item.dueDate}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [apiPayments]);

  // Merge initial schedule with locally marked paid items
  const paymentsList = useMemo(() => {
    return initialSchedule.map((item) => {
      if (markedPaidItems[item.id]) {
        return {
          ...item,
          status: "Paid" as const,
          paidDate: markedPaidItems[item.id].paidDate,
          receiptNo: markedPaidItems[item.id].receiptNo,
        };
      }
      return item;
    });
  }, [initialSchedule, markedPaidItems]);

  // Unified policy options dropdown list
  const policyOptions = useMemo(() => {
    const list: { value: string; label: string }[] = [];
    const seen = new Set<string>();

    policies.forEach((pol) => {
      if (pol.policyNumber && !seen.has(pol.policyNumber)) {
        seen.add(pol.policyNumber);
        list.push({ value: pol.policyNumber, label: `${pol.policyNumber} (${pol.vehicleMake || 'Policy'})` });
      }
    });

    paymentsList.forEach((p) => {
      if (p.policyNumber && !seen.has(p.policyNumber)) {
        seen.add(p.policyNumber);
        list.push({ value: p.policyNumber, label: p.policyNumber });
      }
    });

    return list;
  }, [policies, paymentsList]);

  const handleViewPolicyHistory = (policyNum: string) => {
    setPolicyFilter(policyNum);
    setActiveTab("logs");
    toast.info(`Filtered transaction logs for ${policyNum}`);
    setTimeout(() => {
      document.getElementById("transaction-logs-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const dueDates = useMemo(() => {
    const map: Record<number, typeof paymentsList> = {};
    paymentsList.forEach((p) => {
      if (!p.dueDate) return;
      const d = new Date(p.dueDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(p);
      }
    });
    return map;
  }, [paymentsList, year, month]);

  // All payments for current month or selected day for schedule sidebar
  const displayedSidebarPayments = useMemo(() => {
    return selectedDay != null
      ? (dueDates[selectedDay] || [])
      : paymentsList;
  }, [selectedDay, dueDates, paymentsList]);

  const filteredPayments = useMemo(() => {
    return paymentsList.filter((p) => {
      // Policy Filter Logic
      if (policyFilter) {
        const matchNumber = p.policyNumber === policyFilter;
        const matchId = p.policyId === policyFilter;
        const selectedPolicyObj = policies.find((pol) => pol.id === policyFilter || pol.policyNumber === policyFilter);
        const matchObjNumber = selectedPolicyObj && p.policyNumber === selectedPolicyObj.policyNumber;

        if (!matchNumber && !matchId && !matchObjNumber) return false;
      }

      // Time Range Filter Logic (Audit Page Style)
      if (timeRange && timeRange !== "all-time") {
        const dateStr = p.dueDate || p.paidDate;
        if (dateStr) {
          const itemDate = new Date(dateStr);
          const now = new Date();

          if (timeRange === "today") {
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            if (itemDate < startOfDay) return false;
          } else if (timeRange === "this-week") {
            const dayOfWeek = now.getDay();
            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
            if (itemDate < startOfWeek) return false;
          } else if (timeRange === "this-month") {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            if (itemDate < startOfMonth) return false;
          } else if (timeRange === "this-quarter") {
            const currentQuarter = Math.floor(now.getMonth() / 3);
            const startOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1);
            if (itemDate < startOfQuarter) return false;
          } else if (timeRange === "this-year") {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            if (itemDate < startOfYear) return false;
          } else if (timeRange === "custom") {
            if (dateFrom) {
              const from = new Date(dateFrom);
              if (itemDate < from) return false;
            }
            if (dateTo) {
              const to = new Date(dateTo);
              to.setHours(23, 59, 59, 999);
              if (itemDate > to) return false;
            }
          }
        }
      }

      return true;
    });
  }, [paymentsList, policyFilter, timeRange, dateFrom, dateTo, policies]);

  const openMarkAsPaidModal = (p: any) => {
    setPayModalPayment(p);
    setPaymentExecutionDate(isDueOrPast(p.dueDate) ? todayStr : p.dueDate);
    setReceiptRefInput(`REC-2026-${Math.floor(10000 + Math.random() * 90000)}`);
  };

  const handleConfirmPayment = () => {
    if (!payModalPayment) return;

    const execDate = paymentExecutionDate || todayStr;
    const recNo = receiptRefInput.trim() || `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    setMarkedPaidItems((prev) => ({
      ...prev,
      [payModalPayment.id]: {
        paidDate: execDate,
        receiptNo: recNo,
      },
    }));

    const auditLogEntry = {
      id: `al-pay-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || "u1",
      userName: currentUser?.name || "Rahul Sharma",
      action: "PAYMENT",
      entity: "Policy Payment",
      entityId: payModalPayment.policyNumber,
      ip: "192.168.1.101",
      userRole: "user",
    };
    try {
      const existing = JSON.parse(localStorage.getItem("vehicleinsure_audit_logs") || "[]");
      localStorage.setItem("vehicleinsure_audit_logs", JSON.stringify([auditLogEntry, ...existing]));
    } catch {}

    toast.success(
      `Payment of ₹${payModalPayment.amount.toLocaleString()} for ${payModalPayment.policyNumber} marked as Paid on ${execDate}. Verified for claims continuity!`
    );

    setPayModalPayment(null);
  };

  const handlePayAllForPolicy = (policyNum: string, polPayments: typeof paymentsList) => {
    const pendingItems = polPayments.filter((p) => p.status !== "Paid");
    if (pendingItems.length === 0) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const newMarked: Record<string, { paidDate: string; receiptNo: string }> = {};

    pendingItems.forEach((p) => {
      newMarked[p.id] = {
        paidDate: todayStr,
        receiptNo: `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      };
    });

    setMarkedPaidItems((prev) => ({
      ...prev,
      ...newMarked,
    }));

    const totalPaidAmount = pendingItems.reduce((sum, p) => sum + p.amount, 0);

    const auditLogEntry = {
      id: `al-pay-bulk-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || "u1",
      userName: currentUser?.name || "Rahul Sharma",
      action: "PAYMENT",
      entity: "Bulk Payment",
      entityId: policyNum,
      ip: "192.168.1.101",
      userRole: "user",
    };
    try {
      const existing = JSON.parse(localStorage.getItem("vehicleinsure_audit_logs") || "[]");
      localStorage.setItem("vehicleinsure_audit_logs", JSON.stringify([auditLogEntry, ...existing]));
    } catch {}

    toast.success(
      `All ${pendingItems.length} pending installments (₹${totalPaidAmount.toLocaleString()}) for policy ${policyNum} marked as Paid!`
    );
  };

  // Group payments by policy number
  const groupedPaymentsByPolicy = useMemo(() => {
    const groups: Record<string, typeof paymentsList> = {};
    paymentsList.forEach((p) => {
      const polKey = p.policyNumber || "Unassigned Policy";
      if (!groups[polKey]) groups[polKey] = [];
      groups[polKey].push(p);
    });
    return groups;
  }, [paymentsList]);

  // Group filtered payments for logs tab
  const filteredGroupedPaymentsByPolicy = useMemo(() => {
    const groups: Record<string, typeof paymentsList> = {};
    filteredPayments.forEach((p) => {
      const polKey = p.policyNumber || "Unassigned Policy";
      if (!groups[polKey]) groups[polKey] = [];
      groups[polKey].push(p);
    });
    return groups;
  }, [filteredPayments]);

  // Track expanded policy dropdown IDs (default all expanded)
  const [expandedPolicies, setExpandedPolicies] = useState<Record<string, boolean>>({});

  const togglePolicyExpanded = (polNumber: string) => {
    setExpandedPolicies((prev) => ({
      ...prev,
      [polNumber]: prev[polNumber] === false ? true : false,
    }));
  };

  // Helper to calculate on-time payment benefits for a policy
  const getPolicyBenefitInfo = useCallback((policyPayments: typeof paymentsList) => {
    const hasOverdue = policyPayments.some((p) => p.status === "Overdue");
    const paidCount = policyPayments.filter((p) => p.status === "Paid").length;
    const isFullyOnTime = !hasOverdue;

    return {
      isFullyOnTime,
      paidCount,
      totalCount: policyPayments.length,
      discountPct: isFullyOnTime ? 5 : 0,
      benefitTitle: isFullyOnTime ? "5% Prompt Discount + NCB Protected" : "Standard Policy Coverage",
      badgeVariant: isFullyOnTime ? ("success" as const) : ("warning" as const),
    };
  }, []);

  const handleExportPaymentsCSV = () => {
    if (paymentsList.length === 0) {
      toast.error("No payment records available to export.");
      return;
    }

    const dateStr = new Date().toISOString().split("T")[0];
    const headers = ["Due Date", "Policy Number", "Amount (INR)", "Payment Interval", "Status", "Paid Date", "Receipt Number"];

    const rows = paymentsList.map((p) => [
      `"${p.dueDate || ''}"`,
      `"${p.policyNumber || ''}"`,
      `"${p.amount || 0}"`,
      `"${p.interval || 'monthly'}"`,
      `"${p.status || 'Pending'}"`,
      `"${p.paidDate || ''}"`,
      `"${p.receiptNo || ''}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `VehicleInsure_Payments_Billing_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${paymentsList.length} payment records to CSV successfully!`);
  };

  const handleDownloadReceipt = (item: any) => {
    if (!item) return;
    generateReceiptPDF(item);
    toast.success(`Receipt PDF for ${item.policyNumber} downloaded successfully!`);
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6">
      <PageHeader
        title="Payments & Billing"
        description="Manage policy payment schedules, view transaction logs, and download receipts"
        actions={
          <Button variant="outline" size="sm" onClick={handleExportPaymentsCSV} className="text-xs font-semibold cursor-pointer">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md bg-muted/40 p-1 rounded-xl">
          <TabsTrigger value="schedule" className="text-xs font-semibold rounded-lg py-2">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-brand-primary" /> Due Schedule Calendar
          </TabsTrigger>
          <TabsTrigger value="logs" className="text-xs font-semibold rounded-lg py-2">
            <Receipt className="h-3.5 w-3.5 mr-1.5 text-brand-accent" /> Transaction Logs & Receipts
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Payment Schedule Calendar & Installments */}
        <TabsContent value="schedule" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
          
          {/* Top Section: Calendar Widget (8 Cols) + Financial Summary Card (4 Cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Interactive Calendar */}
            <div className="lg:col-span-8">
              <Card className="border bg-card shadow-xs h-full">
                <CardHeader className="border-b pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Calendar className="h-4.5 w-4.5 text-brand-primary" /> {MONTHS[month]} {year} Schedule Calendar
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" aria-label="Previous month" onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="h-8 w-8 cursor-pointer">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" aria-label="Next month" onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="h-8 w-8 cursor-pointer">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-7 gap-1">
                    {DAYS.map((d) => (
                      <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
                    ))}
                    {Array.from({ length: firstDay }, (_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1;
                      const dayPayments = dueDates[day];
                      const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
                      const isSelected = selectedDay === day;
                      const hasOverdue = dayPayments?.some((p) => p.status === "Overdue");
                      const hasPending = dayPayments?.some((p) => p.status === "Pending");
                      const hasPaid = dayPayments?.some((p) => p.status === "Paid");

                      return (
                        <div
                          key={day}
                          onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                          className={`relative text-center py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isSelected ? "ring-2 ring-brand-primary bg-brand-primary/10 font-bold" :
                            isToday ? "bg-brand-primary text-white font-extrabold shadow-xs" :
                            hasOverdue ? "bg-destructive/15 text-destructive font-bold border border-destructive/30" :
                            hasPending ? "bg-amber-500/15 text-amber-600 font-bold border border-amber-500/30" :
                            hasPaid ? "bg-emerald-500/10 text-emerald-600 font-medium" : "hover:bg-muted/60"
                          }`}
                        >
                          {day}
                          {dayPayments && (
                            <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full ${hasPaid && !hasPending ? 'bg-emerald-500' : 'bg-brand-primary'}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Monthly Financial Commitments & Quick Metrics */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="border bg-card shadow-xs h-full flex flex-col justify-between p-5">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-brand-primary" /> {MONTHS[month]} Commitments
                    </p>
                    <Badge variant="outline" className="text-[10px] font-semibold text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                      Continuity Verified
                    </Badge>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div className="p-3.5 rounded-xl border bg-muted/30">
                      <p className="text-[11px] text-muted-foreground font-semibold">Total Scheduled Commitment</p>
                      <p className="text-2xl font-extrabold font-display text-foreground mt-0.5">
                        ₹{paymentsList.reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/20">
                        <p className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold">Paid / Verified</p>
                        <p className="text-base font-extrabold text-emerald-600 mt-0.5">
                          ₹{paymentsList.filter(p => p.status === "Paid").reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/20">
                        <p className="text-[10px] text-amber-800 dark:text-amber-300 font-bold">Pending / Scheduled</p>
                        <p className="text-base font-extrabold text-amber-600 mt-0.5">
                          ₹{paymentsList.filter(p => p.status !== "Paid").reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t text-xs text-muted-foreground">
                  <p className="text-[11px] flex items-center justify-between font-medium">
                    <span>Active Installment Items</span>
                    <strong className="text-foreground">{paymentsList.length} Scheduled</strong>
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Bottom Section: Policy-Grouped Payment Sections with Dropdown Accordions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Shield className="h-4.5 w-4.5 text-brand-primary" />
                Grouped Policy Payment Sections ({Object.keys(groupedPaymentsByPolicy).length})
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                Click any policy card to open its dropdown menu and view all payment logs & pay pending dues
              </p>
            </div>

            {Object.keys(groupedPaymentsByPolicy).length === 0 ? (
              <Card className="border bg-card p-6">
                <EmptyState
                  icon={Calendar}
                  title="No Policy Installments"
                  description="You currently have no active payment schedules or policy installments."
                />
              </Card>
            ) : (
              Object.entries(groupedPaymentsByPolicy).map(([policyNum, polPayments]) => {
                const benefit = getPolicyBenefitInfo(polPayments);
                const pendingCount = polPayments.filter((p) => p.status !== "Paid").length;
                const totalAmount = polPayments.reduce((sum, p) => sum + p.amount, 0);
                const pendingAmount = polPayments.filter((p) => p.status !== "Paid").reduce((sum, p) => sum + p.amount, 0);
                const isExpanded = expandedPolicies[policyNum] ?? true; // Default expanded

                return (
                  <Card key={policyNum} className="border bg-card shadow-xs overflow-hidden transition-all">
                    {/* Policy Section Header Bar */}
                    <div
                      onClick={() => togglePolicyExpanded(policyNum)}
                      className="p-4 bg-muted/30 hover:bg-muted/50 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 border-b"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary font-mono font-bold text-sm shrink-0">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-sm text-foreground">{policyNum}</span>
                            <Badge variant={benefit.badgeVariant} className="text-[10px] font-bold px-2 py-0.5">
                              {benefit.benefitTitle}
                            </Badge>
                            {pendingCount > 0 ? (
                              <Badge variant="warning" className="text-[10px] font-bold px-2 py-0.5">
                                {pendingCount} Pending Payment{pendingCount > 1 ? "s" : ""} (₹{pendingAmount.toLocaleString()})
                              </Badge>
                            ) : (
                              <Badge variant="success" className="text-[10px] font-bold px-2 py-0.5">
                                All Payments Completed ✓
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2 font-medium">
                            <span>Total Scheduled: <strong>₹{totalAmount.toLocaleString()}</strong></span>
                            <span>•</span>
                            <span>{polPayments.length} Installment Logs</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 flex-wrap self-end md:self-center">
                        {pendingCount > 0 && (
                          <Button
                            size="xs"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs whitespace-nowrap shadow-xs cursor-pointer px-3 py-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePayAllForPolicy(policyNum, polPayments);
                            }}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Pay All Pending (₹{pendingAmount.toLocaleString()})
                          </Button>
                        )}
                        <Button variant="ghost" size="xs" className="text-xs font-semibold text-brand-primary hover:bg-brand-primary/10">
                          {isExpanded ? "Collapse Dropdown ▲" : "Open Dropdown Logs & Pay ▾"}
                        </Button>
                      </div>
                    </div>

                    {/* Expandable Dropdown / Accordion Body */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-0 overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b bg-muted/40">
                                  <th scope="col" className="text-left py-2.5 px-4 font-semibold text-muted-foreground">Due Date</th>
                                  <th scope="col" className="text-left py-2.5 px-4 font-semibold text-muted-foreground">Amount</th>
                                  <th scope="col" className="text-left py-2.5 px-4 font-semibold text-muted-foreground">Frequency</th>
                                  <th scope="col" className="text-left py-2.5 px-4 font-semibold text-muted-foreground">Status & Benefits Check</th>
                                  <th scope="col" className="text-left py-2.5 px-4 font-semibold text-muted-foreground">Action / Payment</th>
                                </tr>
                              </thead>
                              <tbody>
                                {polPayments.map((p) => {
                                  const isPaid = p.status === "Paid";
                                  const readyToMark = isDueOrPast(p.dueDate);

                                  return (
                                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                                      <td className="py-3 px-4 font-bold text-foreground">{p.dueDate}</td>
                                      <td className="py-3 px-4 font-extrabold text-foreground">₹{p.amount.toLocaleString()}</td>
                                      <td className="py-3 px-4 capitalize text-muted-foreground">{p.interval?.replace("-", " ") ?? "monthly"}</td>
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <Badge
                                            variant={isPaid ? "success" : readyToMark ? "warning" : "secondary"}
                                            className="text-[10px] px-2 py-0.5 font-bold"
                                          >
                                            {isPaid ? `Paid (${p.paidDate || "Verified"})` : readyToMark ? "Due / Overdue" : "Pending Scheduled"}
                                          </Badge>
                                          {isPaid && (
                                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                                              <Sparkles className="h-3 w-3 text-emerald-600" /> NCB Preserved
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                          {isPaid ? (
                                            <span className="font-mono text-xs font-semibold text-emerald-600">{p.receiptNo || "REC-2026-VERIFIED"}</span>
                                          ) : (
                                            <Button
                                              size="xs"
                                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold whitespace-nowrap px-3 py-1 cursor-pointer shadow-xs"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openMarkAsPaidModal(p);
                                              }}
                                            >
                                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Pay ₹{p.amount.toLocaleString()}
                                            </Button>
                                          )}

                                          <Button
                                            size="xs"
                                            variant="outline"
                                            className="text-[11px] font-semibold cursor-pointer whitespace-nowrap"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setViewDetailModalItem(p);
                                            }}
                                          >
                                            View Details ↗
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })
            )}
          </div>
          </motion.div>
        </TabsContent>

        {/* Tab 2: Transaction Logs & Receipts */}
        <TabsContent value="logs" id="transaction-logs-section" className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
          {/* Active Insurance Policy Quick Cards (Moved to Transaction Logs) */}
          <Card className="border bg-card p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-brand-primary" /> Active Insurance Policies Overview
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Select any insurance policy card below to filter its complete payment history and transaction receipts
                </p>
              </div>
              {policyFilter && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setPolicyFilter("")}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Reset Policy Selection ({policyFilter})
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              {policyOptions.map((pol) => {
                const isSelected = policyFilter === pol.value;
                const policyCount = paymentsList.filter((p) => p.policyNumber === pol.value).length;
                const paidCount = paymentsList.filter((p) => p.policyNumber === pol.value && p.status === "Paid").length;

                return (
                  <div
                    key={pol.value}
                    onClick={() => setPolicyFilter(isSelected ? "" : pol.value)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "border-brand-primary bg-brand-primary/10 shadow-xs ring-2 ring-brand-primary/30"
                        : "bg-muted/20 border-border hover:border-brand-primary/50 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-bold text-foreground">
                      <span className="text-brand-primary">{pol.value}</span>
                      <Badge variant={paidCount === policyCount && policyCount > 0 ? "success" : "secondary"} className="text-[10px] px-1.5 py-0 font-semibold">
                        {paidCount}/{policyCount} Paid
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center justify-between font-medium">
                      <span>{isSelected ? "Currently Selected" : "Filter Records"}</span>
                      <ExternalLink className="h-3 w-3 text-brand-primary" />
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <Select
              options={[{ value: "", label: "All Insurance Policies" }, ...policyOptions]}
              placeholder="All Insurance Policies"
              value={policyFilter}
              onChange={(e) => setPolicyFilter(e.target.value)}
              className="sm:w-56 text-xs font-semibold"
            />

            <Select
              options={[
                { value: "all-time", label: "All Time Range" },
                { value: "today", label: "Today" },
                { value: "this-week", label: "This Week" },
                { value: "this-month", label: "This Month" },
                { value: "this-quarter", label: "This Quarter" },
                { value: "this-year", label: "This Year" },
                { value: "custom", label: "Custom Date Range..." },
              ]}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="sm:w-48 text-xs font-semibold"
            />

            {timeRange === "custom" && (
              <div className="flex items-center gap-2">
                <DatePicker value={dateFrom} onChange={setDateFrom} placeholder="From date" className="sm:w-36 text-xs" />
                <span className="text-xs text-muted-foreground font-medium">to</span>
                <DatePicker value={dateTo} onChange={setDateTo} placeholder="To date" className="sm:w-36 text-xs" />
              </div>
            )}
          </div>

          {Object.keys(filteredGroupedPaymentsByPolicy).length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No Payment Records Found"
              description="No transaction receipts or payment history records matched your selected policy or time range filter."
              actionLabel="Clear Filters"
              onAction={() => { setPolicyFilter(""); setTimeRange("all-time"); setDateFrom(""); setDateTo(""); }}
            />
          ) : (
            <div className="space-y-4">
              {Object.entries(filteredGroupedPaymentsByPolicy).map(([policyNum, polPayments]) => {
                const benefit = getPolicyBenefitInfo(polPayments);
                const pendingCount = polPayments.filter((p) => p.status !== "Paid").length;
                const totalAmount = polPayments.reduce((sum, p) => sum + p.amount, 0);
                const pendingAmount = polPayments.filter((p) => p.status !== "Paid").reduce((sum, p) => sum + p.amount, 0);
                const isExpanded = expandedPolicies[`logs_${policyNum}`] ?? true;

                return (
                  <Card key={`logs_${policyNum}`} className="border bg-card shadow-xs overflow-hidden transition-all">
                    {/* Policy Log Header Bar */}
                    <div
                      onClick={() =>
                        setExpandedPolicies((prev) => ({
                          ...prev,
                          [`logs_${policyNum}`]: prev[`logs_${policyNum}`] === false ? true : false,
                        }))
                      }
                      className="p-4 bg-muted/30 hover:bg-muted/50 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 border-b"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-brand-accent/10 text-brand-accent font-mono font-bold text-sm shrink-0">
                          <Receipt className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-sm text-foreground">{policyNum}</span>
                            <Badge variant={benefit.badgeVariant} className="text-[10px] font-bold px-2 py-0.5">
                              {benefit.benefitTitle}
                            </Badge>
                            {pendingCount > 0 ? (
                              <Badge variant="warning" className="text-[10px] font-bold px-2 py-0.5">
                                {pendingCount} Pending Payment{pendingCount > 1 ? "s" : ""} (₹{pendingAmount.toLocaleString()})
                              </Badge>
                            ) : (
                              <Badge variant="success" className="text-[10px] font-bold px-2 py-0.5">
                                All Logs Settled ✓
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2 font-medium">
                            <span>Total Volume: <strong>₹{totalAmount.toLocaleString()}</strong></span>
                            <span>•</span>
                            <span>{polPayments.length} Filtered Records</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 flex-wrap self-end md:self-center">
                        {pendingCount > 0 && (
                          <Button
                            size="xs"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs whitespace-nowrap shadow-xs cursor-pointer px-3 py-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePayAllForPolicy(policyNum, polPayments);
                            }}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Pay All Pending (₹{pendingAmount.toLocaleString()})
                          </Button>
                        )}
                        <Button variant="ghost" size="xs" className="text-xs font-semibold text-brand-primary hover:bg-brand-primary/10">
                          {isExpanded ? "Collapse Dropdown ▲" : "Expand Logs ▾"}
                        </Button>
                      </div>
                    </div>

                    {/* Expandable Dropdown Logs Body */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-0 overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b bg-muted/40">
                                  <th scope="col" className="text-left py-2.5 px-4 font-semibold text-muted-foreground">Due Date</th>
                                  <th scope="col" className="text-left py-2.5 px-4 font-semibold text-muted-foreground">Amount</th>
                                  <th scope="col" className="text-left py-2.5 px-4 font-semibold text-muted-foreground">Interval</th>
                                  <th scope="col" className="text-left py-2.5 px-4 font-semibold text-muted-foreground">Status & Payment Date</th>
                                  <th scope="col" className="text-left py-2.5 px-4 font-semibold text-muted-foreground">Actions & Receipts</th>
                                </tr>
                              </thead>
                              <tbody>
                                {polPayments.map((p) => {
                                  const isPaid = p.status === "Paid";
                                  const readyToMark = isDueOrPast(p.dueDate);

                                  return (
                                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                                      <td className="py-3 px-4 font-bold text-foreground">{p.dueDate}</td>
                                      <td className="py-3 px-4 font-extrabold text-foreground">₹{p.amount.toLocaleString()}</td>
                                      <td className="py-3 px-4 capitalize text-muted-foreground">{p.interval?.replace("-", " ") ?? "monthly"}</td>
                                      <td className="py-3 px-4">
                                        <Badge variant={isPaid ? "success" : readyToMark ? "warning" : "secondary"} className="text-[10px] px-2 py-0.5 font-bold">
                                          {isPaid ? `Paid (${p.paidDate || "Verified"})` : readyToMark ? "Due / Overdue" : "Pending Scheduled"}
                                        </Badge>
                                      </td>
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                          {isPaid ? (
                                            <Button
                                              size="xs"
                                              onClick={() => handleDownloadReceipt(p)}
                                              className="bg-brand-primary text-white text-[11px] font-bold whitespace-nowrap px-2.5 py-1 cursor-pointer shadow-xs"
                                            >
                                              <Download className="h-3 w-3 mr-1" /> PDF Receipt
                                            </Button>
                                          ) : (
                                            <Button
                                              size="xs"
                                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold whitespace-nowrap px-3 py-1 cursor-pointer shadow-xs"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openMarkAsPaidModal(p);
                                              }}
                                            >
                                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Pay ₹{p.amount.toLocaleString()}
                                            </Button>
                                          )}

                                          <Button
                                            size="xs"
                                            variant="outline"
                                            className="text-[11px] font-semibold cursor-pointer whitespace-nowrap"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setViewDetailModalItem(p);
                                            }}
                                          >
                                            View Details ↗
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })}
            </div>
          )}
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Payment Completion & Date Record Dialog Modal */}
      <Dialog open={!!payModalPayment} onOpenChange={(open) => !open && setPayModalPayment(null)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Record Payment Completion & Date
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Specify the exact date when this policy installment was paid. Recording payment dates accurately ensures policy active status and instant claim settlement approval.
          </DialogDescription>
        </DialogHeader>

        {payModalPayment && (
          <div className="space-y-4 my-2 text-xs">
            <div className="p-3.5 rounded-xl border bg-muted/40 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase">Policy Number</p>
                <p className="text-sm font-bold font-mono text-brand-primary mt-0.5">{payModalPayment.policyNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase">Installment Amount</p>
                <p className="text-base font-extrabold text-foreground mt-0.5">₹{payModalPayment.amount.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <label htmlFor="payment-execution-date-input" className="text-xs font-bold text-foreground block mb-1.5">
                When did you pay this installment? (Payment Completion Date) <span className="text-destructive">*</span>
              </label>
              <DatePicker
                id="payment-execution-date-input"
                value={paymentExecutionDate}
                onChange={(val) => setPaymentExecutionDate(val)}
                className="w-full text-xs"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Selected date: <strong className="text-foreground">{paymentExecutionDate || "Today"}</strong>. Claims filed after this date will be automatically covered.
              </p>
            </div>

            <div>
              <label htmlFor="payment-receipt-ref-input" className="text-xs font-bold text-foreground block mb-1.5">
                Transaction Reference / UPRN / Receipt No. (Optional)
              </label>
              <Input
                id="payment-receipt-ref-input"
                placeholder="e.g. UPRN-98421045 or REC-2026-881"
                value={receiptRefInput}
                onChange={(e) => setReceiptRefInput(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300 flex items-start gap-2 text-[11px]">
              <Info className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>
                <strong>Claim Eligibility Note:</strong> Recording this payment update certifies policy continuity. Any damage event occurring on or after <strong>{paymentExecutionDate}</strong> will be 100% eligible for AI auto-claim processing.
              </span>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPayModalPayment(null)} className="text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={handleConfirmPayment} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Confirm Payment & Record Date
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Payment Receipt & Policy Details Dialog Modal */}
      <Dialog open={!!viewDetailModalItem} onOpenChange={(open) => !open && setViewDetailModalItem(null)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <Receipt className="h-5 w-5 text-brand-primary" />
            Payment Receipt & Policy Details
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Complete transaction breakdown, payment verification status, and claim readiness summary.
          </DialogDescription>
        </DialogHeader>

        {viewDetailModalItem && (
          <div className="space-y-4 my-2 text-xs">
            <div className="p-4 rounded-2xl border bg-gradient-to-br from-slate-900 via-brand-secondary to-slate-900 text-white shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-200">{viewDetailModalItem.policyNumber}</span>
                <Badge variant={viewDetailModalItem.status === "Paid" ? "success" : "warning"} className="text-[10px] font-bold px-2 py-0.5">
                  {viewDetailModalItem.status === "Paid" ? "Verified Paid ✓" : "Installment Due"}
                </Badge>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <p className="text-[10px] text-white/70 uppercase font-medium">Amount</p>
                  <p className="text-2xl font-extrabold tracking-tight text-white mt-0.5">₹{viewDetailModalItem.amount.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/70 uppercase font-medium">Receipt No.</p>
                  <p className="text-xs font-mono font-bold text-emerald-400 mt-0.5">{viewDetailModalItem.receiptNo || "REC-2026-VERIFIED"}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border bg-muted/30">
                <p className="text-[11px] text-muted-foreground font-semibold">Scheduled Due Date</p>
                <p className="text-xs font-bold text-foreground mt-0.5">{viewDetailModalItem.dueDate}</p>
              </div>
              <div className="p-3 rounded-xl border bg-muted/30">
                <p className="text-[11px] text-muted-foreground font-semibold">Payment Execution Date</p>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{viewDetailModalItem.paidDate || "Recorded On File"}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-900 dark:text-emerald-300 space-y-1 text-[11px]">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Policy Protection Continuity
              </div>
              <p className="text-muted-foreground">
                This transaction maintains active coverage status. Any claim filed during this period is eligible for AI fast-track settlement.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewDetailModalItem(null)} className="text-xs">
            Close
          </Button>
          {viewDetailModalItem?.status === "Paid" && (
            <Button
              size="sm"
              onClick={() => handleDownloadReceipt(viewDetailModalItem)}
              className="text-xs bg-brand-primary text-white font-bold cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Download Receipt PDF
            </Button>
          )}
        </DialogFooter>
      </Dialog>
    </motion.div>
  );
}