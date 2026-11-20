import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Download, Search, ArrowUp, ArrowDown, ArrowUpDown, Shield, Users, Calendar, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { mockAuditLogs } from "@/mock/mockAuditLogs";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

const actionColors: Record<string, string> = {
  CREATE: "success", APPROVE: "success", UPDATE: "warning", REJECT: "destructive",
  SUSPEND: "destructive", CLOSE: "secondary", PAYMENT: "success", LOGIN: "secondary",
  UPLOAD: "warning",
};

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [timeRange, setTimeRange] = useState("all-time");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [sortField, setSortField] = useState<"timestamp" | "userName" | "action" | null>("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data: apiLogs, isLoading } = useAuditLogs();

  const logs = useMemo(() => {
    let localEntries: any[] = [];
    try {
      const saved = localStorage.getItem("vehicleinsure_audit_logs");
      if (saved) localEntries = JSON.parse(saved);
    } catch {}

    const backendLogs = Array.isArray(apiLogs) && apiLogs.length > 0 ? apiLogs : [];
    const sourceMock = mockAuditLogs || [];

    // Deduplicate entries by ID
    const seen = new Set();
    const combined = [...localEntries, ...backendLogs, ...sourceMock].filter((log) => {
      const key = `${log.id}-${log.timestamp}-${log.action}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return combined;
  }, [apiLogs]);

  const toggleSort = (field: "timestamp" | "userName" | "action") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortOrder(field === "timestamp" ? "desc" : "asc");
    }
  };

  const filtered = logs.filter((log) => {
    if (actionFilter && log.action !== actionFilter) return false;
    
    if (userRoleFilter) {
      const isSystemAdmin = (log as any).userRole === "admin" || log.userName.toLowerCase().includes("admin");
      if (userRoleFilter === "admin" && !isSystemAdmin) return false;
      if (userRoleFilter === "user" && isSystemAdmin) return false;
    }

    if (search) {
      const s = search.toLowerCase();
      if (
        !log.userName.toLowerCase().includes(s) &&
        !log.entity.toLowerCase().includes(s) &&
        !(log.id || "").toLowerCase().includes(s) &&
        !(log.action || "").toLowerCase().includes(s)
      ) return false;
    }

    // Time Range Filtering Logic
    if (timeRange && timeRange !== "all-time" && log.timestamp) {
      const logDate = new Date(log.timestamp);
      const now = new Date();

      if (timeRange === "today") {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (logDate < startOfDay) return false;
      } else if (timeRange === "this-week") {
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        if (logDate < startOfWeek) return false;
      } else if (timeRange === "this-month") {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        if (logDate < startOfMonth) return false;
      } else if (timeRange === "this-quarter") {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const startOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1);
        if (logDate < startOfQuarter) return false;
      } else if (timeRange === "this-year") {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        if (logDate < startOfYear) return false;
      } else if (timeRange === "custom") {
        if (dateFrom) {
          const from = new Date(dateFrom);
          if (logDate < from) return false;
        }
        if (dateTo) {
          const to = new Date(dateTo);
          to.setHours(23, 59, 59, 999);
          if (logDate > to) return false;
        }
      }
    }

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0;

    if (sortField === "timestamp") {
      const tA = new Date(a.timestamp).getTime();
      const tB = new Date(b.timestamp).getTime();
      return sortOrder === "asc" ? tA - tB : tB - tA;
    }

    if (sortField === "userName") {
      return sortOrder === "asc" ? a.userName.localeCompare(b.userName) : b.userName.localeCompare(a.userName);
    }

    if (sortField === "action") {
      return sortOrder === "asc" ? a.action.localeCompare(b.action) : b.action.localeCompare(a.action);
    }

    return 0;
  });

  const uniqueActions = [...new Set(logs.map((l) => l.action))];

  const handleExportCSV = () => {
    if (sorted.length === 0) {
      toast.error("No audit logs available to export.");
      return;
    }

    const headers = ["ID", "Timestamp", "User / Actor", "Action", "Entity", "Entity ID", "IP Address"];
    const csvRows = sorted.map((log) => [
      `"${log.id || ''}"`,
      `"${new Date(log.timestamp).toLocaleString()}"`,
      `"${(log.userName || '').replace(/"/g, '""')}"`,
      `"${(log.action || '').replace(/"/g, '""')}"`,
      `"${(log.entity || '').replace(/"/g, '""')}"`,
      `"${(log.entityId || '').replace(/"/g, '""')}"`,
      `"${(log.ip || '').replace(/"/g, '""')}"`,
    ].join(","));

    const csvData = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob(["\uFEFF" + csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `audit_logs_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Successfully exported ${sorted.length} audit log entries to CSV!`);
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-5 max-w-6xl mx-auto pb-12">
      <PageHeader
        title="Audit Logs"
        description="Track all system activities, security events, and administrative decisions"
        actions={
          <div className="flex items-center gap-2">
            <Select
              options={[
                { value: "all-time", label: "All Time" },
                { value: "today", label: "Today (Day)" },
                { value: "this-week", label: "This Week" },
                { value: "this-month", label: "This Month" },
                { value: "this-quarter", label: "This Quarter" },
                { value: "this-year", label: "This Year" },
                { value: "custom", label: "Custom Date Range..." },
              ]}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-44 text-xs bg-background"
            />
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs">
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
            </Button>
          </div>
        }
      />

      {/* Conditional Custom Date Range Bar */}
      {timeRange === "custom" && (
        <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-xl border border-border w-fit text-xs shadow-2xs">
          <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-brand-primary" /> Specific Range:
          </span>
          <DatePicker value={dateFrom} onChange={setDateFrom} placeholder="Start Date" className="w-36 text-xs bg-background" />
          <span className="text-muted-foreground font-medium">to</span>
          <DatePicker value={dateTo} onChange={setDateTo} placeholder="End Date" className="w-36 text-xs bg-background" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search logs by user, entity, or ID..." className="pl-9 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* User Category Filter */}
        <Select
          options={[
            { value: "", label: "All User Logs" },
            { value: "user", label: "Customer Logs" },
            { value: "admin", label: "Admin System Logs" },
          ]}
          placeholder="All User Logs"
          value={userRoleFilter}
          onChange={(e) => setUserRoleFilter(e.target.value)}
          className="sm:w-48 text-xs bg-background"
        />

        {/* Action Type Filter */}
        <Select
          options={[{ value: "", label: "All Actions" }, ...uniqueActions.map((a) => ({ value: a, label: a }))]}
          placeholder="All Actions"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="sm:w-44 text-xs bg-background"
        />
      </div>

      <Card className="border bg-card shadow-xs">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground uppercase font-bold text-[11px]">
                  
                  {/* Sortable Timestamp */}
                  <th scope="col" className="text-left py-3 px-4">
                    <button
                      onClick={() => toggleSort("timestamp")}
                      className="flex items-center gap-1.5 font-bold uppercase hover:text-foreground transition-colors cursor-pointer"
                    >
                      <span>Timestamp</span>
                      {sortField === "timestamp" ? (
                        sortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-brand-primary font-bold" /> : <ArrowDown className="h-3.5 w-3.5 text-brand-primary font-bold" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40 hover:opacity-100" />
                      )}
                    </button>
                  </th>

                  {/* Sortable User */}
                  <th scope="col" className="text-left py-3 px-4">
                    <button
                      onClick={() => toggleSort("userName")}
                      className="flex items-center gap-1.5 font-bold uppercase hover:text-foreground transition-colors cursor-pointer"
                    >
                      <span>User / Actor</span>
                      {sortField === "userName" ? (
                        sortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-brand-primary font-bold" /> : <ArrowDown className="h-3.5 w-3.5 text-brand-primary font-bold" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40 hover:opacity-100" />
                      )}
                    </button>
                  </th>

                  {/* Sortable Action */}
                  <th scope="col" className="text-left py-3 px-4">
                    <button
                      onClick={() => toggleSort("action")}
                      className="flex items-center gap-1.5 font-bold uppercase hover:text-foreground transition-colors cursor-pointer"
                    >
                      <span>Action</span>
                      {sortField === "action" ? (
                        sortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-brand-primary font-bold" /> : <ArrowDown className="h-3.5 w-3.5 text-brand-primary font-bold" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40 hover:opacity-100" />
                      )}
                    </button>
                  </th>

                  <th scope="col" className="text-left py-3 px-4">Entity</th>
                  <th scope="col" className="text-left py-3 px-4 hidden md:table-cell">Entity ID</th>
                  <th scope="col" className="text-left py-3 px-4 hidden lg:table-cell">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Loading audit log entries...</td></tr>
                ) : sorted.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-muted-foreground font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-3 px-4 font-semibold text-foreground">{log.userName}</td>
                    <td className="py-3 px-4">
                      <Badge variant={(actionColors[log.action] as "success" | "destructive" | "warning" | "secondary") || "secondary"} className="text-[10px] px-2 py-0.5">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">{log.entity}</td>
                    <td className="py-3 px-4 hidden md:table-cell font-mono text-muted-foreground">{log.entityId}</td>
                    <td className="py-3 px-4 hidden lg:table-cell font-mono text-muted-foreground">{log.ip}</td>
                  </tr>
                ))}
                {!isLoading && sorted.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No matching audit logs found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
