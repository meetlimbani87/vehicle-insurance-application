import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, FileText, CheckCircle, XCircle, CreditCard, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { mockPolicies } from "@/mock/mockPolicies";
import { mockClaims } from "@/mock/mockClaims";
import { toast } from "sonner";

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

const monthlyClaimsData = [
  { month: "Jan", count: 12 }, { month: "Feb", count: 8 }, { month: "Mar", count: 15 },
  { month: "Apr", count: 10 }, { month: "May", count: 18 }, { month: "Jun", count: 14 },
  { month: "Jul", count: 20 }, { month: "Aug", count: 16 }, { month: "Sep", count: 22 },
  { month: "Oct", count: 11 }, { month: "Nov", count: 9 }, { month: "Dec", count: 13 },
];

const vehicleDistribution = [
  { type: "Car", count: 45, color: "#1E3A5F" },
  { type: "SUV", count: 25, color: "#2E75B6" },
  { type: "Two Wheeler", count: 20, color: "#16A085" },
  { type: "Commercial", count: 10, color: "#F59E0B" },
];

export default function AdminDashboardPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const activePolicies = mockPolicies.filter((p) => p.status === "Active").length;
  const totalClaims = mockClaims.length;
  const claimedCount = mockClaims.filter((c) => c.status === "Approved" || c.status === "Closed").length;
  const unclaimedCount = totalClaims - claimedCount;
  const premiumCollected = mockPolicies.reduce((sum, p) => sum + p.premiumAmount, 0);
  const maxCount = Math.max(...monthlyClaimsData.map((d) => d.count));

  const kpis = [
    { title: "Total Policies", value: mockPolicies.length, icon: Shield, color: "text-brand-primary", bg: "bg-brand-primary/10" },
    { title: "Total Claims", value: totalClaims, icon: FileText, color: "text-brand-secondary", bg: "bg-brand-secondary/10" },
    { title: "Claimed", value: claimedCount, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Unclaimed", value: unclaimedCount, icon: XCircle, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Premium Collected", value: `₹${premiumCollected.toLocaleString()}`, icon: CreditCard, color: "text-brand-accent", bg: "bg-emerald-50" },
  ];

  const totalVehicles = vehicleDistribution.reduce((s, v) => s + v.count, 0);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Maintenance</span>
          <Switch checked={maintenanceMode} onCheckedChange={() => setShowDialog(true)} />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                    <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.title}</p>
                    <p className="text-xl font-bold">{kpi.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Claims Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-48">
              {monthlyClaimsData.map((d) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium">{d.count}</span>
                  <motion.div
                    className="w-full bg-brand-secondary rounded-t-md"
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.count / maxCount) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  />
                  <span className="text-xs text-muted-foreground">{d.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Distribution Donut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vehicle Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-5">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {(() => {
                    let offset = 0;
                    return vehicleDistribution.map((v) => {
                      const pct = (v.count / totalVehicles) * 100;
                      const dashArray = `${pct * 2.51} ${251.2 - pct * 2.51}`;
                      const el = (
                        <circle
                          key={v.type}
                          cx="50" cy="50" r="40"
                          fill="none"
                          stroke={v.color}
                          strokeWidth="12"
                          strokeDasharray={dashArray}
                          strokeDashoffset={-offset * 2.512}
                          className="transition-all duration-500"
                        />
                      );
                      offset += pct;
                      return el;
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-xl font-bold">{totalVehicles}</p>
                </div>
              </div>
              <div className="space-y-2">
                {vehicleDistribution.map((v) => (
                  <div key={v.type} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: v.color }} />
                    <span className="text-sm">{v.type}</span>
                    <span className="text-sm font-medium ml-auto">{v.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogHeader>
          <DialogTitle>Toggle Maintenance Mode</DialogTitle>
          <DialogDescription>
            {maintenanceMode
              ? "Are you sure you want to disable maintenance mode? Users will be able to access the system."
              : "Are you sure you want to enable maintenance mode? Users will see a maintenance message."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
          <Button onClick={() => {
            setMaintenanceMode(!maintenanceMode);
            setShowDialog(false);
            toast.success(`Maintenance mode ${!maintenanceMode ? "enabled" : "disabled"}`);
          }}>
            Confirm
          </Button>
        </DialogFooter>
      </Dialog>
    </motion.div>
  );
}
