import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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

  const filtered = mockAuditLogs.filter((log) => {
    if (actionFilter && log.action !== actionFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!log.userName.toLowerCase().includes(s) && !log.entity.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const uniqueActions = [...new Set(mockAuditLogs.map((l) => l.action))];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <PageHeader
        title="Audit Logs"
        description="Track all system activities"
        actions={
          <Button variant="outline" onClick={() => toast.info("CSV export coming soon")}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by user or entity..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select
          options={uniqueActions.map((a) => ({ value: a, label: a }))}
          placeholder="All Actions"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="sm:w-48"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">Timestamp</th>
                  <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                  <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">Action</th>
                  <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">Entity</th>
                  <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Entity ID</th>
                  <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">IP</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-3 px-4 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-3 px-4 font-medium">{log.userName}</td>
                    <td className="py-3 px-4">
                      <Badge variant={(actionColors[log.action] as "success" | "destructive" | "warning" | "secondary") || "secondary"}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{log.entity}</td>
                    <td className="py-3 px-4 hidden md:table-cell font-mono text-xs">{log.entityId}</td>
                    <td className="py-3 px-4 hidden lg:table-cell font-mono text-xs">{log.ip}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No audit logs found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
